from fastapi import APIRouter, HTTPException, Depends
from app.dependencies import get_required_user, get_optional_user
from app.database import db

router = APIRouter(prefix="/users")

@router.get("/me/saved")
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

@router.get("/me/favorites")
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

@router.get("/me/analytics")
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
    baglist_stats = sorted([{"id": b["id"], "title": b["title"], "clicks": baglist_clicks.get(b["id"], 0)} for b in baglists], key=lambda x: x["clicks"], reverse=True)
    return {"total_clicks": len(clicks), "monthly_clicks": monthly_sorted, "daily_clicks": daily_sorted, "baglists": baglist_stats}

@router.get("/{username}")
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