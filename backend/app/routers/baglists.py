from fastapi import APIRouter, HTTPException, Depends, Query, Request
from app.dependencies import get_required_user, get_optional_user, get_verified_user
from app.models.baglist import BagListCreate, BagListUpdate
from app.models.product import ProductCreate, DuplicateProductRequest, FollowerCapture
from app.database import db
from app.utils.slugify import slugify, generate_unique_slug
from app.services.resend_service import send_follower_notification
from slowapi import Limiter
from slowapi.util import get_remote_address
from typing import Optional
from datetime import datetime, timezone
import uuid
import re

limiter = Limiter(key_func=get_remote_address)
router = APIRouter(prefix="/baglists")

@router.post("")
async def create_baglist(data: BagListCreate, user=Depends(get_verified_user)):
    from app.config import PLAN_LIMITS
    plan = user.get("plan", "free")
    limits = PLAN_LIMITS.get(plan, PLAN_LIMITS["free"])
    user_baglists_count = await db.baglists.count_documents({"user_id": user["id"]})
    if user_baglists_count >= limits["max_baglists"]:
        raise HTTPException(status_code=403, detail=f"Has alcanzado el límite de {limits['max_baglists']} BagLists para el plan {plan}")
    baglist_id = str(uuid.uuid4())
    base_slug = slugify(data.title)
    unique_slug = await generate_unique_slug(db, base_slug)
    doc = {
        "id": baglist_id,
        "user_id": user["id"],
        "username": user["username"],
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
    return {**{k: v for k, v in doc.items() if k != "_id"}, "username": user["username"], "display_name": user["display_name"], "is_favorited": False, "is_saved": False}

@router.get("")
async def list_baglists(
    category: Optional[str] = None,
    search: Optional[str] = None,
    sort: Optional[str] = "newest",
    page: int = 1,
    limit: int = 20,
    user_id: Optional[str] = None,
    featured: Optional[bool] = None,
    user=Depends(get_optional_user)
):
    query = {"is_public": True}
    if category and category != "All":
        query["category"] = category
    if featured:
        query["featured"] = True
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
        results.append({**b, "username": u.get("username", ""), "display_name": u.get("display_name", ""), "is_favorited": b["id"] in user_favs, "is_saved": b["id"] in user_saves})
    return {"baglists": results, "total": total, "page": page, "pages": (total + limit - 1) // limit}

@router.get("/my")
async def get_my_baglists(user=Depends(get_required_user)):
    baglists = await db.baglists.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    for b in baglists:
        b["username"] = user["username"]
        b["display_name"] = user["display_name"]
        b["is_favorited"] = False
        b["is_saved"] = False
    return baglists

@router.get("/by-slug/{username}/{slug}")
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
    return {**baglist, "username": profile.get("username", ""), "display_name": profile.get("display_name", ""), "avatar_url": profile.get("avatar_url", ""), "is_favorited": is_favorited, "is_saved": is_saved}

@router.get("/{baglist_id}")
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
    return {**baglist, "username": owner.get("username", "") if owner else "", "display_name": owner.get("display_name", "") if owner else "", "avatar_url": owner.get("avatar_url", "") if owner else "", "is_favorited": is_favorited, "is_saved": is_saved}

@router.put("/{baglist_id}")
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
    if updated.get("is_public"):
        try:
            followers = await db.followers.find({"baglist_id": baglist_id}, {"_id": 0, "email": 1}).to_list(1000)
            for f in followers:
                await send_follower_notification(f["email"], user["username"], updated["title"], updated.get("slug", baglist_id))
        except Exception:
            pass
    return updated

@router.delete("/{baglist_id}")
async def delete_baglist(baglist_id: str, user=Depends(get_required_user)):
    result = await db.baglists.delete_one({"id": baglist_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="BagList not found")
    await db.favorites.delete_many({"baglist_id": baglist_id})
    await db.saves.delete_many({"baglist_id": baglist_id})
    return {"message": "Deleted"}

@router.post("/{baglist_id}/products")
async def add_product(baglist_id: str, data: ProductCreate, user=Depends(get_verified_user)):
    from app.config import PLAN_LIMITS
    baglist = await db.baglists.find_one({"id": baglist_id, "user_id": user["id"]}, {"_id": 0})
    if not baglist:
        raise HTTPException(status_code=404, detail="BagList not found")
    plan = user.get("plan", "free")
    limits = PLAN_LIMITS.get(plan, PLAN_LIMITS["free"])
    current_products = len(baglist.get("products", []))
    if current_products >= limits["max_products_per_list"]:
        raise HTTPException(status_code=403, detail=f"Has alcanzado el límite de {limits['max_products_per_list']} productos por BagList para el plan {plan}")
    product = {
        "id": str(uuid.uuid4()),
        "name": data.name,
        "image_url": data.image_url or "",
        "price": data.price if data.price is not None else None,
        "currency": data.currency or "EUR",
        "link": (lambda l: f"https://{l}" if l and not l.startswith(('http://', 'https://')) else l or "")(data.link),
        "description": data.description or "",
        "discount_code": data.discount_code or "",
        "custom_fields": [f.model_dump() for f in data.custom_fields] if data.custom_fields else [],
        "social_links": [s.model_dump() for s in data.social_links] if data.social_links else [],
        "position": len(baglist.get("products", [])),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.baglists.update_one({"id": baglist_id}, {"$push": {"products": product}, "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}})
    return product

@router.put("/{baglist_id}/products/{product_id}")
async def update_product(baglist_id: str, product_id: str, data: ProductCreate, user=Depends(get_required_user)):
    baglist = await db.baglists.find_one({"id": baglist_id, "user_id": user["id"]}, {"_id": 0})
    if not baglist:
        raise HTTPException(status_code=404, detail="BagList not found")
    products = baglist.get("products", [])
    for i, p in enumerate(products):
        if p["id"] == product_id:
            products[i] = {**p, "name": data.name, "image_url": data.image_url or "", "price": data.price if data.price is not None else None, "currency": data.currency or "EUR", "link": (lambda l: f"https://{l}" if l and not l.startswith(('http://', 'https://')) else l or "")(data.link), "description": data.description or "", "discount_code": data.discount_code or "",
                "custom_fields": [f.model_dump() for f in data.custom_fields] if data.custom_fields is not None else [],
                "social_links": [s.model_dump() for s in data.social_links] if data.social_links is not None else [],
                "updated_at": datetime.now(timezone.utc).isoformat()}
            break
    else:
        raise HTTPException(status_code=404, detail="Product not found")
    await db.baglists.update_one({"id": baglist_id}, {"$set": {"products": products, "updated_at": datetime.now(timezone.utc).isoformat()}})
    return products[i]

@router.post("/{baglist_id}/products/{product_id}/duplicate")
async def duplicate_product(baglist_id: str, product_id: str, data: DuplicateProductRequest, user=Depends(get_required_user)):
    source = await db.baglists.find_one({"id": baglist_id}, {"_id": 0, "products": 1, "user_id": 1, "is_public": 1})
    if not source:
        raise HTTPException(status_code=404, detail="BagList origen no encontrada")
    if source.get("user_id") != user["id"] and not source.get("is_public", False):
        raise HTTPException(status_code=403, detail="No tienes permiso para copiar de esta lista")
    product = next((p for p in source.get("products", []) if p["id"] == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    target = await db.baglists.find_one({"id": data.target_baglist_id, "user_id": user["id"]}, {"_id": 0, "products": 1})
    if not target:
        raise HTTPException(status_code=404, detail="BagList destino no encontrada")
    new_product = {**product, "id": str(uuid.uuid4()), "position": len(target.get("products", [])), "created_at": datetime.now(timezone.utc).isoformat(), "updated_at": datetime.now(timezone.utc).isoformat()}
    await db.baglists.update_one({"id": data.target_baglist_id}, {"$push": {"products": new_product}, "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}})
    return new_product

@router.delete("/{baglist_id}/products/{product_id}")
async def delete_product(baglist_id: str, product_id: str, user=Depends(get_required_user)):
    result = await db.baglists.update_one(
        {"id": baglist_id, "user_id": user["id"]},
        {"$pull": {"products": {"id": product_id}}, "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product removed"}

@router.post("/{baglist_id}/favorite")
async def toggle_favorite(baglist_id: str, user=Depends(get_required_user)):
    existing = await db.favorites.find_one({"user_id": user["id"], "baglist_id": baglist_id})
    if existing:
        await db.favorites.delete_one({"user_id": user["id"], "baglist_id": baglist_id})
        await db.baglists.update_one({"id": baglist_id}, {"$inc": {"favorites_count": -1}})
        return {"favorited": False}
    await db.favorites.insert_one({"id": str(uuid.uuid4()), "user_id": user["id"], "baglist_id": baglist_id, "created_at": datetime.now(timezone.utc).isoformat()})
    await db.baglists.update_one({"id": baglist_id}, {"$inc": {"favorites_count": 1}})
    return {"favorited": True}

@router.post("/{baglist_id}/save")
async def toggle_save(baglist_id: str, user=Depends(get_required_user)):
    existing = await db.saves.find_one({"user_id": user["id"], "baglist_id": baglist_id})
    if existing:
        await db.saves.delete_one({"user_id": user["id"], "baglist_id": baglist_id})
        await db.baglists.update_one({"id": baglist_id}, {"$inc": {"saves_count": -1}})
        return {"saved": False}
    await db.saves.insert_one({"id": str(uuid.uuid4()), "user_id": user["id"], "baglist_id": baglist_id, "created_at": datetime.now(timezone.utc).isoformat()})
    await db.baglists.update_one({"id": baglist_id}, {"$inc": {"saves_count": 1}})
    return {"saved": True}

@router.post("/{baglist_id}/follow")
@limiter.limit("5/minute")
async def follow_baglist(request: Request, baglist_id: str, data: FollowerCapture):
    existing = await db.followers.find_one({"email": data.email, "baglist_id": baglist_id})
    if not existing:
        await db.followers.insert_one({"id": str(uuid.uuid4()), "email": data.email, "baglist_id": baglist_id, "created_at": datetime.now(timezone.utc).isoformat()})
    return {"ok": True}

@router.post("/{baglist_id}/products/{product_id}/click")
@limiter.limit("30/minute")
async def register_click(request: Request, baglist_id: str, product_id: str, user=Depends(get_optional_user)):
    baglist_owner = await db.baglists.find_one({"id": baglist_id}, {"_id": 0, "user_id": 1})
    if user and baglist_owner and user["id"] == baglist_owner["user_id"]:
        return {"ok": True}
    await db.clicks.insert_one({"id": str(uuid.uuid4()), "baglist_id": baglist_id, "product_id": product_id, "type": "affiliate", "created_at": datetime.now(timezone.utc).isoformat()})
    baglist = await db.baglists.find_one({"id": baglist_id}, {"_id": 0, "products": 1})
    if baglist:
        products = baglist.get("products", [])
        for i, p in enumerate(products):
            if p["id"] == product_id:
                products[i]["clicks"] = p.get("clicks", 0) + 1
                break
        await db.baglists.update_one({"id": baglist_id}, {"$set": {"products": products}})
    return {"ok": True}

@router.post("/{baglist_id}/products/{product_id}/discount-click")
@limiter.limit("30/minute")
async def register_discount_click(request: Request, baglist_id: str, product_id: str):
    await db.clicks.insert_one({"id": str(uuid.uuid4()), "baglist_id": baglist_id, "product_id": product_id, "type": "discount", "created_at": datetime.now(timezone.utc).isoformat()})
    return {"ok": True}

@router.get("/{baglist_id}/analytics")
async def get_baglist_analytics(baglist_id: str, user=Depends(get_required_user)):
    baglist = await db.baglists.find_one({"id": baglist_id, "user_id": user["id"]}, {"_id": 0})
    if not baglist:
        raise HTTPException(status_code=404, detail="BagList not found")
    
    # Agregación en Mongo, no en Python
    click_pipeline = [
        {"$match": {"baglist_id": baglist_id, "$or": [{"type": "affiliate"}, {"type": {"$exists": False}}]}},
        {"$group": {
            "_id": {
                "month": {"$substr": ["$created_at", 0, 7]},
                "day": {"$substr": ["$created_at", 0, 10]},
                "product_id": "$product_id"
            },
            "clicks": {"$sum": 1}
        }},
        {"$group": {
            "_id": "$_id.product_id",
            "total": {"$sum": "$clicks"},
            "monthly": {"$push": {"month": "$_id.month", "clicks": "$clicks"}},
            "daily": {"$push": {"date": "$_id.day", "clicks": "$clicks"}}
        }}
    ]
    affiliate_stats = await db.clicks.aggregate(click_pipeline).to_list(10000)
    
    # Contar discount clicks
    discount_count = await db.clicks.count_documents({"baglist_id": baglist_id, "type": "discount"})
    
    # Construir stats por producto
    product_affiliate = {s["_id"]: s["total"] for s in affiliate_stats}
    products = baglist.get("products", [])
    product_stats = sorted([{"id": p["id"], "name": p["name"], "image_url": p.get("image_url", ""), "clicks": product_affiliate.get(p["id"], 0), "discount_clicks": 0} for p in products], key=lambda x: x["clicks"], reverse=True)
    
    # Clics diarios y mensuales globales
    daily_pipeline = [
        {"$match": {"baglist_id": baglist_id, "$or": [{"type": "affiliate"}, {"type": {"$exists": False}}]}},
        {"$group": {"_id": {"$substr": ["$created_at", 0, 10]}, "clicks": {"$sum": 1}}},
        {"$sort": {"_id": 1}}
    ]
    daily_clicks = await db.clicks.aggregate(daily_pipeline).to_list(10000)
    daily_sorted = [{"date": d["_id"], "clicks": d["clicks"]} for d in daily_clicks]
    
    monthly_pipeline = [
        {"$match": {"baglist_id": baglist_id, "$or": [{"type": "affiliate"}, {"type": {"$exists": False}}]}},
        {"$group": {"_id": {"$substr": ["$created_at", 0, 7]}, "clicks": {"$sum": 1}}},
        {"$sort": {"_id": 1}}
    ]
    monthly_clicks = await db.clicks.aggregate(monthly_pipeline).to_list(10000)
    monthly_sorted = [{"month": m["_id"], "clicks": m["clicks"]} for m in monthly_clicks]
    
    followers = await db.followers.count_documents({"baglist_id": baglist_id})
    total_affiliate = sum(s["total"] for s in affiliate_stats)
    
    return {"baglist_id": baglist_id, "title": baglist["title"], "total_clicks": total_affiliate, "total_discount_clicks": discount_count, "favorites_count": baglist.get("favorites_count", 0), "saves_count": baglist.get("saves_count", 0), "followers": followers, "monthly_clicks": monthly_sorted, "daily_clicks": daily_sorted, "products": product_stats}