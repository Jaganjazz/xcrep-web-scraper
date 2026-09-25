import { apiClient } from './client';

export const scrapeApi = {
  /**
   * Execute a scrape job.
   * POST /api/v1/scrape/
   */
  executeScrape: async (payload) => {
    return apiClient.post('/scrape/', payload);
  },

  /**
   * Validate target URL before scraping.
   * POST /api/v1/scrape/validate-url
   */
  validateUrl: async (url) => {
    return apiClient.post('/scrape/validate-url', { url });
  },

  /**
   * Fetch a completed job's full detail.
   * GET /api/v1/history/:jobId
   */
  getJobDetail: async (jobId) => {
    return apiClient.get(`/history/${jobId}`);
  },
};
