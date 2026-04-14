import asyncio
import hashlib
import json
import logging
import os
from datetime import datetime, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import aiosmtplib
import redis.asyncio as aioredis
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from openai import AsyncOpenAI
from pydantic import BaseModel
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from tasks import celery_app, send_whatsapp_reminder

load_dotenv()

logger = logging.getLogger("uvicorn.error")

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
CACHE_TTL = 3600  # 1 hour

# --------------------------------------------------------------------------- #
# App setup                                                                     #
# --------------------------------------------------------------------------- #

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="Passport Pal API", version="2.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Filter out empty strings from allowed origins
allowed_origins = [
    o for o in [
        "http://localhost:3000",
        os.getenv("FRONTEND_URL"),
    ]
    if o
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

openai_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
redis_client = aioredis.from_url(REDIS_URL, decode_responses=True)


# --------------------------------------------------------------------------- #
# Request models                                                                #
# --------------------------------------------------------------------------- #

class TravelData(BaseModel):
    nationality: str
    passportExpiration: str
    leavingFrom: str
    goingTo: str
    departureDate: str
    email: str
    visaType: str
    purposeOfTravel: str
    phoneNumber: str | None = None


class EmailRequest(BaseModel):
    email: str
    checklist: str
    userName: str | None = None


class WhatsAppRequest(BaseModel):
    phoneNumber: str
    departureDate: str
    travelDetails: str


# --------------------------------------------------------------------------- #
# Routes                                                                        #
# --------------------------------------------------------------------------- #

@app.get("/health")
async def health():
    try:
        await redis_client.ping()
        redis_ok = True
    except Exception:
        redis_ok = False
    return {"status": "ok", "redis": redis_ok}


@app.post("/api/generate-checklist")
@limiter.limit("10/minute")
async def generate_checklist(request: Request, data: TravelData):
    # Cache key from stable trip fields (excludes email/phone)
    cache_key = hashlib.md5(
        f"{data.nationality}:{data.goingTo}:{data.visaType}:"
        f"{data.passportExpiration}:{data.departureDate}".encode()
    ).hexdigest()

    cached = await redis_client.get(f"checklist:{cache_key}")
    if cached:
        logger.info("Cache hit for key %s", cache_key)
        return json.loads(cached)

    current_date = datetime.now()
    passport_expiry = datetime.fromisoformat(data.passportExpiration)
    departure = datetime.fromisoformat(data.departureDate)
    days_until_departure = (departure - current_date).days
    months_until_expiry = (passport_expiry - current_date).days // 30

    checklist_prompt = f"""Analyze this travel scenario and provide a detailed response:

Traveler Profile:
- Nationality: {data.nationality}
- Passport Expiration: {data.passportExpiration} ({months_until_expiry} months from now)
- Departure: {data.leavingFrom} → {data.goingTo}
- Departure Date: {data.departureDate} ({days_until_departure} days from now)
- Visa Type: {data.visaType}
- Purpose: {data.purposeOfTravel}

Provide a JSON response with this exact structure:
{{
  "checklist": [
    {{
      "id": "unique-id",
      "text": "Clear actionable item",
      "priority": "high|medium|low",
      "category": "visa|passport|health|insurance|customs|general",
      "estimatedTime": "e.g., 2-3 weeks",
      "links": ["https://official-link.gov"]
    }}
  ],
  "summary": "Brief overview of what the traveler needs to do",
  "warnings": ["Critical warning messages"],
  "recommendations": ["Helpful suggestions"],
  "visaRequirements": {{
    "required": true,
    "processingTime": "e.g., 5-10 business days",
    "fee": "e.g., $160 USD",
    "applicationLink": "https://..."
  }},
  "riskScore": 75
}}"""

    compliance_prompt = f"""Analyze document compliance for:
- {data.nationality} citizen traveling to {data.goingTo}
- Passport expires: {data.passportExpiration}
- Departure: {data.departureDate}
- Visa type: {data.visaType}

Provide JSON:
{{
  "compliant": true,
  "issues": ["list of compliance issues if any"],
  "score": 85
}}"""

    # Run both OpenAI calls concurrently
    checklist_task = openai_client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are an advanced AI travel advisor with expertise in international "
                    "travel regulations, visa requirements, and document verification."
                ),
            },
            {"role": "user", "content": checklist_prompt},
        ],
        temperature=0.3,
        response_format={"type": "json_object"},
    )

    compliance_task = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": "You are a travel compliance analyzer.",
            },
            {"role": "user", "content": compliance_prompt},
        ],
        temperature=0.2,
        response_format={"type": "json_object"},
    )

    checklist_response, compliance_response = await asyncio.gather(
        checklist_task, compliance_task
    )

    result = {
        **json.loads(checklist_response.choices[0].message.content),
        "compliance": json.loads(compliance_response.choices[0].message.content),
        "generatedAt": datetime.now().isoformat(),
    }

    # Cache result for 1 hour
    await redis_client.setex(f"checklist:{cache_key}", CACHE_TTL, json.dumps(result))
    logger.info("Cached result for key %s", cache_key)

    return result


@app.post("/api/send-email")
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


@app.post("/api/whatsapp-reminder")
@limiter.limit("5/minute")
async def whatsapp_reminder(request: Request, data: WhatsAppRequest):
    departure = datetime.fromisoformat(data.departureDate)
    # Schedule at 9 AM, 3 days before departure
    reminder_date = (departure - timedelta(days=3)).replace(
        hour=9, minute=0, second=0, microsecond=0
    )

    if reminder_date <= datetime.now():
        raise HTTPException(status_code=400, detail="Reminder date is in the past")

    # Enqueue the Celery task — worker will execute it at reminder_date
    send_whatsapp_reminder.apply_async(
        args=[data.phoneNumber, data.departureDate, data.travelDetails],
        eta=reminder_date,
    )

    return {
        "success": True,
        "message": f"WhatsApp reminder scheduled for {reminder_date.strftime('%B %d, %Y at 9:00 AM')}",
    }
