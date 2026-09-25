import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { scrapeApi } from '../api/scrapeApi';
import { historyApi } from '../api/historyApi';
import { exportApi } from '../api/exportApi';
import { datasetsApi } from '../api/datasetsApi';
import { useToast } from '../components/common/Toast';

const ScrapeContext = createContext();

export const ScrapeProvider = ({ children }) => {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [targetUrl, setTargetUrl] = useState('');
  const [currentResult, setCurrentResult] = useState(null);
  const [activeResultTab, setActiveResultTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Recent scrapes state
  const [recentScrapes, setRecentScrapes] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Global search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Extraction options (Default: All checked except html)
  const [extractionOptions, setExtractionOptions] = useState({
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
  });

  // Advanced options (Phase 4)
  const [advancedOptions, setAdvancedOptions] = useState({
    user_agent: '',
    timeout: 15,
    retry_count: 2,
    max_pages: 1,
    max_depth: 1,
    request_delay: 0.5,
    follow_pagination: false,
    same_domain_only: true,
    css_selector: '',
  });

  // Real-time progress (Phase 18)
  const [scrapeProgress, setScrapeProgress] = useState({
    inProgress: false,
    step: '',
    percent: 0,
    message: '',
    logs: [],
  });

  const toggleOption = (key) => {
    setExtractionOptions((prev) => {
      if (key === 'extract_all') {
        const nextVal = !prev.extract_all;
        return {
          extract_all: nextVal,
          title: true,
          text: nextVal,
          links: nextVal,
          images: nextVal,
          headings: nextVal,
          tables: nextVal,
          metadata: nextVal,
          emails: nextVal,
          html: prev.html,
        };
      }
      const updated = {
        ...prev,
        [key]: !prev[key],
      };
      // Check if all primary options are on
      const allActive =
        updated.text &&
        updated.links &&
        updated.images &&
        updated.headings &&
        updated.tables &&
        updated.metadata &&
        updated.emails;
      updated.extract_all = allActive;
      return updated;
    });
  };

  const loadExampleUrl = (exampleType = 'standard') => {
    const examples = {
      standard: 'https://news.ycombinator.com',
      ecommerce: 'https://books.toscrape.com',
      html: 'https://example.com',
    };
    const selected = examples[exampleType] || 'https://news.ycombinator.com';
    setTargetUrl(selected);
    toast.info(`Loaded example URL: ${selected}`);
  };

  const fetchRecentScrapes = useCallback(async () => {
    try {
      setIsLoadingHistory(true);
      const res = await historyApi.getHistory(1, 10);
      setRecentScrapes(res.jobs || []);
    } catch (err) {
      console.warn('Could not load history:', err.message);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchRecentScrapes();
  }, [fetchRecentScrapes]);

  const executeScrape = async (overrideUrl = null, overrideOptions = null, overrideAdvanced = null) => {
    const rawUrl = (overrideUrl !== null ? overrideUrl : targetUrl).trim();
    if (!rawUrl) {
      toast.error('Please enter a website URL to start scraping.');
      return null;
    }

    const opts = overrideOptions || extractionOptions;
    const adv = overrideAdvanced || advancedOptions;

    setIsLoading(true);
    setError(null);
    setScrapeProgress({
      inProgress: true,
      step: 'validating',
      percent: 15,
      message: 'Validating URL & checking security...',
      logs: ['Validating URL syntax & scheme', 'Checking SSRF protection...'],
    });

    try {
      // 1. URL & Robots Validation
      const valRes = await scrapeApi.validateUrl(rawUrl);
      if (!valRes.valid) {
        throw new Error(valRes.error || 'Invalid or prohibited URL.');
      }

      setScrapeProgress({
        inProgress: true,
        step: 'robots',
        percent: 35,
        message: `Robots.txt status: ${valRes.robots?.status || 'allowed'}`,
        logs: [
          'URL verified safe.',
          `Robots.txt evaluated: ${valRes.robots?.reason || 'Allowed'}`,
          'Connecting to remote host...',
        ],
      });

      // 2. Execute Real Scraping via API
      setScrapeProgress((prev) => ({
        ...prev,
        step: 'extracting',
        percent: 65,
        message: 'Parsing HTML with BeautifulSoup & extracting data...',
        logs: [
          ...prev.logs,
          'Fetching webpage content...',
          'Building BeautifulSoup DOM tree...',
          'Executing selective data extractors...',
        ],
      }));

      const payload = {
        url: valRes.normalized_url || rawUrl,
        extract: opts,
        user_agent: adv.user_agent || null,
        timeout: Number(adv.timeout) || 15,
        retry_count: Number(adv.retry_count) || 2,
        max_pages: Number(adv.max_pages) || 1,
        max_depth: Number(adv.max_depth) || 1,
        request_delay: Number(adv.request_delay) || 0.5,
        follow_pagination: Boolean(adv.follow_pagination),
        same_domain_only: Boolean(adv.same_domain_only),
        css_selector: adv.css_selector || null,
      };

      const result = await scrapeApi.executeScrape(payload);

      setScrapeProgress((prev) => ({
        ...prev,
        step: 'persisting',
        percent: 90,
        message: 'Persisting results into database...',
        logs: [...prev.logs, `Extracted ${result.total_items} data items.`, 'Saving to database...'],
      }));

      // Set Result and Active Tab
      setCurrentResult(result);
      setActiveResultTab('overview');

      setScrapeProgress((prev) => ({
        ...prev,
        step: 'completed',
        percent: 100,
        message: 'Scraping completed successfully!',
        logs: [...prev.logs, 'Scrape job completed.'],
      }));

      toast.success(`Successfully extracted ${result.total_items} items in ${result.duration || (result.load_time_ms ? (result.load_time_ms / 1000).toFixed(2) : '1.2')}s!`);
      fetchRecentScrapes();
      return result;
    } catch (err) {
      const msg = err.message || 'Scraping failed.';
      setError(msg);
      toast.error(msg);
      setScrapeProgress((prev) => ({
        ...prev,
        inProgress: false,
        step: 'failed',
        percent: 100,
        message: `Failed: ${msg}`,
        logs: [...prev.logs, `Error: ${msg}`],
      }));
      return null;
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setScrapeProgress((prev) => ({ ...prev, inProgress: false }));
      }, 1800);
    }
  };

  const exportCurrentData = async (format = 'json', tabName = null) => {
    if (!currentResult) {
      toast.error('No scraped data available to export.');
      return;
    }

    try {
      toast.info(`Preparing ${format.toUpperCase()} export...`);
      const payload = {
        job_id: currentResult.job_id || null,
        data: currentResult.results || {},
        format: format.toLowerCase(),
        tab: tabName,
        base_name: currentResult.results?.title || 'scrape_export',
      };

      const res = await exportApi.requestExport(payload);
      if (res && res.download_url) {
        exportApi.triggerBrowserDownload(res.download_url, res.file_name);
        toast.success(`Downloaded ${res.file_name}!`);
      }
    } catch (err) {
      toast.error(`Export failed: ${err.message}`);
    }
  };

  const saveCurrentAsDataset = async (name, description = '') => {
    if (!currentResult) {
      toast.error('No scraped data to save.');
      return;
    }

    try {
      const payload = {
        name: name || currentResult.results?.title || 'Unnamed Dataset',
        description: description || `Extracted from ${currentResult.target_url}`,
        job_id: currentResult.job_id,
        tags: ['web-scraper', currentResult.target_url ? new URL(currentResult.target_url).hostname : 'web'],
      };

      await datasetsApi.createDataset(payload);
      toast.success(`Dataset "${payload.name}" saved successfully!`);
    } catch (err) {
      toast.error(`Failed to save dataset: ${err.message}`);
    }
  };

  const deleteScrape = async (jobId) => {
    try {
      await historyApi.deleteJob(jobId);
      toast.success('Scrape record deleted.');
      fetchRecentScrapes();
      if (currentResult && currentResult.job_id === jobId) {
        setCurrentResult(null);
      }
    } catch (err) {
      toast.error(`Failed to delete scrape: ${err.message}`);
    }
  };

  const loadScrapeDetail = async (jobId) => {
    try {
      setIsLoading(true);
      const detail = await historyApi.getJobDetail(jobId);
      setCurrentResult({
        job_id: detail.id,
        target_url: detail.target_url,
        status: detail.status,
        total_items: detail.total_items,
        pages_crawled: detail.pages_crawled,
        duration: detail.duration,
        results: detail.results || {},
      });
      setActiveTab('scrape');
      setActiveResultTab('overview');
      toast.info(`Loaded scrape details for ${detail.target_url}`);
    } catch (err) {
      toast.error(`Failed to load scrape details: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrapeContext.Provider
      value={{
        activeTab,
        setActiveTab,
        targetUrl,
        setTargetUrl,
        loadExampleUrl,
        currentResult,
        setCurrentResult,
        activeResultTab,
        setActiveResultTab,
        isLoading,
        setIsLoading,
        error,
        setError,
        extractionOptions,
        setExtractionOptions,
        toggleOption,
        advancedOptions,
        setAdvancedOptions,
        scrapeProgress,
        executeScrape,
        exportCurrentData,
        saveCurrentAsDataset,
        recentScrapes,
        isLoadingHistory,
        fetchRecentScrapes,
        deleteScrape,
        loadScrapeDetail,
        searchQuery,
        setSearchQuery,
        isSearchOpen,
        setIsSearchOpen,
      }}
    >
      {children}
    </ScrapeContext.Provider>
  );
};

export const useScrape = () => {
  const context = useContext(ScrapeContext);
  if (!context) {
    throw new Error('useScrape must be used within a ScrapeProvider');
  }
  return context;
};
