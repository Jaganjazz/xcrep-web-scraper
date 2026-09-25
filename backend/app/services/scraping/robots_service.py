import time
from typing import Dict, Any, Optional
from urllib.parse import urlparse, urljoin
from urllib.robotparser import RobotFileParser
import httpx
from app.core.config import settings
from app.core.security import validate_target_url
from app.utils.logger import logger


class RobotsTxtService:
    """Fetches, parses, caches, and validates domain robots.txt rules."""

    _cache: Dict[str, Dict[str, Any]] = {}
    CACHE_TTL_SECONDS = 3600

    @classmethod
    def get_robots_url(cls, target_url: str) -> str:
        parsed = urlparse(target_url)
        return f"{parsed.scheme}://{parsed.netloc}/robots.txt"

    @classmethod
    async def check_url_permission(
        cls,
        target_url: str,
        user_agent: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Evaluates whether target_url is allowed by the domain's robots.txt.
        Returns:
            {
                "status": "allowed" | "restricted" | "blocked",
                "allowed": bool,
                "reason": str,
                "crawl_delay": Optional[float]
            }
        """
        ua = user_agent or settings.DEFAULT_USER_AGENT
        parsed = urlparse(target_url)
        domain_key = f"{parsed.scheme}://{parsed.netloc}"

        # 1. Check memory cache
        cached = cls._cache.get(domain_key)
        now = time.time()
        if cached and (now - cached["timestamp"] < cls.CACHE_TTL_SECONDS):
            parser = cached["parser"]
            has_rules = cached["has_rules"]
        else:
            parser, has_rules = await cls._fetch_and_parse(domain_key)
            cls._cache[domain_key] = {
                "parser": parser,
                "has_rules": has_rules,
                "timestamp": now,
            }

        if parser is None:
            # Domain has no robots.txt or returned 404/empty
            return {
                "status": "allowed",
                "allowed": True,
                "reason": "Domain has no robots.txt or allows all scraping.",
                "crawl_delay": None,
            }

        # Check path against robots.txt rules
        path_to_check = parsed.path or "/"
        if parsed.query:
            path_to_check += f"?{parsed.query}"

        # Evaluate default agent and specific user-agent
        allowed = parser.can_fetch(ua, target_url) and parser.can_fetch("*", target_url)
        crawl_delay = None
        try:
            crawl_delay = parser.crawl_delay(ua) or parser.crawl_delay("*")
        except Exception:
            pass

        if not allowed:
            logger.warning(f"Robots.txt blocks scraping path '{path_to_check}' on {domain_key}")
            return {
                "status": "blocked",
                "allowed": False,
                "reason": f"Scraping '{path_to_check}' is explicitly disallowed by {domain_key}/robots.txt",
                "crawl_delay": crawl_delay,
            }

        # If rules exist but this path is allowed
        if has_rules:
            return {
                "status": "restricted" if crawl_delay else "allowed",
                "allowed": True,
                "reason": f"Path is permitted. Domain has active robots.txt rules{f' (crawl delay: {crawl_delay}s)' if crawl_delay else ''}.",
                "crawl_delay": crawl_delay,
            }

        return {
            "status": "allowed",
            "allowed": True,
            "reason": "Robots.txt permits extraction.",
            "crawl_delay": crawl_delay,
        }

    @classmethod
    async def _fetch_and_parse(cls, domain_key: str):
        robots_url = f"{domain_key}/robots.txt"
        try:
            # Validate URL with SSRF protection
            safe_robots_url = validate_target_url(robots_url)
            async with httpx.AsyncClient(timeout=8.0, follow_redirects=True, verify=False) as client:
                resp = await client.get(
                    safe_robots_url,
                    headers={"User-Agent": settings.DEFAULT_USER_AGENT},
                )
                if resp.status_code == 200 and resp.text:
                    parser = RobotFileParser()
                    parser.parse(resp.text.splitlines())
                    return parser, True
                else:
                    return None, False
        except Exception as e:
            logger.info(f"Robots.txt unreachable for {domain_key} ({str(e)}). Proceeding with permitted status.")
            return None, False
