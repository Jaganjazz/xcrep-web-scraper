import time
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from app.services.validation.url_validator import URLValidatorService
from app.services.scraping.fetcher import WebFetcherService, FetchResponse
from app.services.scraping.html_parser import HTMLParserService
from app.services.scraping.robots_service import RobotsTxtService
from app.services.scraping.crawl_service import CrawlPaginationService
from app.services.extractors import ExtractionPipeline
from app.services.history.history_service import HistoryService
from app.models.job import JobStatus, ScrapingJob
from app.schemas.scrape import ExtractionOptions, ScrapeRequest
from app.core.exceptions import ScraperBaseException, FetchError
from app.utils.logger import logger


class ScrapingService:
    """Production scraping coordinator combining security validation, robots.txt,
    multi-page crawling, BeautifulSoup extraction pipeline, and database persistence."""

    def __init__(self, db: Session):
        self.db = db
        self.history_service = HistoryService(db)
        self.pipeline = ExtractionPipeline()

    async def execute_scrape(self, request: ScrapeRequest) -> Dict[str, Any]:
        start_time = time.perf_counter()

        # 1. SSRF & URL Validation
        safe_url = URLValidatorService.validate_and_normalize(request.url)
        options = request.extract or request.options or ExtractionOptions()

        # 2. Check Robots.txt permission (Phase 10)
        robots_result = await RobotsTxtService.check_url_permission(safe_url, request.user_agent)
        if not robots_result["allowed"]:
            logger.warning(f"Scraping prevented by robots.txt for {safe_url}: {robots_result['reason']}")
            raise FetchError(
                f"Robots.txt Blocked: {robots_result['reason']}. Scraping cannot proceed."
            )

        # 3. Create persistent ScrapeJob in DB
        job = self.history_service.create_job(safe_url, options)
        self.history_service.update_job_status(job.id, JobStatus.RUNNING)

        is_multipage = (
            (request.max_pages and request.max_pages > 1)
            or (request.max_depth and request.max_depth > 1)
            or request.follow_pagination
        )

        try:
            aggregated_results: Dict[str, Any] = {
                "title": "",
                "clean_text": "",
                "links": [],
                "images": [],
                "headings": [],
                "tables": [],
                "metadata": {},
                "emails": [],
                "raw_html": "",
                "total_items": 0,
            }
            pages_scraped = 0
            seen_link_urls = set()
            seen_image_srcs = set()
            seen_emails = set()

            fetcher = WebFetcherService(
                timeout=request.timeout,
                user_agent=request.user_agent,
                custom_headers=request.custom_headers,
            )

            if not is_multipage:
                # Single-page direct fetch
                fetch_res: FetchResponse = await fetcher.fetch(safe_url)
                soup = HTMLParserService.parse(fetch_res.html)

                # If CSS selector provided, narrow soup
                target_soup = soup
                if request.css_selector:
                    selected = soup.select(request.css_selector)
                    if selected:
                        from bs4 import BeautifulSoup
                        target_soup = BeautifulSoup("".join(str(s) for s in selected), "html.parser")

                extracted = self.pipeline.run(target_soup, safe_url, fetch_res.html, options)
                aggregated_results = extracted
                pages_scraped = 1

                # Record page and content items in DB
                self.history_service.record_page_content(
                    job_id=job.id,
                    url=fetch_res.url,
                    status_code=fetch_res.status_code,
                    load_time_ms=fetch_res.load_time_ms,
                    extracted_data=extracted,
                    title=extracted.get("title"),
                    depth=1,
                )
            else:
                # Multi-page BFS crawl
                crawler = CrawlPaginationService(
                    base_url=safe_url,
                    max_depth=request.max_depth or 1,
                    max_pages=request.max_pages or 5,
                    fetcher=fetcher,
                    request_delay=request.request_delay or 0.5,
                    retry_count=request.retry_count or 1,
                    same_domain_only=request.same_domain_only if request.same_domain_only is not None else True,
                    follow_pagination=bool(request.follow_pagination),
                    user_agent=request.user_agent,
                )

                crawl_items = await crawler.crawl_queue()

                for item in crawl_items:
                    if item["status"] != "success" or not item["fetch_response"]:
                        continue

                    f_res: FetchResponse = item["fetch_response"]
                    soup = HTMLParserService.parse(f_res.html)
                    page_extracted = self.pipeline.run(soup, f_res.url, f_res.html, options)
                    pages_scraped += 1

                    if not aggregated_results["title"] and page_extracted.get("title"):
                        aggregated_results["title"] = page_extracted["title"]

                    # Append and deduplicate items
                    for link in page_extracted.get("links", []):
                        if link.get("url") not in seen_link_urls:
                            seen_link_urls.add(link.get("url"))
                            aggregated_results["links"].append(link)

                    for img in page_extracted.get("images", []):
                        if img.get("src") not in seen_image_srcs:
                            seen_image_srcs.add(img.get("src"))
                            aggregated_results["images"].append(img)

                    for email in page_extracted.get("emails", []):
                        if email not in seen_emails:
                            seen_emails.add(email)
                            aggregated_results["emails"].append(email)

                    aggregated_results["headings"].extend(page_extracted.get("headings", []))
                    aggregated_results["tables"].extend(page_extracted.get("tables", []))

                    if page_extracted.get("clean_text"):
                        if aggregated_results["clean_text"]:
                            aggregated_results["clean_text"] += "\n\n--- Page: " + f_res.url + " ---\n\n"
                        aggregated_results["clean_text"] += page_extracted["clean_text"]

                    if not aggregated_results["metadata"] and page_extracted.get("metadata"):
                        aggregated_results["metadata"] = page_extracted["metadata"]

                    if not aggregated_results["raw_html"] and page_extracted.get("raw_html"):
                        aggregated_results["raw_html"] = page_extracted["raw_html"]

                    # Persist page in database
                    self.history_service.record_page_content(
                        job_id=job.id,
                        url=f_res.url,
                        status_code=f_res.status_code,
                        load_time_ms=f_res.load_time_ms,
                        extracted_data=page_extracted,
                        title=page_extracted.get("title"),
                        depth=item.get("depth", 1),
                    )

            # Calculate metrics
            total_duration = time.perf_counter() - start_time
            links_count = len(aggregated_results.get("links", []))
            images_count = len(aggregated_results.get("images", []))
            headings_count = len(aggregated_results.get("headings", []))
            tables_count = len(aggregated_results.get("tables", []))
            emails_count = len(aggregated_results.get("emails", []))
            words_count = len(aggregated_results.get("clean_text", "").split())
            total_items = (
                links_count
                + images_count
                + headings_count
                + tables_count
                + emails_count
                + (1 if aggregated_results.get("title") else 0)
            )
            aggregated_results["total_items"] = total_items
            aggregated_results["word_count"] = words_count

            # Finalize DB Job
            self.history_service.update_job_status(
                job_id=job.id,
                status=JobStatus.COMPLETED,
                total_items=total_items,
                pages_crawled=pages_scraped,
                pages_scraped=pages_scraped,
                duration=total_duration,
                links_count=links_count,
                images_count=images_count,
                headings_count=headings_count,
                tables_count=tables_count,
                emails_count=emails_count,
                words_count=words_count,
            )

            return {
                "job_id": job.id,
                "target_url": safe_url,
                "status": JobStatus.COMPLETED.value,
                "total_items": total_items,
                "pages_crawled": pages_scraped,
                "pages_scraped": pages_scraped,
                "duration": round(total_duration, 2),
                "load_time_ms": round(total_duration * 1000, 2),
                "robots_status": robots_result["status"],
                "robots_reason": robots_result["reason"],
                "results": aggregated_results,
            }

        except Exception as e:
            total_duration = time.perf_counter() - start_time
            logger.error(f"Scrape job failed for {safe_url}: {str(e)}")
            self.history_service.update_job_status(
                job_id=job.id,
                status=JobStatus.FAILED,
                error_message=str(e),
                duration=total_duration,
            )
            raise e
