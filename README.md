# Odyssey Finds

Odyssey Finds is a curated e-commerce platform for high-quality products.

## Project Structure

- `frontend/`: React-based frontend using Tailwind CSS and Radix UI.
- `api/`: FastAPI-based serverless backend optimized for Vercel.
- `backend/`: Original local development server.

## Deployment on Vercel

The project is configured for seamless deployment on Vercel.

### 1. Environment Variables
Ensure you set the following environment variables in your Vercel Project Settings:
- `MONGO_URL`: Your MongoDB connection string.
- `DB_NAME`: The name of your database (e.g., `odysseyfinds`).

### 2. Deployment Steps
1. Push this repository to GitHub/GitLab/Bitbucket.
2. Import the project into Vercel.
3. Vercel will automatically detect the configuration and deploy both the frontend and the API.

## Local Development

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm start`

### Backend
1. `cd backend`
2. `pip install -r requirements.txt`
3. `python server.py`
