import { useState, useCallback, useRef } from 'react';
import { scrapeApi } from '../api/scrapeApi';

/* ─── Default Advanced Options ──────────────────────────────── */
export const DEFAULT_ADVANCED = {
  userAgent: '',
  timeout: 15,
  retryCount: 2,
  maxPages: 1,
  crawlDepth: 1,
  requestDelay: 0,
  followPagination: false,
  cssSelector: '',
};

/* ─── Default Extraction Options ─────────────────────────────── */
export const DEFAULT_EXTRACTION = {
  extract_all: true,
  title: true,
  text: true,
  links: true,
  images: true,
  headings: true,
  tables: true,
  metadata: true,
  emails: true,
  html: false,
};

/* ─── Scrape Status Shape ─────────────────────────────────────
   currentUrl       – URL being scraped right now
   currentPage      – page index currently fetching
   pagesCompleted   – pages successfully finished
   totalPages       – estimated total pages
   currentOp        – short operation label
   progressPct      – 0–100
   elapsedMs        – elapsed time in ms
   ─────────────────────────────────────────────────────────── */
const IDLE_STATUS = {
  phase: 'idle',        // 'idle' | 'requesting' | 'parsing' | 'done' | 'error'
  currentUrl: '',
  currentPage: 0,
  pagesCompleted: 0,
  totalPages: 1,
  currentOp: '',
  progressPct: 0,
  elapsedMs: 0,
};

/* ─── URL Validator ───────────────────────────────────────────── */
export function validateUrl(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return 'URL is required.';
  try {
    const parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return 'Only http and https URLs are supported.';
    }
    return null; // valid
  } catch {
    return 'Please enter a valid URL (e.g. https://example.com).';
  }
}

/* ─── Hook ────────────────────────────────────────────────────── */
export function useScrapeWorkspace() {
  /* URL input */
  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState(null);

  /* Extraction options */
  const [extraction, setExtraction] = useState(DEFAULT_EXTRACTION);

  /* Advanced options */
  const [advanced, setAdvanced] = useState(DEFAULT_ADVANCED);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  /* Scrape state */
  const [status, setStatus] = useState(IDLE_STATUS);
  const [result, setResult] = useState(null);   // ScrapeResultPayload (real API) or null
  const [scrapeError, setScrapeError] = useState(null);

  /* Active result tab */
  const [activeTab, setActiveTab] = useState('overview');

  /* Timer ref for elapsed time */
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  /* ── Extraction toggle ── */
  const toggleExtraction = useCallback((key) => {
    setExtraction((prev) => {
      if (key === 'extract_all') {
        const next = !prev.extract_all;
        return Object.fromEntries(
          Object.keys(DEFAULT_EXTRACTION).map((k) => [
            k,
            k === 'extract_all' ? next : k === 'html' ? prev.html : next,
          ])
        );
      }
      return { ...prev, [key]: !prev[key], extract_all: false };
    });
  }, []);

  /* ── Advanced field setter ── */
  const setAdvancedField = useCallback((key, value) => {
    setAdvanced((prev) => ({ ...prev, [key]: value }));
  }, []);

  /* ── URL validate ── */
  const handleUrlChange = useCallback((val) => {
    setUrl(val);
    if (urlError) setUrlError(null);
  }, [urlError]);

  const handleValidateUrl = useCallback(() => {
    const err = validateUrl(url);
    setUrlError(err);
    return !err;
  }, [url]);

  /* ── Reset / clear ── */
  const handleClear = useCallback(() => {
    setUrl('');
    setUrlError(null);
    setResult(null);
    setScrapeError(null);
    setStatus(IDLE_STATUS);
    setActiveTab('overview');
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  /* ── Load example ── */
  const handleLoadExample = useCallback(() => {
    setUrl('https://example.com');
    setUrlError(null);
  }, []);

  /* ── Tick elapsed timer ── */
  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setStatus((prev) => ({
        ...prev,
        elapsedMs: Date.now() - startTimeRef.current,
      }));
    }, 250);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  /* ── Start scraping ── */
  const handleStartScraping = useCallback(async () => {
    const err = validateUrl(url);
    if (err) { setUrlError(err); return; }

    setScrapeError(null);
    setResult(null);
    setActiveTab('overview');

    const normalizedUrl = url.startsWith('http') ? url.trim() : `https://${url.trim()}`;

    /* Build status immediately */
    setStatus({
      phase: 'requesting',
      currentUrl: normalizedUrl,
      currentPage: 1,
      pagesCompleted: 0,
      totalPages: advanced.maxPages,
      currentOp: 'Connecting to server…',
      progressPct: 5,
      elapsedMs: 0,
    });

    startTimer();

    /* Build API payload — matches backend ScrapeRequest */
    const payload = {
      url: normalizedUrl,
      options: {
        extract_all: extraction.extract_all,
        text: extraction.text,
        links: extraction.links,
        images: extraction.images,
        headings: extraction.headings,
        tables: extraction.tables,
        metadata: extraction.metadata,
        html: extraction.html,
        // emails not yet in backend schema — still sent for forward-compatibility
        emails: extraction.emails,
      },
      max_depth: advanced.crawlDepth,
      timeout: advanced.timeout,
      user_agent: advanced.userAgent || null,
      retry_count: advanced.retryCount,
      max_pages: advanced.maxPages,
      request_delay: advanced.requestDelay,
      follow_pagination: advanced.followPagination,
      css_selector: advanced.cssSelector || null,
    };

    try {
      setStatus((prev) => ({ ...prev, currentOp: 'Fetching page…', progressPct: 20 }));

      const data = await scrapeApi.executeScrape(payload);

      setStatus((prev) => ({
        ...prev,
        phase: 'parsing',
        currentOp: 'Parsing extracted data…',
        progressPct: 85,
        pagesCompleted: 1,
      }));

      /* Small yield for UI to reflect parsing state */
      await new Promise((r) => setTimeout(r, 200));

      stopTimer();
      const elapsed = Date.now() - startTimeRef.current;

      setStatus({
        phase: 'done',
        currentUrl: normalizedUrl,
        currentPage: 1,
        pagesCompleted: data.pages_crawled ?? 1,
        totalPages: data.pages_crawled ?? 1,
        currentOp: 'Extraction complete',
        progressPct: 100,
        elapsedMs: elapsed,
      });

      setResult(data);
      setActiveTab('overview');
    } catch (e) {
      stopTimer();
      setStatus((prev) => ({
        ...prev,
        phase: 'error',
        currentOp: 'Scrape failed',
        progressPct: 0,
        elapsedMs: Date.now() - startTimeRef.current,
      }));
      setScrapeError(e.message || 'An unexpected error occurred.');
    }
  }, [url, extraction, advanced, startTimer, stopTimer]);

  return {
    /* URL */
    url, setUrl: handleUrlChange, urlError, handleValidateUrl,
    /* Extraction */
    extraction, toggleExtraction,
    /* Advanced */
    advanced, setAdvancedField, advancedOpen, setAdvancedOpen,
    /* Scrape state */
    status, result, scrapeError, setScrapeError,
    /* Actions */
    handleStartScraping, handleClear, handleLoadExample,
    /* Result tab */
    activeTab, setActiveTab,
  };
}
