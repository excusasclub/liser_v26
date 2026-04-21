from pathlib import Path
from dotenv import load_dotenv
import os

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env', override=True)

MONGO_URL = os.environ['MONGO_URL']
DB_NAME = os.environ['DB_NAME']
JWT_SECRET = os.environ['JWT_SECRET']

CATEGORIES = ["Tech", "Fashion", "Home", "Beauty", "Sports", "Food", "Travel", "Books", "Gaming", "Other"]

PLAN_LIMITS = {
    "free": {
        "max_baglists": 10,
        "max_products_per_list": 30,
        "analytics": True,
        "custom_fields": True,
        "social_links": True,
        "private_lists": True,
        "max_image_size_mb": 5,
    },
    "pro": {
        "max_baglists": 100,
        "max_products_per_list": 200,
        "analytics": True,
        "custom_fields": True,
        "social_links": True,
        "private_lists": True,
        "max_image_size_mb": 10,
    },
    "premium": {
        "max_baglists": -1,
        "max_products_per_list": -1,
        "analytics": True,
        "custom_fields": True,
        "social_links": True,
        "private_lists": True,
        "max_image_size_mb": 20,
    },
}