import asyncio
from typing import List, Set, Dict, Any, Optional
from collections import deque
from app.services.validation.url_validator import URLValidatorService
from app.services.scraping.fetcher import WebFetcherService, FetchResponse
from app.services.scraping.html_parser import HTMLParserService
from app.services.scraping.robots_service import RobotsTxtService
from app.core.config import settings
from app.utils.logger import logger


PAGINATION_KEYWORDS = {"next", "older", "page-next", "pagination-next", "›", "»", ">"}


class CrawlPaginationService:
    """Service coordinating controlled multi-page crawling, link discovery, and pagination traversal."""

    def __init__(
        self,
        base_url: str,
        max_depth: int = 1,
        max_pages: Optional[int] = None,
        fetcher: Optional[WebFetcherService] = None,
        request_delay: float = 0.5,
        retry_count: int = 1,
        same_domain_only: bool = True,
        follow_pagination: bool = False,
        user_agent: Optional[str] = None,
    ):
        self.base_url = base_url
        self.max_depth = min(max_depth, settings.MAX_CRAWL_DEPTH)
        self.max_pages = min(max_pages or 1, settings.MAX_PAGES_PER_JOB)
        self.fetcher = fetcher or WebFetcherService(user_agent=user_agent)
        self.request_delay = max(0.0, min(request_delay, 10.0))
        self.retry_count = max(0, min(retry_count, 5))
        self.same_domain_only = same_domain_only
        self.follow_pagination = follow_pagination
        self.user_agent = user_agent
        self.visited_urls: Set[str] = set()

    async def crawl_queue(self) -> List[Dict[str, Any]]:
        """
        Executes bounded BFS crawl. Returns a list of dicts:
        [{"url": str, "depth": int, "fetch_response": FetchResponse, "status": "success"|"failed"}]
        """
        crawled_items: List[Dict[str, Any]] = []
        # Queue contains: (url, current_depth)
        queue = deque([(self.base_url, 1)])
        self.visited_urls.add(self.base_url)

        first_page = True

        while queue and len(crawled_items) < self.max_pages:
            current_url, depth = queue.popleft()

            # Respect request delay between pages (after the first page)
            if not first_page and self.request_delay > 0:
                await asyncio.sleep(self.request_delay)
            first_page = False

            # Check robots.txt for URL permission
            robots_check = await RobotsTxtService.check_url_permission(current_url, self.user_agent)
            if not robots_check["allowed"]:
                logger.info(f"Skipping crawling disallowed URL by robots.txt: {current_url}")
                continue

            # Attempt fetch with retries
            fetch_res: Optional[FetchResponse] = None
            last_err = None
            for attempt in range(self.retry_count + 1):
                try:
                    fetch_res = await self.fetcher.fetch(current_url)
                    break
                except Exception as e:
                    last_err = e
                    if attempt < self.retry_count:
                        await asyncio.sleep(0.5 * (attempt + 1))

            if not fetch_res:
                logger.warning(f"Failed to crawl '{current_url}' after {self.retry_count} retries: {str(last_err)}")
                crawled_items.append({
                    "url": current_url,
                    "depth": depth,
                    "fetch_response": None,
                    "status": "failed",
                    "error": str(last_err),
                })
                continue

            crawled_items.append({
                "url": current_url,
                "depth": depth,
                "fetch_response": fetch_res,
                "status": "success",
                "error": None,
            })

            # Check if we should discover more links
            if len(crawled_items) >= self.max_pages:
                break

            if depth >= self.max_depth and not self.follow_pagination:
                continue

            # Parse discovered links
            try:
                soup = HTMLParserService.parse(fetch_res.html)

                # 1. Check for dedicated pagination next-page link
                next_page_url = None
                if self.follow_pagination:
                    next_link = soup.find("link", rel="next") or soup.find("a", rel="next")
                    if not next_link:
                        # Search by class or text containing pagination next
                        for a in soup.find_all("a", href=True):
                            text = a.get_text().strip().lower()
                            classes = " ".join(a.get("class", [])).lower()
                            if any(k in text for k in PAGINATION_KEYWORDS) or any(k in classes for k in PAGINATION_KEYWORDS):
                                next_link = a
                                break
                    if next_link and next_link.get("href"):
                        next_page_url = URLValidatorService.resolve_absolute_url(fetch_res.url, next_link["href"].strip())

                if next_page_url and next_page_url not in self.visited_urls:
                    if not self.same_domain_only or URLValidatorService.is_same_domain(self.base_url, next_page_url):
                        self.visited_urls.add(next_page_url)
                        queue.appendleft((next_page_url, depth + 1))  # Priority for pagination

                # 2. Add other internal links if within depth limit
                if depth < self.max_depth:
                    for a_tag in soup.find_all("a", href=True):
                        href = a_tag["href"].strip()
                        if href.startswith(("#", "javascript:", "mailto:", "tel:")):
                            continue
                        abs_url = URLValidatorService.resolve_absolute_url(fetch_res.url, href)
                        if abs_url in self.visited_urls:
                            continue
                        if self.same_domain_only and not URLValidatorService.is_same_domain(self.base_url, abs_url):
                            continue
                        self.visited_urls.add(abs_url)
                        queue.append((abs_url, depth + 1))
            except Exception as e:
                logger.warning(f"Error parsing child links on '{current_url}': {str(e)}")

        return crawled_items
