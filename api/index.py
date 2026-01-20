from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone

# Load environment variables if .env exists
load_dotenv()

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL')
db_name = os.environ.get('DB_NAME')

if mongo_url and db_name:
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
else:
    # Fallback or dummy for build time
    db = None

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    category: str  # "sneakers" or "phones"
    image_url: str
    brand: str
    condition: str  # "new" or "used"
    sizes: Optional[List[str]] = None
    stock: int = 10

class CartItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    product_id: str
    quantity: int
    size: Optional[str] = None

class Cart(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    session_id: str
    items: List[CartItem]
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    items: List[CartItem]
    total: float
    currency: str
    customer_name: str
    customer_email: str
    shipping_address: str
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderCreate(BaseModel):
    session_id: str
    items: List[CartItem]
    total: float
    currency: str
    customer_name: str
    customer_email: str
    shipping_address: str

# Routes
@api_router.get("/")
async def root():
    return {"message": "Odyssey Finds API"}

@api_router.get("/products", response_model=List[Product])
async def get_products(category: Optional[str] = None, condition: Optional[str] = None):
    query = {}
    if category:
        query["category"] = category
    if condition:
        query["condition"] = condition
    
    products = await db.products.find(query, {"_id": 0}).to_list(100)
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@api_router.post("/cart/{session_id}")
async def add_to_cart(session_id: str, item: CartItem):
    cart = await db.carts.find_one({"session_id": session_id}, {"_id": 0})
    
    if cart:
        # Update existing cart
        items = cart.get("items", [])
        # Check if item already exists
        found = False
        for existing_item in items:
            if existing_item["product_id"] == item.product_id and existing_item.get("size") == item.size:
                existing_item["quantity"] += item.quantity
                found = True
                break
        
        if not found:
            items.append(item.model_dump())
        
        await db.carts.update_one(
            {"session_id": session_id},
            {"$set": {"items": items, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
    else:
        # Create new cart
        new_cart = Cart(session_id=session_id, items=[item])
        cart_dict = new_cart.model_dump()
        cart_dict["updated_at"] = cart_dict["updated_at"].isoformat()
        await db.carts.insert_one(cart_dict)
    
    return {"message": "Item added to cart"}

@api_router.get("/cart/{session_id}")
async def get_cart(session_id: str):
    cart = await db.carts.find_one({"session_id": session_id}, {"_id": 0})
    if not cart:
        return {"session_id": session_id, "items": []}
    
    # Get full product details for each item
    items_with_details = []
    for item in cart.get("items", []):
        product = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
        if product:
            items_with_details.append({
                **item,
                "product": product
            })
    
    return {"session_id": session_id, "items": items_with_details}

@api_router.put("/cart/{session_id}")
async def update_cart(session_id: str, items: List[CartItem]):
    items_dict = [item.model_dump() for item in items]
    await db.carts.update_one(
        {"session_id": session_id},
        {"$set": {"items": items_dict, "updated_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True
    )
    return {"message": "Cart updated"}

@api_router.delete("/cart/{session_id}")
async def clear_cart(session_id: str):
    await db.carts.delete_one({"session_id": session_id})
    return {"message": "Cart cleared"}

@api_router.post("/orders", response_model=Order)
async def create_order(order_input: OrderCreate):
    order = Order(**order_input.model_dump())
    order_dict = order.model_dump()
    order_dict["created_at"] = order_dict["created_at"].isoformat()
    
    await db.orders.insert_one(order_dict)
    
    # Clear the cart after order
    await db.carts.delete_one({"session_id": order_input.session_id})
    
    return order

@api_router.get("/currency/rates")
async def get_currency_rates():
    # Fallback rates
    return {
        "USD": 1.0,
        "EUR": 0.92,
        "GBP": 0.79,
        "JPY": 149.5,
        "ZAR": 18.5
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

# Seed database with sample products
@app.on_event("startup")
async def seed_database():
    # Check if products already exist
    existing = await db.products.find_one({})
    if existing:
        logger.info("Database already seeded")
        return
    
    sample_products = [
        {
            "id": str(uuid.uuid4()),
            "name": "Classic Comfort Runner",
            "description": "Premium leather sneakers with cushioned sole. Street-ready comfort meets timeless aesthetics.",
            "price": 189.99,
            "category": "sneakers",
            "image_url": "https://images.unsplash.com/photo-1757343432297-9ed369786199?w=800",
            "brand": "Nike",
            "condition": "new",
            "sizes": ["8", "9", "10", "11", "12"],
            "stock": 15
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Checkerboard Lux",
            "description": "Limited edition checkered pattern. Urban legend status.",
            "price": 159.99,
            "category": "sneakers",
            "image_url": "https://images.unsplash.com/photo-1629439612315-b69e9236c8e1?w=800",
            "brand": "Vans",
            "condition": "new",
            "sizes": ["7", "8", "9", "10", "11"],
            "stock": 8
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Street Pastel Runner",
            "description": "Soft pink colorway with premium materials. Stand out from the crowd.",
            "price": 149.99,
            "category": "sneakers",
            "image_url": "https://images.unsplash.com/photo-1620114884004-0406e8e0d476?w=800",
            "brand": "Adidas",
            "condition": "new",
            "sizes": ["7", "8", "9", "10"],
            "stock": 12
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Urban High-Top Black",
            "description": "Classic black high-top sneakers. Never goes out of style.",
            "price": 129.99,
            "category": "sneakers",
            "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
            "brand": "Converse",
            "condition": "new",
            "sizes": ["8", "9", "10", "11", "12"],
            "stock": 20
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Pro Max Obsidian",
            "description": "iPhone 14 Pro Max in pristine condition. 256GB storage, flawless display.",
            "price": 899.99,
            "category": "phones",
            "image_url": "https://images.unsplash.com/photo-1759588071847-6ba0f3dbd16e?w=800",
            "brand": "Apple",
            "condition": "used",
            "sizes": None,
            "stock": 3
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Galaxy S23 Ultra",
            "description": "Samsung flagship in excellent condition. 512GB, night mode camera beast.",
            "price": 799.99,
            "category": "phones",
            "image_url": "https://images.unsplash.com/photo-1636462060335-a0e53fcba38f?w=800",
            "brand": "Samsung",
            "condition": "used",
            "sizes": None,
            "stock": 5
        },
        {
            "id": str(uuid.uuid4()),
            "name": "iPhone 13 Pro",
            "description": "Like new condition. 128GB, includes original box and accessories.",
            "price": 649.99,
            "category": "phones",
            "image_url": "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=800",
            "brand": "Apple",
            "condition": "used",
            "sizes": None,
            "stock": 4
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Pixel 8 Pro",
            "description": "Google's finest. Excellent condition, best-in-class camera.",
            "price": 599.99,
            "category": "phones",
            "image_url": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800",
            "brand": "Google",
            "condition": "used",
            "sizes": None,
            "stock": 6
        }
    ]
    
    await db.products.insert_many(sample_products)
    logger.info(f"Seeded {len(sample_products)} products")