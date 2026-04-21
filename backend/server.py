from fastapi import FastAPI, APIRouter, HTTPException, Depends, Query, Request, UploadFile, File
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr, field_validator, HttpUrl
from typing import List, Optional, Union
import uuid
import re
import unicodedata
import cloudinary
import cloudinary.uploader
from datetime import datetime, timezone, timedelta
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import bcrypt
import jwt


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env', override=True)
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)


mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]
JWT_SECRET = os.environ['JWT_SECRET']
limiter = Limiter(key_func=get_remote_address)
app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ── Models ──

CATEGORIES = ["Tech", "Fashion", "Home", "Beauty", "Sports", "Food", "Travel", "Books", "Gaming", "Other"]

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=100)
    username: str = Field(min_length=3, max_length=30)
    display_name: Optional[str] = Field(default=None, max_length=50)

class UserLogin(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: str
    email: str
    username: str
    display_name: str
    bio: str
    avatar_url: str
    created_at: str

class UserUpdate(BaseModel):
    display_name: Optional[str] = Field(default=None, max_length=50)
    bio: Optional[str] = Field(default=None, max_length=500)
    avatar_url: Optional[str] = Field(default=None, max_length=500)

class DuplicateProductRequest(BaseModel):
    target_baglist_id: str = Field(min_length=1, max_length=100)



class CustomField(BaseModel):
    key: str = Field(min_length=1, max_length=50)
    value: str = Field(min_length=1, max_length=200)

class SocialLink(BaseModel):
    network: str = Field(min_length=1, max_length=20)
    url: str = Field(min_length=1, max_length=500)

class ProductClick(BaseModel):
    baglist_id: str
    product_id: str

class FollowerCapture(BaseModel):
    email: EmailStr

class ProductCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    image_url: Optional[str] = Field(default="", max_length=500)
    price: Optional[float] = Field(default=None, ge=0)
    currency: Optional[str] = "EUR"
    link: Optional[str] = Field(default="", max_length=2000)
    description: Optional[str] = Field(default="", max_length=1000)
    discount_code: Optional[str] = Field(default="", max_length=50)
    custom_fields: Optional[List[CustomField]] = []
    social_links: Optional[List[SocialLink]] = []

class ProductOut(BaseModel):
    id: str
    name: str
    image_url: str
    price: Optional[float] = None
    currency: str
    link: str
    description: str
    position: int
    discount_code: Optional[str] = ""
    custom_fields: Optional[List[CustomField]] = []
    social_links: Optional[List[SocialLink]] = []
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    

class BagListCreate(BaseModel):
    title: str = Field(min_length=1, max_length=100)
    description: Optional[str] = Field(default="", max_length=500)
    category: Optional[str] = "Other"
    cover_image_url: Optional[str] = Field(default="", max_length=500)
    tags: Optional[List[str]] = []
    is_public: Optional[bool] = True
    slug: Optional[str] = None

class BagListUpdate(BaseModel):
    title: Optional[str] = Field(default=None, max_length=100)
    description: Optional[str] = Field(default=None, max_length=500)
    category: Optional[str] = None
    cover_image_url: Optional[str] = Field(default=None, max_length=500)
    tags: Optional[List[str]] = None
    is_public: Optional[bool] = None

class BagListOut(BaseModel):
    id: str
    user_id: str
    username: str
    display_name: str
    title: str
    description: str
    category: str
    cover_image_url: str
    tags: List[str]
    is_public: bool
    products: List[ProductOut]
    favorites_count: int
    saves_count: int
    created_at: str
    updated_at: str
    slug: Optional[str] = None
    is_favorited: Optional[bool] = False
    is_saved: Optional[bool] = False

# ── Auth Helpers ──
def slugify(text: str) -> str:
    text = unicodedata.normalize('NFKD', text)
    text = text.encode('ascii', 'ignore').decode('ascii')
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'[\s-]+', '-', text)
    text = text.strip('-')
    return text or "baglist"

async def generate_unique_slug(db, base_slug: str, exclude_id: str = None) -> str:
    slug = base_slug
    counter = 1
    while True:
        query = {"slug": slug}
        if exclude_id:
            query["id"] = {"$ne": exclude_id}
        existing = await db.baglists.find_one(query)
        if not existing:
            return slug
        slug = f"{base_slug}-{counter}"
        counter += 1

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str) -> str:
    return jwt.encode({"user_id": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=7)}, JWT_SECRET, algorithm="HS256")

async def get_current_user(authorization: Optional[str] = None):
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
        return user
    except Exception:
        return None

async def require_auth(authorization: str = None):
    from fastapi import Header
    return authorization

# Dependency
from fastapi import Header

async def get_optional_user(authorization: Optional[str] = Header(None)):
    return await get_current_user(authorization)

async def get_required_user(authorization: str = Header(...)):
    user = await get_current_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

# ── Auth Routes ──

@api_router.post("/auth/register")
@limiter.limit("3/minute")
async def register(request: Request, data: UserRegister):
    existing = await db.users.find_one({"$or": [{"email": data.email}, {"username": data.username}]})
    if existing:
        if existing.get("email") == data.email:
            raise HTTPException(status_code=400, detail="Email already exists")
        raise HTTPException(status_code=400, detail="Username already taken")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": data.email,
        "password_hash": hash_password(data.password),
        "username": data.username,
        "display_name": data.display_name or data.username,
        "bio": "",
        "avatar_url": "",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    token = create_token(user_id)
    return {
        "token": token,
        "user": {
            "id": user_id,
            "email": data.email,
            "username": data.username,
            "display_name": user_doc["display_name"],
            "bio": "",
            "avatar_url": "",
            "created_at": user_doc["created_at"]
        }
    }

@api_router.post("/auth/login")
@limiter.limit("5/minute")
async def login(request: Request, data: UserLogin):
    user = await db.users.find_one({"email": data.email}, {"_id": 0})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["id"])
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "username": user["username"],
            "display_name": user["display_name"],
            "bio": user.get("bio", ""),
            "avatar_url": user.get("avatar_url", ""),
            "created_at": user["created_at"]
        }
    }

@api_router.get("/auth/me")
async def get_me(user=Depends(get_required_user)):
    return {
        "id": user["id"],
        "email": user["email"],
        "username": user["username"],
        "display_name": user["display_name"],
        "bio": user.get("bio", ""),
        "avatar_url": user.get("avatar_url", ""),
        "created_at": user["created_at"]
    }

@api_router.put("/auth/me")
async def update_me(data: UserUpdate, user=Depends(get_required_user)):
    allowed = {"display_name", "bio", "avatar_url"}
    update_data = {k: v for k, v in data.items() if k in allowed}
    if update_data:
        await db.users.update_one({"id": user["id"]}, {"$set": update_data})
    updated = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password_hash": 0})
    return updated

# ── BagList Routes ──

@api_router.post("/baglists")
async def create_baglist(data: BagListCreate, user=Depends(get_required_user)):
    baglist_id = str(uuid.uuid4())
    base_slug = slugify(data.title)
    unique_slug = await generate_unique_slug(db, base_slug)
    doc = {
        "id": baglist_id,
        "user_id": user["id"],
        "title": data.title,
        "description": data.description or "",
        "category": data.category or "Other",
        "cover_image_url": data.cover_image_url or "",
        "tags": data.tags or [],
        "is_public": data.is_public if data.is_public is not None else True,
        "products": [],
        "favorites_count": 0,
        "saves_count": 0,
        "slug": unique_slug,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.baglists.insert_one(doc)
    return {
        **{k: v for k, v in doc.items() if k != "_id"},
        "username": user["username"],
        "display_name": user["display_name"],
        "is_favorited": False,
        "is_saved": False
    }

@api_router.get("/baglists")
async def list_baglists(
    category: Optional[str] = None,
    search: Optional[str] = None,
    sort: Optional[str] = "newest",
    page: int = 1,
    limit: int = 20,
    user_id: Optional[str] = None,
    user=Depends(get_optional_user)
):
    query = {"is_public": True}
    if category and category != "All":
        query["category"] = category
    if search:
        safe_search = re.escape(search)
        query["$or"] = [
            {"title": {"$regex": safe_search, "$options": "i"}},
            {"description": {"$regex": safe_search, "$options": "i"}},
            {"tags": {"$regex": safe_search, "$options": "i"}},
            {"products.name": {"$regex": safe_search, "$options": "i"}},
            {"products.description": {"$regex": safe_search, "$options": "i"}}
        ]
    if user_id:
        query["user_id"] = user_id
        if user and user["id"] == user_id:
            del query["is_public"]

    sort_field = {"newest": ("created_at", -1), "oldest": ("created_at", 1), "popular": ("favorites_count", -1), "az": ("title", 1)}
    sort_key, sort_dir = sort_field.get(sort, ("created_at", -1))
    
    skip = (page - 1) * limit
    total = await db.baglists.count_documents(query)
    baglists = await db.baglists.find(query, {"_id": 0}).sort(sort_key, sort_dir).skip(skip).limit(limit).to_list(limit)
    
    current_user_id = user["id"] if user else None
    user_favs = set()
    user_saves = set()
    if current_user_id:
        favs = await db.favorites.find({"user_id": current_user_id}, {"_id": 0, "baglist_id": 1}).to_list(1000)
        user_favs = {f["baglist_id"] for f in favs}
        saves = await db.saves.find({"user_id": current_user_id}, {"_id": 0, "baglist_id": 1}).to_list(1000)
        user_saves = {s["baglist_id"] for s in saves}
    
    user_ids = list(set(b["user_id"] for b in baglists))
    users_list = await db.users.find({"id": {"$in": user_ids}}, {"_id": 0, "id": 1, "username": 1, "display_name": 1}).to_list(100)
    users_map = {u["id"]: u for u in users_list}
    
    results = []
    for b in baglists:
        u = users_map.get(b["user_id"], {})
        results.append({
            **b,
            "username": u.get("username", ""),
            "display_name": u.get("display_name", ""),
            "is_favorited": b["id"] in user_favs,
            "is_saved": b["id"] in user_saves
        })
    
    return {"baglists": results, "total": total, "page": page, "pages": (total + limit - 1) // limit}

@api_router.get("/baglists/my")
async def get_my_baglists(user=Depends(get_required_user)):
    baglists = await db.baglists.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    for b in baglists:
        b["username"] = user["username"]
        b["display_name"] = user["display_name"]
        b["is_favorited"] = False
        b["is_saved"] = False
    return baglists

@api_router.get("/baglists/by-slug/{username}/{slug}")
async def get_baglist_by_slug(username: str, slug: str, user=Depends(get_optional_user)):
    profile = await db.users.find_one({"username": username}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="User not found")
    
    baglist = await db.baglists.find_one({"user_id": profile["id"], "slug": slug}, {"_id": 0})
    if not baglist:
        raise HTTPException(status_code=404, detail="BagList not found")
    
    if not baglist["is_public"]:
        if not user or user["id"] != baglist["user_id"]:
            raise HTTPException(status_code=403, detail="This BagList is private")
    
    is_favorited = False
    is_saved = False
    if user:
        fav = await db.favorites.find_one({"user_id": user["id"], "baglist_id": baglist["id"]})
        is_favorited = fav is not None
        save = await db.saves.find_one({"user_id": user["id"], "baglist_id": baglist["id"]})
        is_saved = save is not None
    
    return {
        **baglist,
        "username": profile.get("username", ""),
        "display_name": profile.get("display_name", ""),
        "avatar_url": profile.get("avatar_url", ""),
        "is_favorited": is_favorited,
        "is_saved": is_saved
    }
@api_router.get("/baglists/{baglist_id}")
async def get_baglist(baglist_id: str, user=Depends(get_optional_user)):
    baglist = await db.baglists.find_one({"id": baglist_id}, {"_id": 0})
    if not baglist:
        raise HTTPException(status_code=404, detail="BagList not found")
    
    if not baglist["is_public"]:
        if not user or user["id"] != baglist["user_id"]:
            raise HTTPException(status_code=403, detail="This BagList is private")
    
    owner = await db.users.find_one({"id": baglist["user_id"]}, {"_id": 0, "id": 1, "username": 1, "display_name": 1, "avatar_url": 1})
    
    is_favorited = False
    is_saved = False
    if user:
        fav = await db.favorites.find_one({"user_id": user["id"], "baglist_id": baglist_id})
        is_favorited = fav is not None
        save = await db.saves.find_one({"user_id": user["id"], "baglist_id": baglist_id})
        is_saved = save is not None
    
    return {
        **baglist,
        "username": owner.get("username", "") if owner else "",
        "display_name": owner.get("display_name", "") if owner else "",
        "avatar_url": owner.get("avatar_url", "") if owner else "",
        "is_favorited": is_favorited,
        "is_saved": is_saved
    }

@api_router.put("/baglists/{baglist_id}")
async def update_baglist(baglist_id: str, data: BagListUpdate, user=Depends(get_required_user)):
    baglist = await db.baglists.find_one({"id": baglist_id, "user_id": user["id"]})
    if not baglist:
        raise HTTPException(status_code=404, detail="BagList not found")
    
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.baglists.update_one({"id": baglist_id}, {"$set": update_data})
    
    updated = await db.baglists.find_one({"id": baglist_id}, {"_id": 0})
    updated["username"] = user["username"]
    updated["display_name"] = user["display_name"]
    updated["is_favorited"] = False
    updated["is_saved"] = False
    return updated

@api_router.delete("/baglists/{baglist_id}")
async def delete_baglist(baglist_id: str, user=Depends(get_required_user)):
    result = await db.baglists.delete_one({"id": baglist_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="BagList not found")
    await db.favorites.delete_many({"baglist_id": baglist_id})
    await db.saves.delete_many({"baglist_id": baglist_id})
    return {"message": "Deleted"}

# ── Product Routes ──

@api_router.post("/baglists/{baglist_id}/products")
async def add_product(baglist_id: str, data: ProductCreate, user=Depends(get_required_user)):
    baglist = await db.baglists.find_one({"id": baglist_id, "user_id": user["id"]}, {"_id": 0})
    if not baglist:
        raise HTTPException(status_code=404, detail="BagList not found")
    
    product = {
        "id": str(uuid.uuid4()),
        "name": data.name,
        "image_url": data.image_url or "",
        "price": data.price if data.price is not None else None,
        "currency": data.currency or "USD",
        "link": data.link or "",
        "description": data.description or "",
        "discount_code": data.discount_code or "",
        "custom_fields": [f.model_dump() for f in data.custom_fields] if data.custom_fields else [],
        "social_links": [s.model_dump() for s in data.social_links] if data.social_links else [],
        "position": len(baglist.get("products", [])),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.baglists.update_one(
        {"id": baglist_id},
        {"$push": {"products": product}, "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return product

@api_router.put("/baglists/{baglist_id}/products/{product_id}")
async def update_product(baglist_id: str, product_id: str, data: ProductCreate, user=Depends(get_required_user)):
    baglist = await db.baglists.find_one({"id": baglist_id, "user_id": user["id"]}, {"_id": 0})
    if not baglist:
        raise HTTPException(status_code=404, detail="BagList not found")
    
    products = baglist.get("products", [])
    for i, p in enumerate(products):
        if p["id"] == product_id:
            products[i] = {**p, "name": data.name, "image_url": data.image_url or "", "price": data.price if data.price is not None else None, "currency": data.currency or "EUR", "link": data.link or "", "description": data.description or "", "discount_code": data.discount_code or "", 
            "custom_fields": [f.model_dump() for f in data.custom_fields] if data.custom_fields is not None else [],
            "social_links": [s.model_dump() for s in data.social_links] if data.social_links is not None else [], "updated_at": datetime.now(timezone.utc).isoformat()}
            break
    else:
        raise HTTPException(status_code=404, detail="Product not found")
    
    await db.baglists.update_one({"id": baglist_id}, {"$set": {"products": products, "updated_at": datetime.now(timezone.utc).isoformat()}})
    return products[i]

@api_router.post("/baglists/{baglist_id}/products/{product_id}/duplicate")
async def duplicate_product(baglist_id: str, product_id: str, data: DuplicateProductRequest, user=Depends(get_required_user)):
    target_baglist_id = data.get("target_baglist_id")
    if not target_baglist_id:
        raise HTTPException(status_code=400, detail="target_baglist_id requerido")
    source = await db.baglists.find_one({"id": baglist_id}, {"_id": 0, "products": 1})
    if not source:
        raise HTTPException(status_code=404, detail="BagList origen no encontrada")
    product = next((p for p in source.get("products", []) if p["id"] == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    target = await db.baglists.find_one({"id": target_baglist_id, "user_id": user["id"]}, {"_id": 0, "products": 1})
    if not target:
        raise HTTPException(status_code=404, detail="BagList destino no encontrada")
    new_product = {
        **product,
        "id": str(uuid.uuid4()),
        "position": len(target.get("products", [])),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.baglists.update_one(
        {"id": target_baglist_id},
        {"$push": {"products": new_product}, "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return new_product

@api_router.delete("/baglists/{baglist_id}/products/{product_id}")
async def delete_product(baglist_id: str, product_id: str, user=Depends(get_required_user)):
    result = await db.baglists.update_one(
        {"id": baglist_id, "user_id": user["id"]},
        {"$pull": {"products": {"id": product_id}}, "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product removed"}

# ── Favorites & Saves ──

@api_router.post("/baglists/{baglist_id}/favorite")
async def toggle_favorite(baglist_id: str, user=Depends(get_required_user)):
    existing = await db.favorites.find_one({"user_id": user["id"], "baglist_id": baglist_id})
    if existing:
        await db.favorites.delete_one({"user_id": user["id"], "baglist_id": baglist_id})
        await db.baglists.update_one({"id": baglist_id}, {"$inc": {"favorites_count": -1}})
        return {"favorited": False}
    else:
        await db.favorites.insert_one({"id": str(uuid.uuid4()), "user_id": user["id"], "baglist_id": baglist_id, "created_at": datetime.now(timezone.utc).isoformat()})
        await db.baglists.update_one({"id": baglist_id}, {"$inc": {"favorites_count": 1}})
        return {"favorited": True}

@api_router.post("/baglists/{baglist_id}/save")
async def toggle_save(baglist_id: str, user=Depends(get_required_user)):
    existing = await db.saves.find_one({"user_id": user["id"], "baglist_id": baglist_id})
    if existing:
        await db.saves.delete_one({"user_id": user["id"], "baglist_id": baglist_id})
        await db.baglists.update_one({"id": baglist_id}, {"$inc": {"saves_count": -1}})
        return {"saved": False}
    else:
        await db.saves.insert_one({"id": str(uuid.uuid4()), "user_id": user["id"], "baglist_id": baglist_id, "created_at": datetime.now(timezone.utc).isoformat()})
        await db.baglists.update_one({"id": baglist_id}, {"$inc": {"saves_count": 1}})
        return {"saved": True}

@api_router.get("/users/me/saved")
async def get_saved(user=Depends(get_required_user)):
    saves = await db.saves.find({"user_id": user["id"]}, {"_id": 0}).to_list(100)
    baglist_ids = [s["baglist_id"] for s in saves]
    baglists = await db.baglists.find({"id": {"$in": baglist_ids}}, {"_id": 0}).to_list(100)
    
    user_ids = list(set(b["user_id"] for b in baglists))
    users_list = await db.users.find({"id": {"$in": user_ids}}, {"_id": 0, "id": 1, "username": 1, "display_name": 1}).to_list(100)
    users_map = {u["id"]: u for u in users_list}
    
    for b in baglists:
        u = users_map.get(b["user_id"], {})
        b["username"] = u.get("username", "")
        b["display_name"] = u.get("display_name", "")
        b["is_favorited"] = False
        b["is_saved"] = True
    return baglists

@api_router.get("/users/me/favorites")
async def get_favorites(user=Depends(get_required_user)):
    favs = await db.favorites.find({"user_id": user["id"]}, {"_id": 0}).to_list(100)
    baglist_ids = [f["baglist_id"] for f in favs]
    baglists = await db.baglists.find({"id": {"$in": baglist_ids}}, {"_id": 0}).to_list(100)
    
    user_ids = list(set(b["user_id"] for b in baglists))
    users_list = await db.users.find({"id": {"$in": user_ids}}, {"_id": 0, "id": 1, "username": 1, "display_name": 1}).to_list(100)
    users_map = {u["id"]: u for u in users_list}
    
    for b in baglists:
        u = users_map.get(b["user_id"], {})
        b["username"] = u.get("username", "")
        b["display_name"] = u.get("display_name", "")
        b["is_favorited"] = True
        b["is_saved"] = False
    return baglists

@api_router.get("/users/{username}")
async def get_user_profile(username: str, user=Depends(get_optional_user)):
    profile = await db.users.find_one({"username": username}, {"_id": 0, "password_hash": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="User not found")
    
    is_own_profile = user and user["id"] == profile["id"]
    query = {"user_id": profile["id"]} if is_own_profile else {"user_id": profile["id"], "is_public": True}
    baglists = await db.baglists.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    for b in baglists:
        b["username"] = profile["username"]
        b["display_name"] = profile["display_name"]
        b["is_favorited"] = False
        b["is_saved"] = False

    # Favoritos públicos del usuario
    favs = await db.favorites.find({"user_id": profile["id"]}, {"_id": 0, "baglist_id": 1}).to_list(100)
    fav_ids = [f["baglist_id"] for f in favs]
    fav_baglists = await db.baglists.find({"id": {"$in": fav_ids}, "is_public": True}, {"_id": 0}).sort("created_at", -1).to_list(100)
    user_ids = list(set(b["user_id"] for b in fav_baglists))
    users_list = await db.users.find({"id": {"$in": user_ids}}, {"_id": 0, "id": 1, "username": 1, "display_name": 1}).to_list(100)
    users_map = {u["id"]: u for u in users_list}
    for b in fav_baglists:
        u = users_map.get(b["user_id"], {})
        b["username"] = u.get("username", "")
        b["display_name"] = u.get("display_name", "")
        b["is_favorited"] = True
        b["is_saved"] = False
    
    return {"user": profile, "baglists": baglists, "favorites": fav_baglists, "is_own_profile": is_own_profile}


@api_router.get("/sitemap")
async def get_sitemap():
    baglists = await db.baglists.find(
        {"is_public": True, "slug": {"$exists": True}},
        {"_id": 0, "slug": 1, "username": 1, "updated_at": 1}
    ).to_list(5000)
    
    users = await db.users.find({}, {"_id": 0, "username": 1}).to_list(1000)
    
    return {
        "baglists": [{"url": f"/list/{b.get('username', '')}/{b['slug']}", "updated_at": b.get("updated_at", "")} for b in baglists if b.get("slug") and b.get("username")],
        "users": [{"url": f"/user/{u['username']}"} for u in users]
    }



@api_router.post("/upload/image")
async def upload_image_file(file: UploadFile = File(...), user=Depends(get_required_user)):
    if not file:
        raise HTTPException(status_code=400, detail="No file provided")
    
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Formato no permitido. Usa JPG, PNG, WEBP o GIF")
    
    if file.size and file.size > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="La imagen no puede superar 5MB")
    contents = await file.read()
    
    try:
        result = cloudinary.uploader.upload(
            contents,
            folder="liser",
            transformation=[{"width": 1200, "crop": "limit"}, {"quality": "auto"}]
        )
        return {"url": result["secure_url"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al subir imagen: {str(e)}")

@api_router.post("/baglists/{baglist_id}/products/{product_id}/click")
@limiter.limit("30/minute")
async def register_click(request: Request, baglist_id: str, product_id: str):
    await db.clicks.insert_one({
        "id": str(uuid.uuid4()),
        "baglist_id": baglist_id,
        "product_id": product_id,
        "type": "affiliate",
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    baglist = await db.baglists.find_one({"id": baglist_id}, {"_id": 0, "products": 1})
    if baglist:
        products = baglist.get("products", [])
        for i, p in enumerate(products):
            if p["id"] == product_id:
                products[i]["clicks"] = p.get("clicks", 0) + 1
                break
        await db.baglists.update_one({"id": baglist_id}, {"$set": {"products": products}})
    return {"ok": True}

@api_router.post("/baglists/{baglist_id}/products/{product_id}/discount-click")
@limiter.limit("30/minute")
async def register_discount_click(request: Request, baglist_id: str, product_id: str):
    await db.clicks.insert_one({
        "id": str(uuid.uuid4()),
        "baglist_id": baglist_id,
        "product_id": product_id,
        "type": "discount",
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    return {"ok": True}


@api_router.post("/baglists/{baglist_id}/follow")
async def follow_baglist(baglist_id: str, data: FollowerCapture):
    existing = await db.followers.find_one({"email": data.email, "baglist_id": baglist_id})
    if not existing:
        await db.followers.insert_one({
            "id": str(uuid.uuid4()),
            "email": data.email,
            "baglist_id": baglist_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    return {"ok": True}


@api_router.get("/baglists/{baglist_id}/analytics")
async def get_baglist_analytics(baglist_id: str, user=Depends(get_required_user)):
    baglist = await db.baglists.find_one({"id": baglist_id, "user_id": user["id"]}, {"_id": 0})
    if not baglist:
        raise HTTPException(status_code=404, detail="BagList not found")
    clicks = await db.clicks.find({"baglist_id": baglist_id}, {"_id": 0}).to_list(10000)
    affiliate_clicks = [c for c in clicks if c.get("type", "affiliate") == "affiliate"]
    discount_clicks = [c for c in clicks if c.get("type") == "discount"]
    product_affiliate = {}
    product_discount = {}
    for c in affiliate_clicks:
        pid = c["product_id"]
        product_affiliate[pid] = product_affiliate.get(pid, 0) + 1
    for c in discount_clicks:
        pid = c["product_id"]
        product_discount[pid] = product_discount.get(pid, 0) + 1
    monthly = {}
    daily = {}
    for c in affiliate_clicks:
        month = c["created_at"][:7]
        monthly[month] = monthly.get(month, 0) + 1
        day = c["created_at"][:10]
        daily[day] = daily.get(day, 0) + 1
    monthly_sorted = [{"month": k, "clicks": v} for k, v in sorted(monthly.items())]
    daily_sorted = [{"date": k, "clicks": v} for k, v in sorted(daily.items())]
    products = baglist.get("products", [])
    product_stats = sorted([
        {
            "id": p["id"],
            "name": p["name"],
            "image_url": p.get("image_url", ""),
            "clicks": product_affiliate.get(p["id"], 0),
            "discount_clicks": product_discount.get(p["id"], 0)
        }
        for p in products
    ], key=lambda x: x["clicks"], reverse=True)
    followers = await db.followers.count_documents({"baglist_id": baglist_id})
    return {
        "baglist_id": baglist_id,
        "title": baglist["title"],
        "total_clicks": len(affiliate_clicks),
        "total_discount_clicks": len(discount_clicks),
        "favorites_count": baglist.get("favorites_count", 0),
        "saves_count": baglist.get("saves_count", 0),
        "followers": followers,
        "monthly_clicks": monthly_sorted,
        "daily_clicks": daily_sorted,
        "products": product_stats
    }

@api_router.get("/users/me/analytics")
async def get_user_analytics(user=Depends(get_required_user)):
    baglists = await db.baglists.find({"user_id": user["id"]}, {"_id": 0, "id": 1, "title": 1}).to_list(100)
    baglist_ids = [b["id"] for b in baglists]
    clicks = await db.clicks.find({"baglist_id": {"$in": baglist_ids}, "$or": [{"type": "affiliate"}, {"type": {"$exists": False}}]}, {"_id": 0}).to_list(100000)
    baglist_clicks = {}
    monthly = {}
    daily = {}
    for c in clicks:
        bid = c["baglist_id"]
        baglist_clicks[bid] = baglist_clicks.get(bid, 0) + 1
        month = c["created_at"][:7]
        monthly[month] = monthly.get(month, 0) + 1
        day = c["created_at"][:10]
        daily[day] = daily.get(day, 0) + 1
    monthly_sorted = [{"month": k, "clicks": v} for k, v in sorted(monthly.items())]
    daily_sorted = [{"date": k, "clicks": v} for k, v in sorted(daily.items())]
    baglist_stats = sorted([
        {"id": b["id"], "title": b["title"], "clicks": baglist_clicks.get(b["id"], 0)}
        for b in baglists
    ], key=lambda x: x["clicks"], reverse=True)
    return {
        "total_clicks": len(clicks),
        "monthly_clicks": monthly_sorted,
        "daily_clicks": daily_sorted,
        "baglists": baglist_stats
    }


@api_router.get("/categories")
async def get_categories():
    return CATEGORIES

@api_router.get("/")
async def root():
    return {"message": "Liser API"}



app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get('CORS_ORIGINS', 'http://localhost:3000').split(','),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("username", unique=True)
    await db.users.create_index("id", unique=True)
    await db.baglists.create_index("id", unique=True)
    await db.baglists.create_index("user_id")
    await db.baglists.create_index("category")
    await db.favorites.create_index([("user_id", 1), ("baglist_id", 1)], unique=True)
    await db.saves.create_index([("user_id", 1), ("baglist_id", 1)], unique=True)
    await db.followers.create_index([("email", 1), ("baglist_id", 1)], unique=True)
    logger.info("Liser API started, indexes created")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
