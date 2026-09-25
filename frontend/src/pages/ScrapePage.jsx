import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { UrlInputCard } from '../components/dashboard/UrlInputCard';
import { ResultsDashboard } from '../components/results/ResultsDashboard';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Toggle } from '../components/common/Toggle';
import { LoadingState } from '../components/feedback/LoadingState';
import { ErrorState } from '../components/feedback/ErrorState';
import { EmptyState } from '../components/feedback/EmptyState';
import { useScrape } from '../context/ScrapeContext';
import { SettingsIcon } from '../components/common/Icons';

export const ScrapePage = () => {
  const {
    currentResult,
    isLoading,
    error,
    setError,
    advancedOptions,
    setAdvancedOptions,
  } = useScrape();

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const updateAdvanced = (key, val) => {
    setAdvancedOptions((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  return (
    <div className="scrape-page animate-fade-in">
      <div style={{ marginBottom: '1.75rem' }}>
        <h2
          style={{
            fontSize: '1.8rem',
            fontWeight: 'var(--weight-bold)',
            color: 'var(--text-white)',
            marginBottom: '0.35rem',
            letterSpacing: '-0.02em',
          }}
        >
          Scraping Workspace
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
          Configure crawl parameters, execute live BeautifulSoup extraction, and inspect structured payloads.
        </p>
      </div>

      {/* URL and Options Card */}
      <UrlInputCard />

      {/* Advanced Crawler Options (Phase 4 - Collapsible) */}
      <Card
        style={{ marginBottom: '2rem' }}
        title={
          <div
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              cursor: 'pointer',
              userSelect: 'none',
              width: '100%',
            }}
          >
            <span style={{ color: 'var(--accent-gold)', display: 'flex' }}>
              <SettingsIcon size={18} />
            </span>
            <span style={{ flex: 1 }}>Advanced Crawler & Request Settings</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {isAdvancedOpen ? '▲ Hide' : '▼ Expand'}
            </span>
          </div>
        }
      >
        {isAdvancedOpen && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.25rem',
              paddingTop: '0.5rem',
            }}
          >
            {/* Custom User Agent */}
            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Custom User-Agent
              </label>
              <Input
                value={advancedOptions.user_agent}
                onChange={(e) => updateAdvanced('user_agent', e.target.value)}
                placeholder="Default: Mozilla/5.0 (Windows NT 10.0; Win64; x64)..."
              />
            </div>

            {/* Custom CSS Selector */}
            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Target CSS Selector (Optional)
              </label>
              <Input
                value={advancedOptions.css_selector}
                onChange={(e) => updateAdvanced('css_selector', e.target.value)}
                placeholder="e.g. article.post-content, #main"
              />
            </div>

            {/* Request Timeout */}
            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Request Timeout (seconds)
              </label>
              <Input
                type="number"
                min="3"
                max="60"
                value={advancedOptions.timeout}
                onChange={(e) => updateAdvanced('timeout', Number(e.target.value))}
              />
            </div>

            {/* Retry Count */}
            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Retry Attempts
              </label>
              <Input
                type="number"
                min="0"
                max="5"
                value={advancedOptions.retry_count}
                onChange={(e) => updateAdvanced('retry_count', Number(e.target.value))}
              />
            </div>

            {/* Maximum Pages */}
            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Maximum Pages to Crawl
              </label>
              <Input
                type="number"
                min="1"
                max="25"
                value={advancedOptions.max_pages}
                onChange={(e) => updateAdvanced('max_pages', Number(e.target.value))}
              />
            </div>

            {/* Crawl Depth */}
            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Crawl Depth (1 = single page)
              </label>
              <Input
                type="number"
                min="1"
                max="3"
                value={advancedOptions.max_depth}
                onChange={(e) => updateAdvanced('max_depth', Number(e.target.value))}
              />
            </div>

            {/* Request Delay */}
            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Request Delay between Pages (sec)
              </label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={advancedOptions.request_delay}
                onChange={(e) => updateAdvanced('request_delay', Number(e.target.value))}
              />
            </div>

            {/* Toggles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', justifyContent: 'center' }}>
              <Toggle
                label="Follow Next-Page Pagination"
                description="Automatically crawl paginated lists"
                checked={advancedOptions.follow_pagination}
                onChange={(checked) => updateAdvanced('follow_pagination', checked)}
              />

              <Toggle
                label="Same-Domain Restriction"
                description="Do not follow links to external domains"
                checked={advancedOptions.same_domain_only}
                onChange={(checked) => updateAdvanced('same_domain_only', checked)}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Loading and Error Feedback */}
      {isLoading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={() => setError(null)} />}

      {/* Results or Empty State */}
      {!isLoading && currentResult ? (
        <ResultsDashboard result={currentResult} />
      ) : (
        !isLoading && !error && (
          <Card>
            <EmptyState
              title="Workspace Ready"
              description="Enter a website URL above and click Start Scraping to inspect live extracted data."
            />
          </Card>
        )
      )}
    </div>
  );
};

export default ScrapePage;
