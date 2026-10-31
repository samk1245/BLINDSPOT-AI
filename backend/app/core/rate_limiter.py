import time
from typing import Dict, List, Tuple
from fastapi import Request, HTTPException, status

class SlidingWindowRateLimiter:
    def __init__(self):
        # Key: (client_key, endpoint_action) -> List of epoch timestamps
        self.history: Dict[Tuple[str, str], List[float]] = {}

    def check_rate_limit(self, key: str, action: str, max_requests: int, window_seconds: int) -> bool:
        now = time.time()
        bucket_key = (key, action)
        timestamps = self.history.get(bucket_key, [])

        # Filter out timestamps outside the active window
        valid_timestamps = [ts for ts in timestamps if now - ts < window_seconds]
        if len(valid_timestamps) >= max_requests:
            self.history[bucket_key] = valid_timestamps
            return False

        valid_timestamps.append(now)
        self.history[bucket_key] = valid_timestamps
        return True

rate_limiter = SlidingWindowRateLimiter()

def enforce_rate_limit(request: Request, action: str, max_requests: int, window_seconds: int):
    # Retrieve client identifier (IP address or Authorization header)
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        client_ip = forwarded.split(",")[0].strip()
    else:
        client_ip = request.client.host if request.client else "127.0.0.1"

    allowed = rate_limiter.check_rate_limit(client_ip, action, max_requests, window_seconds)
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded for action '{action}'. Please retry in {window_seconds} seconds."
        )
