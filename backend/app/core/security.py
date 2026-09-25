import ipaddress
import socket
from urllib.parse import urlparse, urljoin
from app.core.config import settings
from app.core.exceptions import InvalidURLException, SecurityViolationException
from app.utils.logger import logger


BLOCKED_HOSTNAMES = {
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "::1",
    "metadata.google.internal",
    "169.254.169.254",
    "instance-data",
    "metadata",
}

BLOCKED_DOMAIN_SUFFIXES = (
    ".local",
    ".internal",
    ".lan",
    ".corp",
    ".test",
    ".example",
    ".invalid",
    ".localhost",
)


def validate_target_url(url: str) -> str:
    """
    Validates that a URL is well-formed, uses http/https, and does not target
    loopback, private networks, cloud metadata, or internal hostnames (SSRF defense).
    """
    if not url or not isinstance(url, str):
        raise InvalidURLException("URL must be a non-empty string.")

    url = url.strip()
    # Normalize scheme
    if not (url.startswith("http://") or url.startswith("https://")):
        url = "https://" + url

    try:
        parsed = urlparse(url)
    except Exception as e:
        raise InvalidURLException(f"Malformed URL: {str(e)}")

    if parsed.scheme not in ("http", "https"):
        raise InvalidURLException(
            f"Unsupported protocol scheme: '{parsed.scheme}'. Only HTTP and HTTPS are permitted."
        )

    hostname = parsed.hostname
    if not hostname:
        raise InvalidURLException("URL must contain a valid domain name or public IP address.")

    hostname_lower = hostname.lower()

    # SSRF Protection Checks
    if not settings.ALLOW_LOCAL_URLS:
        # Check blocked literal hostnames
        if hostname_lower in BLOCKED_HOSTNAMES:
            logger.warning(f"SSRF attempt blocked: prohibited hostname '{hostname}'")
            raise SecurityViolationException(f"Access to internal host '{hostname}' is strictly prohibited.")

        # Check internal domain suffixes
        if any(hostname_lower.endswith(suffix) for suffix in BLOCKED_DOMAIN_SUFFIXES):
            logger.warning(f"SSRF attempt blocked: private domain suffix '{hostname}'")
            raise SecurityViolationException(f"Access to private internal domain '{hostname}' is prohibited.")

        # Check direct IP literals in URL
        try:
            ip_literal = ipaddress.ip_address(hostname.strip("[]"))
            _verify_ip_safety(ip_literal)
        except ValueError:
            # Hostname is a domain name, resolve DNS
            try:
                # Resolve IPv4 / IPv6 addresses
                addr_info = socket.getaddrinfo(hostname, None, socket.AF_UNSPEC, socket.SOCK_STREAM)
                for family, _, _, _, sockaddr in addr_info:
                    resolved_ip_str = sockaddr[0]
                    ip_obj = ipaddress.ip_address(resolved_ip_str)
                    _verify_ip_safety(ip_obj)
            except socket.gaierror:
                # DNS failure: domain cannot be resolved
                logger.warning(f"DNS resolution failure for host: '{hostname}'")
                raise InvalidURLException(f"Cannot resolve domain '{hostname}'. Please check if the URL is valid and online.")

    return url


def _verify_ip_safety(ip_obj: ipaddress.IPv4Address | ipaddress.IPv6Address) -> None:
    if (
        ip_obj.is_private
        or ip_obj.is_loopback
        or ip_obj.is_link_local
        or ip_obj.is_reserved
        or ip_obj.is_multicast
        or ip_obj.is_unspecified
    ):
        logger.warning(f"SSRF violation: target resolves to restricted IP {ip_obj}")
        raise SecurityViolationException(
            f"Target URL resolves to private or restricted network address: {ip_obj}"
        )


def validate_redirect_url(target_url: str, original_url: str) -> str:
    """Validates redirection destination to prevent open redirect SSRF attacks."""
    resolved = urljoin(original_url, target_url)
    return validate_target_url(resolved)
