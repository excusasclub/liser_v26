import os
import httpx
from datetime import datetime, timezone
from app.database import db
import uuid

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
FROM_EMAIL = os.getenv("FROM_EMAIL", "Liser <hola@liser.es>")
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://app.liser.es")


async def send_email(to: str, subject: str, html: str, type: str = "generic") -> dict:
    log_id = str(uuid.uuid4())
    log = {
        "id": log_id,
        "to": to,
        "subject": subject,
        "type": type,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.email_logs.insert_one(log)

    try:
        async with httpx.AsyncClient() as client:
            res = await client.post(
                "https://api.resend.com/emails",
                headers={"Authorization": f"Bearer {RESEND_API_KEY}", "Content-Type": "application/json"},
                json={"from": FROM_EMAIL, "to": [to], "subject": subject, "html": html},
                timeout=10
            )
        data = res.json()
        status = "sent" if res.status_code == 200 else "failed"
        error = data.get("message") if status == "failed" else None
        await db.email_logs.update_one({"id": log_id}, {"$set": {"status": status, "resend_id": data.get("id"), "error": error}})
        return {"ok": status == "sent", "id": log_id}
    except Exception as e:
        await db.email_logs.update_one({"id": log_id}, {"$set": {"status": "failed", "error": str(e)}})
        return {"ok": False, "error": str(e)}


def welcome_html(username: str) -> str:
    return f"""
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#0a0a0a;color:#fff;border-radius:12px">
      <div style="text-align:center;margin-bottom:32px">
        <div style="width:48px;height:48px;background:#22c55e;border-radius:12px;display:inline-flex;align-items:center;justify-content:center">
          <span style="color:#fff;font-weight:bold;font-size:20px">L</span>
        </div>
      </div>
      <h1 style="font-size:24px;margin-bottom:16px">Bienvenido a Liser, {username} 👋</h1>
      <p style="color:#a1a1aa;line-height:1.6">Ya puedes crear tus primeras BagLists y compartir tus productos favoritos con el mundo.</p>
      <div style="margin:32px 0;text-align:center">
        <a href="{FRONTEND_URL}/dashboard" style="background:#22c55e;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600">Ir a mi dashboard</a>
      </div>
      <p style="color:#52525b;font-size:12px;text-align:center">Si no creaste esta cuenta, ignora este email.</p>
    </div>
    """


def reset_password_html(username: str, reset_url: str) -> str:
    return f"""
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#0a0a0a;color:#fff;border-radius:12px">
      <div style="text-align:center;margin-bottom:32px">
        <div style="width:48px;height:48px;background:#22c55e;border-radius:12px;display:inline-flex;align-items:center;justify-content:center">
          <span style="color:#fff;font-weight:bold;font-size:20px">L</span>
        </div>
      </div>
      <h1 style="font-size:24px;margin-bottom:16px">Restablece tu contraseña</h1>
      <p style="color:#a1a1aa;line-height:1.6">Hola {username}, recibimos una solicitud para restablecer tu contraseña. El enlace expira en 1 hora.</p>
      <div style="margin:32px 0;text-align:center">
        <a href="{reset_url}" style="background:#22c55e;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600">Restablecer contraseña</a>
      </div>
      <p style="color:#52525b;font-size:12px;text-align:center">Si no solicitaste esto, ignora este email. Tu contraseña no cambiará.</p>
    </div>
    """


def follower_notification_html(username: str, baglist_title: str, baglist_url: str) -> str:
    return f"""
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#0a0a0a;color:#fff;border-radius:12px">
      <div style="text-align:center;margin-bottom:32px">
        <div style="width:48px;height:48px;background:#22c55e;border-radius:12px;display:inline-flex;align-items:center;justify-content:center">
          <span style="color:#fff;font-weight:bold;font-size:20px">L</span>
        </div>
      </div>
      <h1 style="font-size:24px;margin-bottom:16px">La BagList que sigues se ha actualizado</h1>
      <p style="color:#a1a1aa;line-height:1.6"><strong style="color:#fff">{baglist_title}</strong> de {username} tiene novedades. ¡Échale un vistazo!</p>
      <div style="margin:32px 0;text-align:center">
        <a href="{baglist_url}" style="background:#22c55e;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600">Ver BagList</a>
      </div>
      <p style="color:#52525b;font-size:12px;text-align:center">Recibiste este email porque seguiste esta BagList en Liser.</p>
    </div>
    """


async def send_welcome(email: str, username: str):
    return await send_email(email, "Bienvenido a Liser 🎉", welcome_html(username), type="welcome")


async def send_reset_password(email: str, username: str, token: str):
    reset_url = f"{FRONTEND_URL}/reset-password?token={token}"
    return await send_email(email, "Restablece tu contraseña", reset_password_html(username, reset_url), type="reset_password")


async def send_follower_notification(email: str, username: str, baglist_title: str, baglist_id: str):
    baglist_url = f"{FRONTEND_URL}/list/{username}/{baglist_id}"
    return await send_email(email, f"'{baglist_title}' se ha actualizado", follower_notification_html(username, baglist_title, baglist_url), type="follower_notification")