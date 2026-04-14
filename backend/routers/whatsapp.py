from datetime import datetime, timedelta

from fastapi import APIRouter, HTTPException, Request

from clients import limiter
from models import WhatsAppRequest
from tasks import send_whatsapp_reminder

router = APIRouter()


@router.post("/api/whatsapp-reminder")
@limiter.limit("5/minute")
async def whatsapp_reminder(request: Request, data: WhatsAppRequest):
    departure = datetime.fromisoformat(data.departureDate)
    reminder_date = (departure - timedelta(days=3)).replace(
        hour=9, minute=0, second=0, microsecond=0
    )

    if reminder_date <= datetime.now():
        raise HTTPException(status_code=400, detail="Reminder date is in the past")

    send_whatsapp_reminder.apply_async(
        args=[data.phoneNumber, data.departureDate, data.travelDetails],
        eta=reminder_date,
    )

    return {
        "success": True,
        "message": f"WhatsApp reminder scheduled for {reminder_date.strftime('%B %d, %Y at 9:00 AM')}",
    }
