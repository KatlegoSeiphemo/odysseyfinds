import requests
import sys
import json
from datetime import datetime

class OdysseyFindsAPITester:
    def __init__(self, base_url="http://localhost:5000"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.session_id = f"test_session_{datetime.now().strftime('%H%M%S')}"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:200]
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "error": str(e)
            })
            return False, {}

    def test_api_root(self):
        """Test API root endpoint"""
        return self.run_test("API Root", "GET", "", 200)

    def test_get_all_products(self):
        """Test getting all products"""
        success, response = self.run_test("Get All Products", "GET", "products", 200)
        if success and isinstance(response, list):
            print(f"   Found {len(response)} products")
            return response
        return []

    def test_get_products_by_category(self):
        """Test category filtering"""
        sneakers_success, sneakers = self.run_test("Get Sneakers", "GET", "products", 200, params={"category": "sneakers"})
        phones_success, phones = self.run_test("Get Phones", "GET", "products", 200, params={"category": "phones"})
        
        if sneakers_success and phones_success:
            print(f"   Sneakers: {len(sneakers)}, Phones: {len(phones)}")
        
        return sneakers_success and phones_success

    def test_get_products_by_condition(self):
        """Test condition filtering"""
        new_success, new_products = self.run_test("Get New Products", "GET", "products", 200, params={"condition": "new"})
        used_success, used_products = self.run_test("Get Used Products", "GET", "products", 200, params={"condition": "used"})
        
        if new_success and used_success:
            print(f"   New: {len(new_products)}, Used: {len(used_products)}")
        
        return new_success and used_success

    def test_get_single_product(self, product_id):
        """Test getting a single product"""
        return self.run_test(f"Get Product {product_id[:8]}", "GET", f"products/{product_id}", 200)

    def test_get_nonexistent_product(self):
        """Test getting a non-existent product"""
        return self.run_test("Get Non-existent Product", "GET", "products/nonexistent", 404)

    def test_cart_operations(self, product_id):
        """Test cart operations"""
        # Add item to cart
        add_success, _ = self.run_test(
            "Add to Cart",
            "POST",
            f"cart/{self.session_id}",
            200,
            data={"product_id": product_id, "quantity": 2}
        )

        if not add_success:
            return False

        # Get cart
        get_success, cart_data = self.run_test(
            "Get Cart",
            "GET",
            f"cart/{self.session_id}",
            200
        )

        if get_success and cart_data.get('items'):
            print(f"   Cart has {len(cart_data['items'])} items")

        # Update cart
        update_success, _ = self.run_test(
            "Update Cart",
            "PUT",
            f"cart/{self.session_id}",
            200,
            data=[{"product_id": product_id, "quantity": 3}]
        )

        return add_success and get_success and update_success

    def test_currency_rates(self):
        """Test currency rates endpoint"""
        success, rates = self.run_test("Get Currency Rates", "GET", "currency/rates", 200)
        if success:
            expected_currencies = ['USD', 'EUR', 'GBP', 'JPY']
            for currency in expected_currencies:
                if currency not in rates:
                    print(f"   ❌ Missing currency: {currency}")
                    return False
            print(f"   ✅ All currencies present: {list(rates.keys())}")
        return success

    def test_order_creation(self, product_id):
        """Test order creation"""
        order_data = {
            "session_id": self.session_id,
            "items": [{"product_id": product_id, "quantity": 1}],
            "total": 199.99,
            "currency": "USD",
            "customer_name": "Test Customer",
            "customer_email": "test@example.com",
            "shipping_address": "123 Test St, Test City, TC 12345"
        }
        
        return self.run_test("Create Order", "POST", "orders", 200, data=order_data)

    def test_cart_clear_after_order(self):
        """Test that cart is cleared after order"""
        success, cart_data = self.run_test(
            "Get Cart After Order",
            "GET",
            f"cart/{self.session_id}",
            200
        )
        
        if success:
            items_count = len(cart_data.get('items', []))
            if items_count == 0:
                print("   ✅ Cart cleared successfully")
                return True
            else:
                print(f"   ❌ Cart still has {items_count} items")
                return False
        return False

def main():
    print("🚀 Starting Odyssey Finds API Tests")
    print("=" * 50)
    
    tester = OdysseyFindsAPITester()
    
    # Test API root
    tester.test_api_root()
    
    # Test products endpoints
    products = tester.test_get_all_products()
    if not products:
        print("❌ No products found, stopping tests")
        return 1
    
    # Get a sample product for further testing
    sample_product = products[0] if products else None
    if sample_product:
        product_id = sample_product.get('id')
        print(f"\n📦 Using sample product: {sample_product.get('name')} (ID: {product_id[:8]}...)")
    else:
        print("❌ No sample product available")
        return 1
    
    # Test product filtering
    tester.test_get_products_by_category()
    tester.test_get_products_by_condition()
    
    # Test single product
    tester.test_get_single_product(product_id)
    tester.test_get_nonexistent_product()
    
    # Test cart operations
    tester.test_cart_operations(product_id)
    
    # Test currency rates
    tester.test_currency_rates()
    
    # Test order creation
    tester.test_order_creation(product_id)
    
    # Test cart clearing after order
    tester.test_cart_clear_after_order()
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Tests completed: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.failed_tests:
        print("\n❌ Failed tests:")
        for failure in tester.failed_tests:
            print(f"   - {failure}")
    
    success_rate = (tester.tests_passed / tester.tests_run) * 100 if tester.tests_run > 0 else 0
    print(f"📈 Success rate: {success_rate:.1f}%")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())