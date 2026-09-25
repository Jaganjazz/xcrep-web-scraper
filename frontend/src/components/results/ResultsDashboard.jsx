import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { SearchInput } from '../common/SearchInput';
import { Table } from '../common/Table';
import { useScrape } from '../../context/ScrapeContext';
import { useToast } from '../common/Toast';
import {
  ExternalLinkIcon,
  ExportIcon,
  CopyIcon,
  BookmarkIcon,
  SearchIcon,
  FilterIcon,
} from '../common/Icons';

export const ResultsDashboard = ({ result }) => {
  const { exportCurrentData, saveCurrentAsDataset } = useScrape();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [linkFilter, setLinkFilter] = useState('all'); // all, internal, external
  const [headingFilter, setHeadingFilter] = useState('all'); // all, h1, h2, h3

  // Save Dataset Modal State
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [datasetName, setDatasetName] = useState(result?.results?.title || 'Scraped Dataset');
  const [datasetDesc, setDatasetDesc] = useState(`Data extracted from ${result?.target_url || ''}`);
  const [isSaving, setIsSaving] = useState(false);

  if (!result || !result.results) return null;

  const data = result.results;
  const links = data.links || [];
  const images = data.images || [];
  const headings = data.headings || [];
  const tables = data.tables || [];
  const metadata = data.metadata || {};
  const emails = data.emails || [];
  const cleanText = data.clean_text || '';
  const rawHtml = data.raw_html || '';

  // Statistics
  const wordsCount = cleanText.split(/\s+/).filter(Boolean).length;
  const charsCount = cleanText.length;
  const pagesCount = result.pages_scraped || result.pages_crawled || 1;
  const durationSec = result.duration || (result.load_time_ms ? (result.load_time_ms / 1000).toFixed(2) : 0);

  const tabs = [
    { id: 'overview', label: 'Overview', count: null },
    { id: 'text', label: 'Clean Text', count: `${wordsCount}w` },
    { id: 'links', label: 'Links', count: links.length },
    { id: 'images', label: 'Images', count: images.length },
    { id: 'headings', label: 'Headings', count: headings.length },
    { id: 'tables', label: 'Tables', count: tables.length },
    { id: 'metadata', label: 'Metadata', count: Object.keys(metadata).length },
    { id: 'emails', label: 'Emails', count: emails.length },
    { id: 'html', label: 'HTML Source', count: rawHtml ? `${(rawHtml.length / 1024).toFixed(1)}k` : null },
  ];

  const handleCopy = (text, label = 'Content') => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const handleSaveDataset = async () => {
    setIsSaving(true);
    try {
      await saveCurrentAsDataset(datasetName, datasetDesc);
      setIsSaveModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered Links
  const filteredLinks = links.filter((l) => {
    const matchesSearch =
      (l.text || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.url || '').toLowerCase().includes(searchTerm.toLowerCase());
    if (linkFilter === 'internal') return matchesSearch && !l.is_external;
    if (linkFilter === 'external') return matchesSearch && l.is_external;
    return matchesSearch;
  });

  // Filtered Headings
  const filteredHeadings = headings.filter((h) => {
    const matchesSearch = (h.text || '').toLowerCase().includes(searchTerm.toLowerCase());
    if (headingFilter !== 'all') return matchesSearch && h.level.toLowerCase() === headingFilter;
    return matchesSearch;
  });

  return (
    <div className="results-dashboard animate-fade-in" style={{ marginTop: '2rem' }}>
      {/* ── Top Header & Actions Bar ── */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          borderLeft: '4px solid var(--accent-primary)',
        }}
      >
        <div style={{ flex: '1 1 300px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
            <Badge status={result.status || 'completed'} />
            {result.robots_status && (
              <span
                style={{
                  fontSize: '0.72rem',
                  padding: '0.15rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(0, 229, 163, 0.1)',
                  color: 'var(--accent-primary)',
                  border: '1px solid var(--accent-emerald-border)',
                }}
              >
                Robots: {result.robots_status}
              </span>
            )}
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              Completed in {durationSec}s
            </span>
          </div>
          <h2
            style={{
              fontSize: '1.2rem',
              fontWeight: 'var(--weight-bold)',
              color: 'var(--text-white)',
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            {data.title || result.target_url}
          </h2>
          <a
            href={result.target_url}
            target="_blank"
            rel="noreferrer"
            style={{
              fontSize: '0.8rem',
              color: 'var(--accent-cyan)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              marginTop: '0.2rem',
              textDecoration: 'none',
            }}
          >
            <span>{result.target_url}</span>
            <ExternalLinkIcon size={12} />
          </a>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSaveModalOpen(true)}
            iconLeft={<BookmarkIcon size={14} />}
          >
            Save Dataset
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => exportCurrentData('csv', activeTab !== 'overview' ? activeTab : null)}
            iconLeft={<ExportIcon size={14} />}
          >
            CSV
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => exportCurrentData('json', activeTab !== 'overview' ? activeTab : null)}
          >
            JSON
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => exportCurrentData('xlsx', activeTab !== 'overview' ? activeTab : null)}
          >
            Excel
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => exportCurrentData('pdf', activeTab !== 'overview' ? activeTab : null)}
          >
            PDF
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => exportCurrentData('txt', activeTab !== 'overview' ? activeTab : null)}
          >
            TXT
          </Button>
        </div>
      </div>

      {/* ── Key Statistics Cards ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '0.85rem',
          marginBottom: '1.5rem',
        }}
      >
        {[
          { label: 'Pages Crawled', value: pagesCount, icon: '📄', color: 'var(--accent-cyan)' },
          { label: 'Hyperlinks', value: links.length, icon: '🔗', color: 'var(--accent-primary)' },
          { label: 'Images', value: images.length, icon: '🖼️', color: 'var(--accent-gold)' },
          { label: 'Headings', value: headings.length, icon: '📑', color: '#60a5fa' },
          { label: 'Tables', value: tables.length, icon: '📊', color: '#34d399' },
          { label: 'Public Emails', value: emails.length, icon: '✉️', color: '#f43f5e' },
          { label: 'Word Count', value: wordsCount, icon: '📝', color: 'var(--accent-teal)' },
          { label: 'Duration', value: `${durationSec}s`, icon: '⚡', color: 'var(--accent-gold)' },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="glass-panel"
            style={{
              padding: '0.85rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.2rem',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{stat.label}</span>
              <span style={{ fontSize: '0.9rem' }}>{stat.icon}</span>
            </div>
            <div
              style={{
                fontSize: '1.35rem',
                fontWeight: 'var(--weight-bold)',
                color: stat.color,
                fontFamily: 'var(--font-mono)',
              }}
            >
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Result Navigation Tabs ── */}
      <div
        style={{
          display: 'flex',
          gap: '0.4rem',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '0.75rem',
          marginBottom: '1.5rem',
          overflowX: 'auto',
        }}
      >
        {tabs.map((t) => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                setActiveTab(t.id);
                setSearchTerm('');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.5rem 0.95rem',
                borderRadius: 'var(--radius-md)',
                background: isActive ? 'rgba(0, 229, 163, 0.12)' : 'transparent',
                border: isActive ? '1px solid var(--accent-emerald-border)' : '1px solid transparent',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: isActive ? 'var(--weight-semibold)' : 'var(--weight-medium)',
                fontSize: 'var(--text-sm)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all var(--ease-fast)',
              }}
            >
              <span>{t.label}</span>
              {t.count !== null && (
                <span
                  style={{
                    fontSize: '0.68rem',
                    padding: '0.1rem 0.4rem',
                    borderRadius: 'var(--radius-full)',
                    background: isActive ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.08)',
                    color: isActive ? '#06090e' : 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                  }}
                >
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── TAB CONTENT ── */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          <Card title="Page Title & Identity" style={{ height: '100%' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-white)', marginBottom: '0.75rem' }}>
              {data.title || '(No title tag found)'}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <span>Target: {result.target_url}</span>
              <span>Status Code: 200 OK</span>
            </div>
            <div style={{ marginTop: '1.25rem' }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(data.title, 'Title')}
                iconLeft={<CopyIcon size={14} />}
              >
                Copy Title
              </Button>
            </div>
          </Card>

          <Card title="Content Summary" style={{ height: '100%' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.6, maxHeight: 120, overflow: 'hidden' }}>
              {cleanText.slice(0, 300) || 'No readable text content extracted.'}...
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <Button variant="secondary" size="sm" onClick={() => setActiveTab('text')}>
                Read Full Text ({wordsCount} words) →
              </Button>
            </div>
          </Card>

          {emails.length > 0 && (
            <Card title="Discovered Public Emails" style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                {emails.map((em, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: 'rgba(244, 63, 94, 0.1)',
                      border: '1px solid rgba(244, 63, 94, 0.3)',
                      color: '#f43f5e',
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 'var(--text-sm)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    ✉️ {em}
                  </span>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* 2. TEXT TAB */}
      {activeTab === 'text' && (
        <Card
          title="Extracted Clean Text"
          subtitle={`${wordsCount} words | ${charsCount} characters`}
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(cleanText, 'Clean Text')}
              iconLeft={<CopyIcon size={14} />}
            >
              Copy Text
            </Button>
          }
        >
          <div style={{ marginBottom: '1rem' }}>
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search words within extracted text..."
            />
          </div>
          <div
            style={{
              background: 'var(--bg-input)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              padding: '1.25rem',
              maxHeight: 520,
              overflowY: 'auto',
              lineHeight: 1.7,
              fontSize: 'var(--text-sm)',
              color: 'var(--text-primary)',
              whiteSpace: 'pre-wrap',
            }}
          >
            {cleanText ? (
              searchTerm ? (
                cleanText.split(new RegExp(`(${searchTerm})`, 'gi')).map((part, i) =>
                  part.toLowerCase() === searchTerm.toLowerCase() ? (
                    <mark key={i} style={{ backgroundColor: 'rgba(0, 242, 254, 0.3)', color: '#fff', borderRadius: 2 }}>
                      {part}
                    </mark>
                  ) : (
                    part
                  )
                )
              ) : (
                cleanText
              )
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>No clean text content was found on this page.</span>
            )}
          </div>
        </Card>
      )}

      {/* 3. LINKS TAB */}
      {activeTab === 'links' && (
        <Card
          title="Extracted Hyperlinks"
          subtitle={`${filteredLinks.length} links found`}
          action={
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['all', 'internal', 'external'].map((f) => (
                <button
                  key={f}
                  onClick={() => setLinkFilter(f)}
                  style={{
                    padding: '0.3rem 0.65rem',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid',
                    borderColor: linkFilter === f ? 'var(--accent-primary)' : 'var(--border-subtle)',
                    background: linkFilter === f ? 'rgba(0,229,163,0.1)' : 'transparent',
                    color: linkFilter === f ? 'var(--accent-primary)' : 'var(--text-muted)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          }
        >
          <div style={{ marginBottom: '1rem' }}>
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search links by anchor text or URL..."
            />
          </div>
          <div style={{ overflowX: 'auto', maxHeight: 520 }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0.75rem' }}>Anchor Text</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem' }}>Target URL</th>
                  <th style={{ textAlign: 'center', padding: '0.75rem' }}>Type</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLinks.length > 0 ? (
                  filteredLinks.map((l, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 500, color: 'var(--text-primary)', maxWidth: 220 }}>
                        {l.text || <span style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>(No anchor)</span>}
                      </td>
                      <td style={{ padding: '0.75rem', maxWidth: 380, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <a
                          href={l.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: 'var(--accent-cyan)', textDecoration: 'none' }}
                        >
                          {l.url}
                        </a>
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            padding: '0.15rem 0.5rem',
                            borderRadius: 'var(--radius-full)',
                            background: l.is_external ? 'rgba(245, 158, 11, 0.12)' : 'rgba(5, 214, 160, 0.12)',
                            color: l.is_external ? 'var(--accent-gold)' : 'var(--status-success)',
                            border: `1px solid ${l.is_external ? 'var(--accent-amber-border)' : 'var(--status-success-border)'}`,
                          }}
                        >
                          {l.is_external ? 'External' : 'Internal'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => handleCopy(l.url, 'Link URL')}
                          iconLeft={<CopyIcon size={12} />}
                        >
                          Copy
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No hyperlinks matched filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 4. IMAGES TAB */}
      {activeTab === 'images' && (
        <Card title="Extracted Images" subtitle={`${images.length} images located`}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '1rem',
              maxHeight: 520,
              overflowY: 'auto',
            }}
          >
            {images.length > 0 ? (
              images.map((img, i) => (
                <div
                  key={i}
                  className="glass-panel"
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div
                    style={{
                      height: 140,
                      background: 'rgba(0,0,0,0.3)',
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                      display: 'grid',
                      placeContent: 'center',
                      marginBottom: '0.65rem',
                    }}
                  >
                    <img
                      src={img.src}
                      alt={img.alt || 'Extracted'}
                      style={{ maxWidth: '100%', maxHeight: 130, objectFit: 'contain' }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement.innerText = '⚠️ Preview unavailable';
                        e.currentTarget.parentElement.style.color = 'var(--text-muted)';
                        e.currentTarget.parentElement.style.fontSize = '0.75rem';
                      }}
                    />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 'var(--text-xs)',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {img.alt || '(No alt text)'}
                    </div>
                    <div
                      style={{
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        marginTop: '0.2rem',
                      }}
                    >
                      {img.src}
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.6rem' }}>
                      <Button
                        variant="outline"
                        size="xs"
                        fullWidth
                        onClick={() => handleCopy(img.src, 'Image URL')}
                      >
                        Copy URL
                      </Button>
                      <a
                        href={img.src}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-ghost btn-xs"
                        style={{ padding: '0.25rem 0.5rem', display: 'flex', alignItems: 'center' }}
                      >
                        <ExternalLinkIcon size={12} />
                      </a>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)', padding: '2rem' }}>No images found.</p>
            )}
          </div>
        </Card>
      )}

      {/* 5. HEADINGS TAB */}
      {activeTab === 'headings' && (
        <Card
          title="Document Headings"
          subtitle={`${filteredHeadings.length} headings`}
          action={
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {['all', 'h1', 'h2', 'h3'].map((h) => (
                <button
                  key={h}
                  onClick={() => setHeadingFilter(h)}
                  style={{
                    padding: '0.3rem 0.6rem',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid',
                    borderColor: headingFilter === h ? 'var(--accent-primary)' : 'var(--border-subtle)',
                    background: headingFilter === h ? 'rgba(0,229,163,0.1)' : 'transparent',
                    color: headingFilter === h ? 'var(--accent-primary)' : 'var(--text-muted)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                  }}
                >
                  {h}
                </button>
              ))}
            </div>
          }
        >
          <div style={{ marginBottom: '1rem' }}>
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search headings..."
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 500, overflowY: 'auto' }}>
            {filteredHeadings.length > 0 ? (
              filteredHeadings.map((h, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    padding: '0.65rem 1rem',
                    background: 'var(--bg-input)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <span
                    style={{
                      padding: '0.15rem 0.45rem',
                      borderRadius: 'var(--radius-xs)',
                      background:
                        h.level === 'h1'
                          ? 'rgba(0, 229, 163, 0.15)'
                          : h.level === 'h2'
                          ? 'rgba(0, 242, 254, 0.15)'
                          : 'rgba(245, 158, 11, 0.15)',
                      color:
                        h.level === 'h1'
                          ? 'var(--accent-primary)'
                          : h.level === 'h2'
                          ? 'var(--accent-cyan)'
                          : 'var(--accent-gold)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {h.level.toUpperCase()}
                  </span>
                  <span style={{ flex: 1, color: 'var(--text-primary)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                    {h.text}
                  </span>
                  <Button variant="ghost" size="xs" onClick={() => handleCopy(h.text, 'Heading')}>
                    Copy
                  </Button>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)', padding: '2rem' }}>No headings matched filter.</p>
            )}
          </div>
        </Card>
      )}

      {/* 6. TABLES TAB */}
      {activeTab === 'tables' && (
        <Card title="Detected Tables" subtitle={`${tables.length} tables extracted`}>
          {tables.length > 0 ? (
            tables.map((t, i) => (
              <div key={i} style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-white)', fontSize: 'var(--text-sm)' }}>
                    Table #{i + 1} ({t.rows?.length || 0} rows)
                  </span>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => {
                      const csvContent = [
                        (t.headers || []).join(','),
                        ...(t.rows || []).map((r) => r.join(',')),
                      ].join('\n');
                      handleCopy(csvContent, 'Table CSV');
                    }}
                    iconLeft={<CopyIcon size={12} />}
                  >
                    Copy as CSV
                  </Button>
                </div>
                <div style={{ overflowX: 'auto', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {t.headers?.map((h, hi) => (
                          <th key={hi} style={{ padding: '0.65rem 0.85rem', textAlign: 'left', background: 'rgba(255,255,255,0.03)' }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {t.rows?.map((row, ri) => (
                        <tr key={ri} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          {row.map((cell, ci) => (
                            <td key={ci} style={{ padding: '0.65rem 0.85rem', fontSize: 'var(--text-xs)', color: 'var(--text-primary)' }}>
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--text-muted)', padding: '2rem' }}>No HTML tables detected on this page.</p>
          )}
        </Card>
      )}

      {/* 7. METADATA TAB */}
      {activeTab === 'metadata' && (
        <Card title="Page Metadata & Open Graph" subtitle="Parsed meta tags, OG, and Twitter properties">
          <div style={{ overflowX: 'auto', maxHeight: 520 }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0.75rem', width: '30%' }}>Property</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', width: '60%' }}>Value</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem', width: '10%' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(metadata).length > 0 ? (
                  Object.entries(metadata).map(([key, val], idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.75rem', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--accent-cyan)' }}>
                        {key}
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: 'var(--text-sm)', color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                        {String(val || '—')}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                        {val && (
                          <Button variant="ghost" size="xs" onClick={() => handleCopy(String(val), key)}>
                            Copy
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No metadata tags found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 8. EMAILS TAB */}
      {activeTab === 'emails' && (
        <Card
          title="Public Email Addresses"
          subtitle={`${emails.length} publicly visible addresses detected`}
          action={
            emails.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(emails.join('\n'), 'Emails List')}
                iconLeft={<CopyIcon size={14} />}
              >
                Copy All Emails
              </Button>
            )
          }
        >
          {emails.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.85rem' }}>
              {emails.map((email, i) => (
                <div
                  key={i}
                  className="glass-panel"
                  style={{
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>✉️</span>
                    <a
                      href={`mailto:${email}`}
                      style={{
                        color: 'var(--accent-primary)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-sm)',
                        textDecoration: 'none',
                        fontWeight: 500,
                      }}
                    >
                      {email}
                    </a>
                  </div>
                  <Button variant="ghost" size="xs" onClick={() => handleCopy(email, 'Email address')}>
                    Copy
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No publicly exposed email addresses were discovered in this page's text or mailto links.
            </div>
          )}
        </Card>
      )}

      {/* 9. RAW HTML TAB */}
      {activeTab === 'html' && (
        <Card
          title="Raw HTML Source"
          subtitle="Safely escaped DOM markup"
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(rawHtml, 'HTML Source')}
              iconLeft={<CopyIcon size={14} />}
            >
              Copy HTML
            </Button>
          }
        >
          <div
            style={{
              background: '#04070b',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              padding: '1.25rem',
              maxHeight: 520,
              overflowX: 'auto',
              overflowY: 'auto',
              fontFamily: 'var(--font-mono)',
              fontSize: '11.5px',
              color: 'var(--text-secondary)',
              whiteSpace: 'pre',
              lineHeight: 1.5,
            }}
          >
            {/* NEVER render untrusted HTML directly (Phase 7 & Phase 11 rule) */}
            {rawHtml ? rawHtml : 'Raw HTML was not requested during this scrape.'}
          </div>
        </Card>
      )}

      {/* ── Save Dataset Modal ── */}
      <Modal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        title="Save Scraped Dataset"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Dataset Name
            </label>
            <Input
              value={datasetName}
              onChange={(e) => setDatasetName(e.target.value)}
              placeholder="e.g. Hacker News Top Stories"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Description
            </label>
            <Input
              value={datasetDesc}
              onChange={(e) => setDatasetDesc(e.target.value)}
              placeholder="Notes or tags regarding this scrape..."
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <Button variant="ghost" onClick={() => setIsSaveModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="cta" onClick={handleSaveDataset} loading={isSaving}>
            Save Dataset
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ResultsDashboard;
