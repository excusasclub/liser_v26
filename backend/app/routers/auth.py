from fastapi import APIRouter, HTTPException, Depends, Request
from app.models.user import UserRegister, UserLogin, UserUpdate
from app.services.auth_service import hash_password, verify_password, create_token
from app.dependencies import get_required_user
from app.database import db
from slowapi import Limiter
from slowapi.util import get_remote_address
from datetime import datetime, timezone
import uuid
from fastapi.responses import RedirectResponse
import httpx
import os
import secrets
from app.services.resend_service import send_welcome, send_reset_password

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
    try:
        await send_welcome(data.email, data.username)
    except Exception:
        pass
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

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "https://api.liser.es/api/auth/google/callback")
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://app.liser.es")

@router.get("/google")
async def google_login():
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
    }
    from urllib.parse import urlencode
    url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
    return RedirectResponse(url)

@router.get("/google/callback")
async def google_callback(code: str):
    async with httpx.AsyncClient() as client:
        token_res = await client.post("https://oauth2.googleapis.com/token", data={
            "code": code,
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri": GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        })
        token_data = token_res.json()
        access_token = token_data.get("access_token")
        if not access_token:
            return RedirectResponse(f"{FRONTEND_URL}/auth?error=google_failed")

        user_res = await client.get("https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"})
        google_user = user_res.json()

    email = google_user.get("email")
    name = google_user.get("name", "")
    avatar = google_user.get("picture", "")
    google_id = google_user.get("id")

    if not email:
        return RedirectResponse(f"{FRONTEND_URL}/auth?error=no_email")

    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        await db.users.update_one({"id": existing["id"]}, {
            "$set": {"last_login": datetime.now(timezone.utc).isoformat(), "avatar_url": avatar or existing.get("avatar_url", "")}
        })
        token = create_token(existing["id"])
    else:
        base_username = email.split("@")[0].lower().replace(".", "_")
        username = base_username
        counter = 1
        while await db.users.find_one({"username": username}):
            username = f"{base_username}{counter}"
            counter += 1

        user_id = str(uuid.uuid4())
        user_doc = {
            "id": user_id,
            "email": email,
            "password_hash": "",
            "username": username,
            "display_name": name or username,
            "bio": "",
            "avatar_url": avatar,
            "role": "user",
            "plan": "free",
            "suspended": False,
            "google_id": google_id,
            "last_login": datetime.now(timezone.utc).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
        token = create_token(user_id)

    if existing:
        return RedirectResponse(f"{FRONTEND_URL}/auth/google?token={token}")
    return RedirectResponse(f"{FRONTEND_URL}/choose-username?token={token}")

@router.post("/forgot-password")
async def forgot_password(body: dict):
    email = body.get("email", "").strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="Email requerido")
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user:
        return {"ok": True}
    reset_token = secrets.token_urlsafe(32)
    expires_at = (datetime.now(timezone.utc).timestamp() + 3600)
    await db.users.update_one({"email": email}, {"$set": {"reset_token": reset_token, "reset_token_expires": expires_at}})
    await send_reset_password(email, user["username"], reset_token)
    return {"ok": True}


@router.post("/reset-password")
async def reset_password(body: dict):
    token = body.get("token", "")
    new_password = body.get("password", "")
    if not token or not new_password:
        raise HTTPException(status_code=400, detail="Datos incompletos")
    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail="Mínimo 6 caracteres")
    user = await db.users.find_one({"reset_token": token}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=400, detail="Token inválido")
    if datetime.now(timezone.utc).timestamp() > user.get("reset_token_expires", 0):
        raise HTTPException(status_code=400, detail="Token expirado")
    from app.services.auth_service import hash_password
    await db.users.update_one({"reset_token": token}, {
        "$set": {"password_hash": hash_password(new_password)},
        "$unset": {"reset_token": "", "reset_token_expires": ""}
    })
    return {"ok": True}

@router.delete("/me")
async def delete_account(user=Depends(get_required_user)):
    user_id = user["id"]
    await db.baglists.delete_many({"user_id": user_id})
    await db.favorites.delete_many({"user_id": user_id})
    await db.saves.delete_many({"user_id": user_id})
    await db.followers.delete_many({"user_id": user_id})
    await db.users.delete_one({"id": user_id})
    return {"ok": True}