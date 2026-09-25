import React from 'react';
import { HeroBanner } from '../components/dashboard/HeroBanner';
import { UrlInputCard } from '../components/dashboard/UrlInputCard';
import { ExtractTypesGrid } from '../components/dashboard/ExtractTypesGrid';
import { RecentScrapesCard } from '../components/dashboard/RecentScrapesCard';
import { QuickExportCard } from '../components/dashboard/QuickExportCard';
import { LoadingState } from '../components/feedback/LoadingState';
import { ErrorState } from '../components/feedback/ErrorState';
import { useScrape } from '../context/ScrapeContext';

export const DashboardPage = () => {
  const { isLoading, error, setError, currentResult } = useScrape();

  return (
    <div className="dashboard-page animate-fade-in">

      {/* ── Hero Banner ── */}
      <HeroBanner />

      {/* ── URL Scraping Card ── */}
      <UrlInputCard />

      {/* ── Inline feedback ── */}
      {isLoading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={() => setError(null)} />}

      {/* ── Scrape success banner ── */}
      {currentResult && !isLoading && (
        <div
          className="glass-panel"
          style={{
            padding: '1rem 1.5rem',
            marginBottom: '2rem',
            background: 'rgba(5, 214, 160, 0.06)',
            borderColor: 'var(--border-accent)',
            border: '1px solid var(--accent-emerald-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-sm)',
                background: 'var(--status-success-bg)',
                display: 'grid',
                placeContent: 'center',
                fontSize: '1.1rem',
                flexShrink: 0,
              }}
            >
              ✅
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Scrape Successful
              </div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', marginTop: '0.15rem' }}>
                Extracted{' '}
                <strong style={{ color: 'var(--accent-primary)' }}>{currentResult.total_items} items</strong>
                {' '}from{' '}
                <strong style={{ color: 'var(--text-white)' }}>{currentResult.target_url}</strong>
                {currentResult.load_time_ms && (
                  <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                    ({currentResult.load_time_ms}ms)
                  </span>
                )}
              </div>
            </div>
          </div>
          <span
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.35rem 0.75rem',
              whiteSpace: 'nowrap',
            }}
          >
            Ready to export →
          </span>
        </div>
      )}

      {/* ── Feature Grid: What You Can Extract ── */}
      <ExtractTypesGrid />

      {/* ── Bottom: Recent Scrapes + Quick Export ── */}
      <div
        className="dashboard-columns"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1fr)',
          gap: '1.5rem',
          alignItems: 'start',
        }}
      >
        <RecentScrapesCard />
        <QuickExportCard />
      </div>
    </div>
  );
};
