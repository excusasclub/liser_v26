from fastapi import Header, HTTPException
from typing import Optional
from app.database import db
from app.services.auth_service import decode_token
from app.config import PLAN_LIMITS

async def get_current_user(authorization: Optional[str] = None):
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ")[1]
    try:
        payload = decode_token(token)
        user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
        return user
    except Exception:
        return None

async def get_optional_user(authorization: Optional[str] = Header(None)):
    return await get_current_user(authorization)

async def get_required_user(authorization: str = Header(...)):
    user = await get_current_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

async def get_required_admin(authorization: str = Header(...)):
    user = await get_current_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Acceso restringido a administradores")
    return user

async def get_user_with_plan(authorization: str = Header(...)):
    user = await get_current_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    plan = user.get("plan", "free")
    limits = PLAN_LIMITS.get(plan, PLAN_LIMITS["free"])
    return {**user, "plan": plan, "limits": limits}

def require_feature(feature: str):
    async def _check(authorization: str = Header(...)):
        user = await get_current_user(authorization)
        if not user:
            raise HTTPException(status_code=401, detail="Not authenticated")
        plan = user.get("plan", "free")
        limits = PLAN_LIMITS.get(plan, PLAN_LIMITS["free"])
        if not limits.get(feature, False):
            raise HTTPException(status_code=403, detail=f"Tu plan '{plan}' no incluye esta función. Mejora tu plan.")
        return {**user, "plan": plan, "limits": limits}
    return _check