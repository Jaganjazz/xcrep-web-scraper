import pytest
from app.core.security import validate_target_url, validate_redirect_url
from app.core.exceptions import SecurityViolationException, InvalidURLException


def test_ssrf_blocked_localhost():
    blocked = [
        "http://localhost",
        "https://localhost:8000/api",
        "http://127.0.0.1",
        "http://127.0.0.1:3000",
        "http://0.0.0.0",
        "http://[::1]",
    ]
    for url in blocked:
        with pytest.raises(SecurityViolationException):
            validate_target_url(url)


def test_ssrf_blocked_private_ips():
    private_ips = [
        "http://10.0.0.1",
        "http://10.255.255.255",
        "http://172.16.0.1",
        "http://172.31.255.255",
        "http://192.168.1.1",
        "http://192.168.0.254:8080",
    ]
    for url in private_ips:
        with pytest.raises(SecurityViolationException):
            validate_target_url(url)


def test_ssrf_blocked_cloud_metadata():
    cloud_metadata = [
        "http://169.254.169.254/latest/meta-data/",
        "http://metadata.google.internal/computeMetadata/v1/",
        "http://instance-data/latest/meta-data",
    ]
    for url in cloud_metadata:
        with pytest.raises(SecurityViolationException):
            validate_target_url(url)


def test_ssrf_blocked_internal_domain_suffixes():
    internal_suffixes = [
        "http://server.local",
        "http://database.internal",
        "http://service.lan",
        "http://router.corp",
    ]
    for url in internal_suffixes:
        with pytest.raises((SecurityViolationException, InvalidURLException)):
            validate_target_url(url)


def test_ssrf_redirect_validation():
    # If remote redirects to localhost or 10.0.0.1, validate_redirect_url must catch it
    with pytest.raises(SecurityViolationException):
        validate_redirect_url("http://127.0.0.1/admin", "https://example.com")

    with pytest.raises(SecurityViolationException):
        validate_redirect_url("http://169.254.169.254", "https://example.com")
