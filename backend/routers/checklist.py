import asyncio
import hashlib
import json
import logging
from datetime import datetime

from fastapi import APIRouter, Request

from clients import CACHE_TTL, limiter, openai_client, redis_client
from models import TravelData

logger = logging.getLogger("uvicorn.error")

router = APIRouter()


@router.post("/api/generate-checklist")
@limiter.limit("10/minute")
async def generate_checklist(request: Request, data: TravelData):
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

    await redis_client.setex(f"checklist:{cache_key}", CACHE_TTL, json.dumps(result))
    logger.info("Cached result for key %s", cache_key)

    return result
