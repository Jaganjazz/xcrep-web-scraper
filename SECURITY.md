# Security Architecture & Threat Model

Web Scraper is designed with a defense-in-depth security model to handle untrusted URLs and arbitrary web content safely without compromising the host server or client browsers.

---

## 1. Threat Model

The application accepts arbitrary user-supplied URLs and downloads remote content. The primary threat vectors addressed include:

1. **Server-Side Request Forgery (SSRF)**: Malicious actors attempting to query internal services (e.g. `localhost`, AWS metadata service `169.254.169.254`, Docker host IPs, or private LAN subnets).
2. **Cross-Site Scripting (XSS)**: Malicious JavaScript embedded in scraped target HTML executing inside the dashboard application.
3. **Denial of Service & Resource Exhaustion (DoS)**: Endless crawler loops, oversized HTTP payloads (zip bombs / terabyte streaming), or infinite HTTP redirects.
4. **Path Traversal & Arbitrary File Writes**: Crafted export file names or URL slugs attempting to write files outside the designated `exports/` folder.
5. **Information Leakage**: Stack traces, environment variables, or database paths leaked to end-users in error responses.

---

## 2. Implemented Security Controls

### A. Server-Side Request Forgery (SSRF) Guard
- **Strict Protocol Whitelisting**: Only `http://` and `https://` schemes are permitted. Schemes like `file://`, `ftp://`, `gopher://`, `javascript:`, or `data:` are blocked immediately prior to network execution.
- **DNS Resolution & IP Validation**:
  - The hostname is resolved via DNS prior to connection.
  - All resolved IPv4 and IPv6 addresses are checked against restricted CIDR blocks:
    - Loopback: `127.0.0.0/8`, `::1`
    - RFC 1918 Private Ranges: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`
    - Carrier-Grade NAT: `100.64.0.0/10`
    - Link-Local & Cloud Metadata: `169.254.0.0/16`, `fe80::/10`
    - Multicast & Reserved: `224.0.0.0/4`, `240.0.0.0/4`
    - IPv6 Unique Local: `fc00::/7`
- **Internal Domain Blocking**: Suffixes such as `.local`, `.localhost`, `.internal`, `.lan`, and `.corp` are blocked.
- **Redirect Validation**: HTTP redirects are resolved incrementally step-by-step. Each intermediate hop is re-validated through the SSRF guard before following.

### B. Cross-Site Scripting (XSS) Prevention
- In the React frontend, untrusted scraped HTML is **never** injected using `dangerouslySetInnerHTML`.
- Raw HTML source preview is rendered inside syntax-highlighted or preformatted code blocks as plain text with full HTML character escaping.

### C. Resource Exhaustion & Crawler Bounds
- **Maximum Response Size**: Incoming HTTP responses are capped at **15 MB**. Responses exceeding this limit are aborted immediately to prevent memory exhaustion.
- **Crawling Depth & Page Limits**: BFS crawlers enforce a strict cap (default 1 to 5 pages, configurable up to 20 pages max) and maximum crawl depth (1 to 3).
- **Domain Restriction**: Multi-page crawls are locked to the target domain by default to avoid traversing the wider internet.
- **Timeouts & Delays**: Configurable HTTP timeouts (default 15s) and inter-request crawler delays prevent hammering target servers.

### D. Path Traversal & Filename Sanitization
- All export file operations invoke `sanitize_filename()` which strips path separators (`/`, `\`), null bytes, control characters, and leading/trailing dots.
- Export files are saved strictly within the dedicated application `exports/` directory via `Path.resolve()`.

### E. Database Injection Protection
- All database queries use **SQLAlchemy ORM** with parameterized SQL statements, eliminating SQL injection vulnerabilities.

### F. Security Headers & Safe Error Handling
- The FastAPI middleware enforces standard security headers:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
- Global exception handlers catch unhandled exceptions, log detailed traces internally, and return sanitized error responses to clients without leaking system paths or stack traces.

---

## 3. Robots.txt Compliance

- Before initiating a scrape or multi-page crawl, the target domain's `robots.txt` file is fetched and parsed.
- Compliance status is reported as `allowed`, `restricted`, or `blocked`.
- Disallowed paths are respected and not crawled. `robots.txt` rules are cached in-memory with a 1-hour TTL to prevent redundant requests.

---

## 4. Known Limitations & Recommendations for Production

1. **DNS Rebinding**: While the application resolves and checks IPs before requesting, high-security production deployments should enforce egress proxy firewalls (e.g. Squid or Envoy) to prevent DNS rebinding attacks at the socket layer.
2. **Container Isolation**: Run the scraper inside an isolated Docker container with drop-all networking capabilities except outbound HTTP/HTTPS egress.
3. **Rate Limiting**: In multi-user production environments, configure reverse-proxy rate limiting (e.g. Nginx `limit_req` or Redis-backed token bucket) to throttle requests per client IP.
