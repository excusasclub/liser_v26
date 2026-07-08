from fastapi import APIRouter, HTTPException, Depends, Query
from app.dependencies import get_required_admin
from app.database import db
from datetime import datetime, timezone, timedelta
from typing import Optional
import csv
import io

router = APIRouter(prefix="/admin")


# ── USUARIOS ────────────────────────────────────────────────────────────────

@router.get("/users")
async def admin_list_users(
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 50,
    admin=Depends(get_required_admin)
):
    query = {}
    if search:
        query = {"$or": [
            {"email": {"$regex": search, "$options": "i"}},
            {"username": {"$regex": search, "$options": "i"}}
        ]}
    skip = (page - 1) * limit
    users = await db.users.find(query, {"_id": 0, "password_hash": 0}).skip(skip).limit(limit).to_list(limit)
    total = await db.users.count_documents(query)
    return {"users": users, "total": total, "page": page, "pages": -(-total // limit)}


@router.patch("/users/{user_id}/plan")
async def admin_set_plan(user_id: str, body: dict, admin=Depends(get_required_admin)):
    plan = body.get("plan")
    if plan not in ("free", "pro", "premium"):
        raise HTTPException(status_code=400, detail="Plan inválido")
    result = await db.users.update_one({"id": user_id}, {"$set": {"plan": plan}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return {"ok": True}

@router.delete("/users/{user_id}")
async def admin_delete_user(user_id: str, admin=Depends(get_required_admin)):
    await db.baglists.delete_many({"user_id": user_id})
    await db.favorites.delete_many({"user_id": user_id})
    await db.saves.delete_many({"user_id": user_id})
    await db.followers.delete_many({"user_id": user_id})
    result = await db.users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return {"ok": True}


@router.patch("/users/{user_id}/suspend")
async def admin_suspend_user(user_id: str, body: dict, admin=Depends(get_required_admin)):
    suspended = body.get("suspended", True)
    result = await db.users.update_one({"id": user_id}, {"$set": {"suspended": suspended}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return {"ok": True}


# ── BAGLISTS ─────────────────────────────────────────────────────────────────

@router.get("/baglists")
async def admin_list_baglists(
    search: Optional[str] = None,
    category: Optional[str] = None,
    username: Optional[str] = None,
    page: int = 1,
    limit: int = 50,
    admin=Depends(get_required_admin)
):
    query = {}
    if search:
        query["title"] = {"$regex": search, "$options": "i"}
    if category:
        query["category"] = category
    if username:
        query["username"] = username
    skip = (page - 1) * limit
    baglists = await db.baglists.find(query, {"_id": 0, "products": 0}).skip(skip).limit(limit).to_list(limit)
    total = await db.baglists.count_documents(query)
    user_ids = list(set(b["user_id"] for b in baglists))
    users = await db.users.find({"id": {"$in": user_ids}}, {"_id": 0, "id": 1, "username": 1}).to_list(100)
    users_map = {u["id"]: u["username"] for u in users}
    for b in baglists:
        b["username"] = users_map.get(b["user_id"], "—")
    return {"baglists": baglists, "total": total, "page": page, "pages": -(-total // limit)}


@router.patch("/baglists/{baglist_id}/featured")
async def admin_set_featured(baglist_id: str, body: dict, admin=Depends(get_required_admin)):
    featured = body.get("featured", True)
    result = await db.baglists.update_one({"id": baglist_id}, {"$set": {"featured": featured}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="BagList no encontrada")
    return {"ok": True}


@router.delete("/baglists/{baglist_id}")
async def admin_delete_baglist(baglist_id: str, admin=Depends(get_required_admin)):
    result = await db.baglists.delete_one({"id": baglist_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="BagList no encontrada")
    return {"ok": True}


# ── ANALÍTICAS GLOBALES ──────────────────────────────────────────────────────

@router.get("/analytics")
async def admin_analytics(admin=Depends(get_required_admin)):
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    total_users = await db.users.count_documents({})
    new_users_today = await db.users.count_documents({
        "created_at": {"$gte": today_start.isoformat()}
    })

    total_baglists = await db.baglists.count_documents({})
    public_baglists = await db.baglists.count_documents({"is_public": True})

    # Clics totales y por categoría (los clics viven en la colección "clicks", no en baglists)
    baglists_meta = await db.baglists.find({}, {"_id": 0, "id": 1, "category": 1}).to_list(100000)
    click_counts = await db.clicks.aggregate([
        {"$match": {"$or": [{"type": "affiliate"}, {"type": {"$exists": False}}]}},
        {"$group": {"_id": "$baglist_id", "clicks": {"$sum": 1}}}
    ]).to_list(100000)
    clicks_by_baglist = {c["_id"]: c["clicks"] for c in click_counts}
    total_clicks = sum(clicks_by_baglist.values())

    # Emails capturados
    total_followers = await db.followers.count_documents({})

    # Usuarios nuevos últimos 7 días
    days = []
    for i in range(6, -1, -1):
        day = now - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        count = await db.users.count_documents({
            "created_at": {"$gte": day_start.isoformat(), "$lt": day_end.isoformat()}
        })
        days.append({"date": day_start.strftime("%d/%m"), "count": count})

    # Listas sin actividad > 30 días
    cutoff = (now - timedelta(days=30)).isoformat()
    inactive_baglists = await db.baglists.count_documents({
        "is_public": True,
        "updated_at": {"$lt": cutoff}
    })

    # Clics por categoría
    category_totals = {}
    for b in baglists_meta:
        cat = b.get("category") or "Other"
        entry = category_totals.setdefault(cat, {"clicks": 0, "count": 0})
        entry["clicks"] += clicks_by_baglist.get(b["id"], 0)
        entry["count"] += 1
    categories = sorted(
        [{"category": cat, "clicks": v["clicks"], "count": v["count"]} for cat, v in category_totals.items()],
        key=lambda x: x["clicks"], reverse=True
    )

    return {
        "total_users": total_users,
        "new_users_today": new_users_today,
        "total_baglists": total_baglists,
        "public_baglists": public_baglists,
        "total_clicks": total_clicks,
        "total_followers": total_followers,
        "users_per_day": days,
        "inactive_baglists": inactive_baglists,
        "categories": categories,
    }


# ── FACTURACIÓN ──────────────────────────────────────────────────────────────

@router.get("/billing")
async def admin_billing(admin=Depends(get_required_admin)):
    paid_users = await db.users.find(
        {"plan": {"$in": ["pro", "premium"]}},
        {"_id": 0, "password_hash": 0}
    ).to_list(1000)
    return {"paid_users": paid_users, "total": len(paid_users)}


@router.get("/billing/export")
async def admin_billing_export(admin=Depends(get_required_admin)):
    from fastapi.responses import StreamingResponse
    paid_users = await db.users.find(
        {"plan": {"$in": ["pro", "premium"]}},
        {"_id": 0, "password_hash": 0}
    ).to_list(1000)
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=["username", "email", "plan", "created_at", "last_login"])
    writer.writeheader()
    for u in paid_users:
        writer.writerow({
            "username": u.get("username", ""),
            "email": u.get("email", ""),
            "plan": u.get("plan", ""),
            "created_at": u.get("created_at", ""),
            "last_login": u.get("last_login", ""),
        })
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=facturacion.csv"}
    )
# ── EMAILS ───────────────────────────────────────────────────────────────────

@router.get("/emails")
async def admin_emails(
    type: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    limit: int = 50,
    admin=Depends(get_required_admin)
):
    query = {}
    if type:
        query["type"] = type
    if status:
        query["status"] = status
    skip = (page - 1) * limit
    emails = await db.email_logs.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.email_logs.count_documents(query)
    return {"emails": emails, "total": total, "page": page, "pages": -(-total // limit)}


@router.post("/emails/send-to-user/{user_id}")
async def admin_send_email_to_user(user_id: str, body: dict, admin=Depends(get_required_admin)):
    from app.services.resend_service import send_email
    template = body.get("template")
    custom_subject = body.get("subject")
    custom_html = body.get("html")
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    if template == "welcome":
        from app.services.resend_service import welcome_html
        subject = "Bienvenido a Liser"
        html = welcome_html(user["username"])
    elif template == "custom" and custom_subject and custom_html:
        subject = custom_subject
        html = custom_html
    else:
        raise HTTPException(status_code=400, detail="Template o contenido inválido")
    
    result = await send_email(user["email"], subject, html, type="admin_send")
    return result


@router.post("/emails/notify-followers/{baglist_id}")
async def admin_notify_followers(baglist_id: str, admin=Depends(get_required_admin)):
    from app.services.resend_service import send_follower_notification
    baglist = await db.baglists.find_one({"id": baglist_id}, {"_id": 0})
    if not baglist:
        raise HTTPException(status_code=404, detail="BagList no encontrada")
    owner = await db.users.find_one({"id": baglist["user_id"]}, {"_id": 0, "username": 1})
    followers = await db.followers.find({"baglist_id": baglist_id}, {"_id": 0, "email": 1}).to_list(1000)
    sent = 0
    for f in followers:
        result = await send_follower_notification(f["email"], owner["username"], baglist["title"], baglist.get("slug", baglist_id))
        if result.get("ok"):
            sent += 1
    return {"sent": sent, "total": len(followers)}


@router.post("/emails/broadcast")
async def admin_broadcast(body: dict, admin=Depends(get_required_admin)):
    from app.services.resend_service import send_email
    subject = body.get("subject", "").strip()
    html = body.get("html", "").strip()
    if not subject or not html:
        raise HTTPException(status_code=400, detail="Subject y html requeridos")
    users = await db.users.find({}, {"_id": 0, "email": 1}).to_list(10000)
    sent = 0
    for u in users:
        result = await send_email(u["email"], subject, html, type="broadcast")
        if result.get("ok"):
            sent += 1
    return {"sent": sent, "total": len(users)}

# ── SISTEMA ──────────────────────────────────────────────────────────────────

@router.get("/system")
async def admin_system(admin=Depends(get_required_admin)):
    import cloudinary.api
    try:
        usage = cloudinary.api.usage()
        cloudinary_info = {
            "used_mb": round(usage.get("storage", {}).get("usage", 0) / 1024 / 1024, 2),
            "limit_mb": round(usage.get("storage", {}).get("limit", 0) / 1024 / 1024, 2),
        }
    except Exception as e:
        cloudinary_info = {"error": str(e)}

    collections = await db.list_collection_names()
    counts = {}
    for col in collections:
        counts[col] = await db[col].count_documents({})

    return {"cloudinary": cloudinary_info, "collections": counts}