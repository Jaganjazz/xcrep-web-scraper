class ScraperBaseException(Exception):
    """Base exception for all scraper errors."""
    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


class InvalidURLException(ScraperBaseException):
    """Raised when a URL is invalid or malformed."""
    def __init__(self, message: str = "Invalid URL provided."):
        super().__init__(message, status_code=422)


class SecurityViolationException(ScraperBaseException):
    """Raised when a URL violates SSRF or security constraints."""
    def __init__(self, message: str = "URL violates security policy."):
        super().__init__(message, status_code=403)


class FetchError(ScraperBaseException):
    """Raised when an HTTP fetch fails."""
    def __init__(self, message: str = "Failed to fetch webpage."):
        super().__init__(message, status_code=502)


class ParserError(ScraperBaseException):
    """Raised when HTML parsing fails."""
    def __init__(self, message: str = "Failed to parse webpage HTML."):
        super().__init__(message, status_code=500)


class JobNotFoundException(ScraperBaseException):
    """Raised when a scrape job is not found."""
    def __init__(self, job_id: str):
        super().__init__(f"Scraping job '{job_id}' not found.", status_code=404)


class DatasetNotFoundException(ScraperBaseException):
    """Raised when a dataset is not found."""
    def __init__(self, dataset_id: str):
        super().__init__(f"Dataset '{dataset_id}' not found.", status_code=404)
