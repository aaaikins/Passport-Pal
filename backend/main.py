import logging
import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from clients import limiter, redis_client
from routers.checklist import router as checklist_router
from routers.email import router as email_router
from routers.whatsapp import router as whatsapp_router

load_dotenv()

logger = logging.getLogger("uvicorn.error")

# --------------------------------------------------------------------------- #
# App setup                                                                     #
# --------------------------------------------------------------------------- #

app = FastAPI(title="Passport Pal API", version="2.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

allowed_origins = [
    o for o in ["http://localhost:3000", os.getenv("FRONTEND_URL")] if o
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(checklist_router)
app.include_router(email_router)
app.include_router(whatsapp_router)


# --------------------------------------------------------------------------- #
# Health                                                                        #
# --------------------------------------------------------------------------- #

@app.get("/health")
async def health():
    try:
        await redis_client.ping()
        redis_ok = True
    except Exception:
        redis_ok = False
    return {"status": "ok", "redis": redis_ok}
