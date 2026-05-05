from fastapi import APIRouter, HTTPException, Request
from app.services.resend_service import send_email
from pydantic import BaseModel, EmailStr
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
router = APIRouter(prefix="/contact")

class ContactForm(BaseModel):
    email: EmailStr
    subject: str = ""
    message: str

@router.post("")
@limiter.limit("3/day")
async def send_contact(request: Request, data: ContactForm):
    if len(data.message) > 1000:
        raise HTTPException(status_code=400, detail="El mensaje no puede superar 1000 caracteres")
    if len(data.subject) > 100:
        raise HTTPException(status_code=400, detail="El asunto no puede superar 100 caracteres")
    if len(data.message.strip()) < 10:
        raise HTTPException(status_code=400, detail="El mensaje es demasiado corto")
    subject = f"Contacto Liser: {data.subject}" if data.subject else "Contacto Liser"
    html = f"""
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h2>Nuevo mensaje de contacto</h2>
      <p><strong>Email:</strong> {data.email}</p>
      <p><strong>Asunto:</strong> {data.subject or '—'}</p>
      <p><strong>Mensaje:</strong></p>
      <div style="background:#f4f4f5;padding:16px;border-radius:8px;white-space:pre-wrap">{data.message}</div>
    </div>
    """
    await send_email("hello@liser.es", subject, html, type="contact")
    return {"ok": True}