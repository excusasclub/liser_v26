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

    # Clics totales
    click_pipeline = [{"$group": {"_id": None, "total": {"$sum": "$total_clicks"}}}]
    click_result = await db.baglists.aggregate(click_pipeline).to_list(1)
    total_clicks = click_result[0]["total"] if click_result else 0

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
    category_pipeline = [
        {"$group": {"_id": "$category", "clicks": {"$sum": "$total_clicks"}, "count": {"$sum": 1}}},
        {"$sort": {"clicks": -1}}
    ]
    categories = await db.baglists.aggregate(category_pipeline).to_list(20)

    return {
        "total_users": total_users,
        "new_users_today": new_users_today,
        "total_baglists": total_baglists,
        "public_baglists": public_baglists,
        "total_clicks": total_clicks,
        "total_followers": total_followers,
        "users_per_day": days,
        "inactive_baglists": inactive_baglists,
        "categories": [{"category": c["_id"] or "Other", "clicks": c["clicks"], "count": c["count"]} for c in categories],
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