import React, { useState, useEffect, useRef } from 'react';
import { SearchIcon, XIcon, ExternalLinkIcon } from './Icons';
import { useScrape } from '../../context/ScrapeContext';
import { historyApi } from '../../api/historyApi';
import { datasetsApi } from '../../api/datasetsApi';

export const GlobalSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const { loadScrapeDetail, setActiveTab } = useScrape();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Search logic across scrapes and datasets
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [histRes, dataRes] = await Promise.all([
          historyApi.getHistory(1, 10, query.trim()),
          datasetsApi.getDatasets(1, 20),
        ]);

        const scrapeMatches = (histRes?.jobs || []).map((j) => ({
          type: 'scrape',
          id: j.id,
          title: j.target_url,
          subtitle: `${j.total_items} items • ${new Date(j.created_at).toLocaleDateString()}`,
          jobId: j.id,
        }));

        const term = query.toLowerCase();
        const datasetMatches = (dataRes || [])
          .filter(
            (d) =>
              (d.name || '').toLowerCase().includes(term) ||
              (d.description || '').toLowerCase().includes(term) ||
              (d.tags || []).some((t) => t.toLowerCase().includes(term))
          )
          .map((d) => ({
            type: 'dataset',
            id: d.id,
            title: d.name,
            subtitle: d.description || 'Saved Dataset',
            jobId: d.job_id,
          }));

        setResults([...scrapeMatches, ...datasetMatches]);
      } catch (err) {
        console.warn('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(3, 5, 8, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
        paddingLeft: '1rem',
        paddingRight: '1rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '560px',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-modal)',
          border: '1px solid var(--border-medium)',
        }}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0.85rem 1.25rem',
            borderBottom: '1px solid var(--border-subtle)',
            gap: '0.75rem',
          }}
        >
          <span style={{ color: 'var(--accent-primary)', display: 'flex' }}>
            <SearchIcon size={20} />
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search past scrapes, URLs, or data..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-white)',
              fontSize: '1rem',
              fontFamily: 'var(--font-sans)',
            }}
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <XIcon size={16} />
            </button>
          ) : (
            <kbd
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                background: 'rgba(255, 255, 255, 0.08)',
                padding: '0.15rem 0.4rem',
                borderRadius: 'var(--radius-xs)',
              }}
            >
              ESC
            </kbd>
          )}
        </div>

        {/* Results Container */}
        <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '0.75rem' }}>
          {loading && (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
              Searching history and datasets...
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
              No results found for "{query}".
            </div>
          )}

          {!query && (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: 'var(--text-xs)' }}>
              Type a URL domain, dataset title, or keyword to instantly search your database.
            </div>
          )}

          {!loading &&
            results.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  if (item.jobId) {
                    loadScrapeDetail(item.jobId);
                  } else {
                    setActiveTab('saved');
                  }
                  onClose();
                }}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'background var(--ease-fast)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                  <span style={{ fontSize: '1.1rem' }}>{item.type === 'scrape' ? '🌐' : '📁'}</span>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 'var(--text-sm)',
                        fontWeight: 600,
                        color: 'var(--text-white)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.title}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.subtitle}</div>
                  </div>
                </div>
                <span style={{ color: 'var(--accent-cyan)', fontSize: '0.8rem' }}>↗</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchModal;
