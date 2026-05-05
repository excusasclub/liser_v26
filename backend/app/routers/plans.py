from fastapi import APIRouter, HTTPException, Depends
from app.dependencies import get_required_user
from app.database import db
from app.services.resend_service import send_email
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/plans")

@router.post("/request")
async def request_plan(body: dict, user=Depends(get_required_user)):
    plan = body.get("plan")
    if plan not in ["pro", "premium"]:
        raise HTTPException(status_code=400, detail="Plan no válido")
    existing = await db.plan_requests.find_one({"user_id": user["id"], "plan": plan})
    if existing:
        raise HTTPException(status_code=409, detail="Ya has solicitado este plan")
    await db.plan_requests.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "username": user["username"],
        "email": user["email"],
        "plan": plan,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    await send_email(
        "hello@liser.es",
        f"Solicitud plan {plan} — {user['username']}",
        f"""<div style="font-family:sans-serif;padding:24px">
        <h2>Nueva solicitud de plan</h2>
        <p><strong>Usuario:</strong> {user['username']}</p>
        <p><strong>Email:</strong> {user['email']}</p>
        <p><strong>Plan solicitado:</strong> {plan}</p>
        <p><strong>Fecha:</strong> {datetime.now(timezone.utc).strftime('%d/%m/%Y %H:%M')} UTC</p>
        </div>""",
        type="plan_request"
    )
    return {"ok": True}

@router.get("/request-status/{plan}")
async def get_request_status(plan: str, user=Depends(get_required_user)):
    existing = await db.plan_requests.find_one({"user_id": user["id"], "plan": plan})
    return {"requested": existing is not None}