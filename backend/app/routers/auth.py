from fastapi import APIRouter, HTTPException, Depends, Request
from app.models.user import UserRegister, UserLogin, UserUpdate
from app.services.auth_service import hash_password, verify_password, create_token
from app.dependencies import get_required_user
from app.database import db
from slowapi import Limiter
from slowapi.util import get_remote_address
from datetime import datetime, timezone
import uuid

limiter = Limiter(key_func=get_remote_address)
router = APIRouter(prefix="/auth")

@router.post("/register")
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
        "role": "user",
        "plan": "free",
        "suspended": False,
        "last_login": None,
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
            "role": "user",
            "plan": "free",
            "created_at": user_doc["created_at"]
        }
    }

@router.post("/login")
@limiter.limit("5/minute")
async def login(request: Request, data: UserLogin):
    user = await db.users.find_one({"email": data.email}, {"_id": 0})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    await db.users.update_one({"id": user["id"]}, {"$set": {"last_login": datetime.now(timezone.utc).isoformat()}})
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
            "role": user.get("role", "user"),
            "plan": user.get("plan", "free"),
            "created_at": user["created_at"]
        }
    }

@router.get("/me")
async def get_me(user=Depends(get_required_user)):
    return {
        "id": user["id"],
        "email": user["email"],
        "username": user["username"],
        "display_name": user["display_name"],
        "bio": user.get("bio", ""),
        "avatar_url": user.get("avatar_url", ""),
        "role": user.get("role", "user"),
        "plan": user.get("plan", "free"),
        "created_at": user["created_at"]
    }

@router.put("/me")
async def update_me(data: UserUpdate, user=Depends(get_required_user)):
    update_data = {k: v for k, v in data.model_dump(exclude_none=True).items()}
    if update_data:
        await db.users.update_one({"id": user["id"]}, {"$set": update_data})
    updated = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password_hash": 0})
    return updated