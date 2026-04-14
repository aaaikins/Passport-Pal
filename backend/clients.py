import os

import redis.asyncio as aioredis
from openai import AsyncOpenAI
from slowapi import Limiter
from slowapi.util import get_remote_address

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
CACHE_TTL = 3600  # 1 hour

limiter = Limiter(key_func=get_remote_address)
redis_client = aioredis.from_url(REDIS_URL, decode_responses=True)
openai_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
