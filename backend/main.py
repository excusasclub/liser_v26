from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from pathlib import Path
from dotenv import load_dotenv
import os
import cloudinary
import logging

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env', override=True)

cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)

from app.routers import auth, baglists, users, upload, admin
from app.config import CATEGORIES

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

limiter = Limiter(key_func=get_remote_address)
app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get('CORS_ORIGINS', 'http://localhost:3000').split(','),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(baglists.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(upload.router, prefix="/api")
app.include_router(admin.router, prefix="/api")

@app.get("/api/categories")
async def get_categories():
    return CATEGORIES

@app.get("/api/sitemap")
async def get_sitemap():
    from app.database import db
    baglists = await db.baglists.find(
        {"is_public": True, "slug": {"$exists": True}},
        {"_id": 0, "slug": 1, "username": 1, "updated_at": 1}
    ).to_list(5000)
    users = await db.users.find({}, {"_id": 0, "username": 1}).to_list(1000)
    return {
        "baglists": [{"url": f"/list/{b.get('username', '')}/{b['slug']}", "updated_at": b.get("updated_at", "")} for b in baglists if b.get("slug") and b.get("username")],
        "users": [{"url": f"/user/{u['username']}"} for u in users]
    }

@app.get("/api/")
async def root():
    return {"message": "Liser API"}