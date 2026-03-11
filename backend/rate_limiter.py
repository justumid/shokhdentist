"""Rate limiting middleware for production"""
from fastapi import Request, HTTPException
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict, Tuple
import asyncio
from config import settings
from logger import logger

class RateLimiter:
    """Simple in-memory rate limiter"""
    def __init__(self):
        self.requests: Dict[str, list] = defaultdict(list)
        self.cleanup_task = None
    
    def _get_client_id(self, request: Request) -> str:
        """Get client identifier from request"""
        # Try to get real IP from headers (proxy support)
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        return request.client.host if request.client else "unknown"
    
    def _cleanup_old_requests(self):
        """Remove requests older than window"""
        cutoff = datetime.now() - timedelta(seconds=settings.RATE_LIMIT_WINDOW)
        for client_id in list(self.requests.keys()):
            self.requests[client_id] = [
                ts for ts in self.requests[client_id] if ts > cutoff
            ]
            if not self.requests[client_id]:
                del self.requests[client_id]
    
    async def check_rate_limit(self, request: Request) -> None:
        """Check if request exceeds rate limit"""
        if not settings.RATE_LIMIT_ENABLED:
            return
        
        client_id = self._get_client_id(request)
        now = datetime.now()
        cutoff = now - timedelta(seconds=settings.RATE_LIMIT_WINDOW)
        
        # Get recent requests
        recent_requests = [
            ts for ts in self.requests[client_id] if ts > cutoff
        ]
        
        if len(recent_requests) >= settings.RATE_LIMIT_REQUESTS:
            logger.warning(f"Rate limit exceeded for {client_id}")
            raise HTTPException(
                status_code=429,
                detail="Too many requests. Please try again later."
            )
        
        # Add current request
        recent_requests.append(now)
        self.requests[client_id] = recent_requests
    
    async def start_cleanup_task(self):
        """Start background cleanup task"""
        while True:
            await asyncio.sleep(60)  # Cleanup every minute
            self._cleanup_old_requests()

rate_limiter = RateLimiter()
