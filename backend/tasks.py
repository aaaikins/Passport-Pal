import os

from celery import Celery
from dotenv import load_dotenv
from twilio.rest import Client as TwilioClient

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "passport_pal",
    broker=REDIS_URL,
    backend=REDIS_URL,
)

celery_app.conf.timezone = "UTC"
celery_app.conf.task_serializer = "json"
celery_app.conf.result_serializer = "json"
celery_app.conf.accept_content = ["json"]


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def send_whatsapp_reminder(
    self,
    phone_number: str,
    departure_date: str,
    travel_details: str,
) -> None:
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    from_number = os.getenv("TWILIO_WHATSAPP_NUMBER", "whatsapp:+18444991914")

    message = (
        f"Passport Pal Reminder!\n\n"
        f"Your travel date is approaching ({departure_date}).\n\n"
        f"{travel_details}\n\n"
        f"Make sure you have all your documents ready! Safe travels!"
    )

    try:
        client = TwilioClient(account_sid, auth_token)
        client.messages.create(
            body=message,
            from_=from_number,
            to=f"whatsapp:{phone_number}",
        )
    except Exception as exc:
        raise self.retry(exc=exc)
