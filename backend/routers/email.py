import logging
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import aiosmtplib
from fastapi import APIRouter, HTTPException, Request

from clients import limiter
from models import EmailRequest

logger = logging.getLogger("uvicorn.error")

router = APIRouter()


@router.post("/api/send-email")
@limiter.limit("5/minute")
async def send_email(request: Request, data: EmailRequest):
    from_email = os.getenv("EMAIL_FROM", "passportpal.business@gmail.com")
    password = os.getenv("EMAIL_PASSWORD")

    checklist_rows = "".join(
        f'<div class="checklist-item">{line}</div>'
        for line in data.checklist.split("\n")
        if line.strip()
    )
    greeting = f"Hello {data.userName}," if data.userName else "Hello Traveler,"

    html_content = f"""<!DOCTYPE html>
<html>
<head>
  <style>
    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
    .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
    .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
    .checklist-item {{ padding: 10px; margin: 10px 0; background: white; border-left: 4px solid #667eea; border-radius: 4px; }}
    .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 12px; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Passport Pal</h1>
      <p>Your Personalized Travel Checklist</p>
    </div>
    <div class="content">
      <p>{greeting}</p>
      <p>Here's your comprehensive travel documents checklist:</p>
      <div class="checklist">{checklist_rows}</div>
      <p style="margin-top: 30px;"><strong>Safe travels!</strong></p>
    </div>
    <div class="footer">
      <p>&copy; 2026 Passport Pal &mdash; Your AI Travel Assistant</p>
    </div>
  </div>
</body>
</html>"""

    msg = MIMEMultipart("alternative")
    msg["From"] = f"Passport Pal <{from_email}>"
    msg["To"] = data.email
    msg["Subject"] = "Your Travel Documents Checklist - Passport Pal"
    msg.attach(MIMEText(data.checklist, "plain"))
    msg.attach(MIMEText(html_content, "html"))

    try:
        await aiosmtplib.send(
            msg,
            hostname="smtp.gmail.com",
            port=587,
            start_tls=True,
            username=from_email,
            password=password,
        )
        return {"success": True, "message": "Checklist sent successfully to your email!"}
    except Exception as e:
        logger.error("Email send failed: %s", e)
        raise HTTPException(status_code=500, detail=f"Failed to send email: {e}")
