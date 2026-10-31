import os
import time
import hmac
import hashlib
import json
import base64
from datetime import datetime, timedelta, timezone
from typing import Optional, Any, Dict
from .config import settings

try:
    import bcrypt
    HAS_BCRYPT = True
except ImportError:
    HAS_BCRYPT = False

try:
    import jwt
    HAS_PYJWT = True
except ImportError:
    HAS_PYJWT = False


def hash_password(password: str) -> str:
    """Hash a plaintext password securely."""
    if HAS_BCRYPT:
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")
    else:
        # Fallback salt + SHA256 PBKDF2
        salt = os.urandom(16)
        key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100000)
        return "pbkdf2$" + base64.b64encode(salt).decode("utf-8") + "$" + base64.b64encode(key).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against stored hash."""
    if not hashed_password:
        return False
    if HAS_BCRYPT and hashed_password.startswith(("$2a$", "$2b$", "$2y$")):
        try:
            return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
        except Exception:
            return False
    elif hashed_password.startswith("pbkdf2$"):
        parts = hashed_password.split("$")
        if len(parts) == 3:
            salt = base64.b64decode(parts[1])
            expected = base64.b64decode(parts[2])
            key = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt, 100000)
            return hmac.compare_digest(key, expected)
    return False


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create a signed JWT access token with correct UTC expiration timestamp."""
    to_encode = data.copy()
    now_utc = datetime.now(timezone.utc)
    if expires_delta:
        expire = now_utc + expires_delta
    else:
        expire = now_utc + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": int(expire.timestamp())})

    if HAS_PYJWT:
        return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    else:
        # Standalone HS256 JWT generation
        header = {"alg": "HS256", "typ": "JWT"}
        header_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
        payload_b64 = base64.urlsafe_b64encode(json.dumps(to_encode).encode()).decode().rstrip("=")
        signing_input = f"{header_b64}.{payload_b64}".encode()
        sig = hmac.new(settings.SECRET_KEY.encode(), signing_input, hashlib.sha256).digest()
        sig_b64 = base64.urlsafe_b64encode(sig).decode().rstrip("=")
        return f"{header_b64}.{payload_b64}.{sig_b64}"


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and validate a JWT access token."""
    if not token:
        return None
    try:
        if HAS_PYJWT:
            return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        else:
            parts = token.split(".")
            if len(parts) != 3:
                return None
            header_b64, payload_b64, sig_b64 = parts
            signing_input = f"{header_b64}.{payload_b64}".encode()
            expected_sig = hmac.new(settings.SECRET_KEY.encode(), signing_input, hashlib.sha256).digest()
            # Restore padding
            sig_pad = sig_b64 + "=" * (-len(sig_b64) % 4)
            actual_sig = base64.urlsafe_b64decode(sig_pad)
            if not hmac.compare_digest(expected_sig, actual_sig):
                return None
            payload_pad = payload_b64 + "=" * (-len(payload_b64) % 4)
            payload = json.loads(base64.urlsafe_b64decode(payload_pad).decode())
            if "exp" in payload and time.time() > payload["exp"]:
                return None
            return payload
    except Exception:
        return None
