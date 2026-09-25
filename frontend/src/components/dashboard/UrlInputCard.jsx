import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Checkbox } from '../common/Checkbox';
import { ProgressBar } from '../common/ProgressBar';
import { LinkIcon, ExternalLinkIcon, ArrowRightIcon } from '../common/Icons';
import { useScrape } from '../../context/ScrapeContext';
import { useToast } from '../common/Toast';

const EXAMPLE_URLS = [
  'https://books.toscrape.com',
  'https://news.ycombinator.com',
  'https://example.com',
];

const CHECKBOX_OPTIONS = [
  { key: 'text',      label: 'Text' },
  { key: 'links',     label: 'Links' },
  { key: 'images',    label: 'Images' },
  { key: 'headings',  label: 'Headings' },
  { key: 'tables',    label: 'Tables' },
  { key: 'metadata',  label: 'Metadata' },
  { key: 'emails',    label: 'Emails' },
  { key: 'html',      label: 'HTML Source' },
];

export const UrlInputCard = () => {
  const [exampleIdx, setExampleIdx] = useState(0);
  const toast = useToast();
  const {
    targetUrl,
    setTargetUrl,
    extractionOptions,
    toggleOption,
    executeScrape,
    isLoading,
    scrapeProgress,
  } = useScrape();

  const handleLoadExample = () => {
    const nextUrl = EXAMPLE_URLS[exampleIdx % EXAMPLE_URLS.length];
    setTargetUrl(nextUrl);
    setExampleIdx((i) => i + 1);
    toast.info(`Loaded example: ${nextUrl}`);
  };

  const handleStartScraping = async (e) => {
    e?.preventDefault();
    if (!targetUrl.trim()) {
      toast.error('Please enter a valid website URL.');
      return;
    }
    await executeScrape(targetUrl);
  };

  return (
    <Card
      style={{ marginBottom: '2.25rem' }}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span style={{ color: 'var(--accent-cyan)', display: 'flex' }}>
            <LinkIcon size={20} />
          </span>
          <span>Enter Website URL</span>
        </div>
      }
      subtitle="Start scraping any website and extract the data you need."
      action={
        <button
          type="button"
          onClick={handleLoadExample}
          style={{
            background: 'none',
            border: '1px solid var(--border-subtle)',
            color: 'var(--accent-cyan)',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--weight-semibold)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            cursor: 'pointer',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            transition: 'all var(--ease-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 242, 254, 0.08)';
            e.currentTarget.style.borderColor = 'rgba(0,242,254,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none';
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
          }}
        >
          <ExternalLinkIcon size={12} />
          <span>Load Example</span>
        </button>
      }
    >
      <form onSubmit={handleStartScraping}>
        {/* URL Input Row */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '1.35rem',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: '1 1 320px' }}>
            <Input
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://example.com"
              icon={<LinkIcon size={16} />}
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            variant="cta"
            size="md"
            isLoading={isLoading}
            disabled={isLoading || !targetUrl.trim()}
            iconRight={<ArrowRightIcon size={16} />}
          >
            Start Scraping →
          </Button>
        </div>

        {/* Real-time progress bar if running */}
        {scrapeProgress.inProgress && (
          <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', background: 'rgba(0, 229, 163, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-emerald-border)' }}>
            <ProgressBar
              progress={scrapeProgress.percent}
              status={scrapeProgress.message}
            />
          </div>
        )}

        {/* Extraction Options */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '1rem',
          }}
        >
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: 'var(--weight-semibold)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginBottom: '0.75rem',
            }}
          >
            Extraction Options
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.85rem 1.4rem',
              alignItems: 'center',
            }}
          >
            {/* Extract All */}
            <Checkbox
              id="opt_all"
              label="Extract All"
              checked={extractionOptions.extract_all}
              onChange={() => toggleOption('extract_all')}
              style={{ fontWeight: 'var(--weight-bold)', color: 'var(--accent-primary)' }}
            />

            {/* Divider */}
            <span
              style={{
                width: 1,
                height: 18,
                background: 'var(--border-medium)',
                display: 'block',
                flexShrink: 0,
              }}
            />

            {/* Individual checkboxes */}
            {CHECKBOX_OPTIONS.map((opt) => (
              <Checkbox
                key={opt.key}
                id={`opt_${opt.key}`}
                label={opt.label}
                checked={!!extractionOptions[opt.key]}
                onChange={() => toggleOption(opt.key)}
              />
            ))}
          </div>
        </div>
      </form>
    </Card>
  );
};

export default UrlInputCard;
