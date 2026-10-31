import pytest
from app.core.security import hash_password, verify_password, create_access_token, decode_token
from app.core.ssrf import validate_url_security, is_ip_blocked
from app.core.file_security import validate_pdf_content

def test_argon2id_hashing_and_verification():
    raw_pwd = "P@ssw0rdSecure!2026"
    hashed = hash_password(raw_pwd)
    
    assert hashed != raw_pwd
    assert hashed.startswith("$argon2id$")
    assert verify_password(raw_pwd, hashed) is True
    assert verify_password("WrongPassword123!", hashed) is False

def test_jwt_token_lifecycle():
    data = {"sub": "user-uuid-123", "role": "USER"}
    token = create_access_token(data)
    assert isinstance(token, str)

    payload = decode_token(token)
    assert payload is not None
    assert payload.get("sub") == "user-uuid-123"
    assert payload.get("role") == "USER"
    assert payload.get("type") == "access"

def test_ssrf_ip_blocklist():
    # Loopback
    assert is_ip_blocked("127.0.0.1") is True
    assert is_ip_blocked("127.0.1.1") is True
    # Cloud Metadata
    assert is_ip_blocked("169.254.169.254") is True
    # RFC 1918 Private ranges
    assert is_ip_blocked("10.0.0.1") is True
    assert is_ip_blocked("172.16.0.5") is True
    assert is_ip_blocked("192.168.1.1") is True
    # IPv6 loopback
    assert is_ip_blocked("::1") is True
    # Valid Public IP
    assert is_ip_blocked("8.8.8.8") is False
    assert is_ip_blocked("1.1.1.1") is False

def test_ssrf_url_validation_rejections():
    # Cloud metadata
    safe, msg = validate_url_security("http://169.254.169.254/latest/meta-data/")
    assert safe is False
    assert "Direct access to restricted or private IP" in msg or "cloud metadata" in msg.lower()

    # Localhost
    safe, msg = validate_url_security("http://127.0.0.1:8000/admin")
    assert safe is False

    # Private IP
    safe, msg = validate_url_security("http://192.168.1.50/config")
    assert safe is False

    # Unsafe schemes
    safe, msg = validate_url_security("javascript:alert(1)")
    assert safe is False
    assert "scheme" in msg.lower()

    safe, msg = validate_url_security("file:///etc/passwd")
    assert safe is False

def test_pdf_magic_byte_validation():
    # Valid PDF magic header
    valid_pdf_bytes = b"%PDF-1.7\nSample content..."
    is_valid, msg = validate_pdf_content(valid_pdf_bytes)
    assert is_valid is True

    # Invalid header
    fake_pdf = b"MZ\x90\x00\x03\x00\x00\x00" # Windows PE executable header
    is_valid, msg = validate_pdf_content(fake_pdf)
    assert is_valid is False
    assert "magic header" in msg.lower()

    # Empty file
    is_valid, msg = validate_pdf_content(b"")
    assert is_valid is False
    assert "empty" in msg.lower()
