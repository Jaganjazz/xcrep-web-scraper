import time
from typing import Optional, Dict
from urllib.parse import urljoin
import httpx
from app.core.config import settings
from app.core.exceptions import FetchError, SecurityViolationException
from app.core.security import validate_target_url, validate_redirect_url
from app.utils.logger import logger


MAX_RESPONSE_BYTES = 15 * 1024 * 1024  # 15 MB
MAX_REDIRECTS = 5


class FetchResponse:
    def __init__(self, url: str, status_code: int, html: str, load_time_ms: float, headers: dict):
        self.url = url
        self.status_code = status_code
        self.html = html
        self.load_time_ms = load_time_ms
        self.headers = headers


class WebFetcherService:
    """Async HTTP fetcher with SSRF-safe redirect validation, timeout, and response size limits."""

    def __init__(
        self,
        timeout: Optional[int] = None,
        user_agent: Optional[str] = None,
        custom_headers: Optional[Dict[str, str]] = None,
    ):
        self.timeout = timeout or settings.REQUEST_TIMEOUT_SECONDS
        self.user_agent = user_agent or settings.DEFAULT_USER_AGENT
        self.custom_headers = custom_headers or {}

    async def fetch(self, url: str) -> FetchResponse:
        """Safely fetches remote webpage content with redirect verification."""
        headers = {
            "User-Agent": self.user_agent,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
        }
        headers.update(self.custom_headers)

        start_time = time.perf_counter()
        current_url = url
        redirect_count = 0

        try:
            async with httpx.AsyncClient(
                timeout=httpx.Timeout(self.timeout, connect=10.0),
                follow_redirects=False,
                verify=True,
            ) as client:
                while True:
                    # Validate current URL before sending request
                    safe_url = validate_target_url(current_url)

                    response = await client.get(safe_url, headers=headers)

                    # Check for redirect (301, 302, 303, 307, 308)
                    if response.is_redirect:
                        redirect_count += 1
                        if redirect_count > MAX_REDIRECTS:
                            raise FetchError(f"Exceeded maximum redirection limit ({MAX_REDIRECTS}).")

                        location = response.headers.get("location")
                        if not location:
                            break

                        next_url = validate_redirect_url(location, safe_url)
                        logger.info(f"Following redirect {redirect_count}: {safe_url} -> {next_url}")
                        current_url = next_url
                        continue

                    # Check content size
                    content_length = response.headers.get("content-length")
                    if content_length and int(content_length) > MAX_RESPONSE_BYTES:
                        raise FetchError(
                            f"Remote webpage exceeds maximum allowed size ({MAX_RESPONSE_BYTES // (1024 * 1024)}MB)."
                        )

                    # Read content with byte cap
                    content_bytes = response.content
                    if len(content_bytes) > MAX_RESPONSE_BYTES:
                        raise FetchError(
                            f"Remote content exceeds maximum allowed size ({MAX_RESPONSE_BYTES // (1024 * 1024)}MB)."
                        )

                    html_text = response.text
                    load_time_ms = round((time.perf_counter() - start_time) * 1000, 2)

                    logger.info(
                        f"Fetched '{safe_url}' - Status: {response.status_code} ({load_time_ms}ms, {len(content_bytes)} bytes)"
                    )

                    return FetchResponse(
                        url=str(response.url),
                        status_code=response.status_code,
                        html=html_text,
                        load_time_ms=load_time_ms,
                        headers=dict(response.headers),
                    )

        except httpx.TimeoutException:
            logger.error(f"Timeout fetching '{url}' after {self.timeout}s")
            raise FetchError(f"Connection timed out after {self.timeout} seconds.")
        except SecurityViolationException as e:
            logger.warning(f"Security blocked fetch to '{url}': {e.message}")
            raise e
        except FetchError as e:
            raise e
        except httpx.RequestError as e:
            logger.error(f"Network error fetching '{url}': {str(e)}")
            raise FetchError(f"Network request error: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error fetching '{url}': {str(e)}")
            raise FetchError(f"Failed to fetch content: {str(e)}")
