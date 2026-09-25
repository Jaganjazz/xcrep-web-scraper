import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useScrape } from '../context/ScrapeContext';
import { useToast } from '../components/common/Toast';
import { exportApi } from '../api/exportApi';
import { ExportIcon, ArrowRightIcon } from '../components/common/Icons';

const FORMAT_OPTIONS = [
  { id: 'csv', label: 'CSV', icon: '📊', color: '#00e5a3', desc: 'Tabular spreadsheet format for Excel, Google Sheets, or Pandas.' },
  { id: 'json', label: 'JSON', icon: '{}', color: '#f59e0b', desc: 'Complete structured schema preserving all links, images, headings, and metadata.' },
  { id: 'xlsx', label: 'Excel (XLSX)', icon: '📈', color: '#00d2b4', desc: 'Multi-sheet workbook separating Links, Images, Headings, Tables, and Emails.' },
  { id: 'pdf', label: 'PDF Report', icon: '📑', color: '#f87171', desc: 'Professional formatted summary report document ready for printing or sharing.' },
  { id: 'txt', label: 'Plain Text (TXT)', icon: '📝', color: '#00f2fe', desc: 'Clean extracted text ready for LLM prompt context, fine-tuning, or embeddings.' },
];

const SCOPE_OPTIONS = [
  { id: 'all', label: 'Complete Scrape (All Data)' },
  { id: 'links', label: 'Hyperlinks Only' },
  { id: 'images', label: 'Images Only' },
  { id: 'headings', label: 'Headings Only' },
  { id: 'tables', label: 'Tables Only' },
  { id: 'emails', label: 'Public Emails Only' },
  { id: 'text', label: 'Clean Text Only' },
  { id: 'metadata', label: 'Metadata Only' },
];

export const ExportPage = () => {
  const { currentResult, recentScrapes, loadScrapeDetail, setActiveTab } = useScrape();
  const toast = useToast();

  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [selectedScope, setSelectedScope] = useState('all');
  const [selectedSource, setSelectedSource] = useState(currentResult?.job_id || 'current');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!currentResult && selectedSource === 'current') {
      toast.error('No scrape loaded. Please select a scrape from history or scrape a website first.');
      return;
    }

    setIsExporting(true);
    try {
      toast.info(`Generating ${selectedFormat.toUpperCase()} export...`);

      const targetJobId = selectedSource === 'current' ? currentResult?.job_id : selectedSource;
      const targetData = selectedSource === 'current' ? currentResult?.results : null;
      const tabParam = selectedScope === 'all' ? null : selectedScope;

      const res = await exportApi.requestExport({
        jobId: targetJobId || null,
        data: targetData,
        format: selectedFormat,
        tab: tabParam,
        baseName: currentResult?.results?.title || 'scrape_export',
      });

      if (res && res.download_url) {
        exportApi.triggerBrowserDownload(res.download_url, res.file_name);
        toast.success(`Successfully downloaded ${res.file_name}!`);
      }
    } catch (err) {
      toast.error(`Export failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="export-page animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h2
          style={{
            fontSize: '1.8rem',
            fontWeight: 'var(--weight-bold)',
            color: 'var(--text-white)',
            marginBottom: '0.35rem',
            letterSpacing: '-0.02em',
          }}
        >
          Data Export Center
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
          Download, format, and serialize your extracted datasets into structured spreadsheets, workbooks, documents, or JSON.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
        {/* ── Left Column: Configuration ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Data Source Picker */}
          <Card title="1. Select Data Source" subtitle="Choose what scrape to export">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: selectedSource === 'current' ? 'rgba(0, 229, 163, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid',
                  borderColor: selectedSource === 'current' ? 'var(--accent-emerald-border)' : 'var(--border-subtle)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="source"
                  value="current"
                  checked={selectedSource === 'current'}
                  onChange={() => setSelectedSource('current')}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-white)' }}>
                    {currentResult ? `Current Active Scrape (${currentResult.target_url})` : 'Active Scrape (None currently loaded)'}
                  </div>
                  {currentResult && (
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--accent-primary)', marginTop: '0.15rem' }}>
                      {currentResult.total_items} items extracted
                    </div>
                  )}
                </div>
              </label>

              {/* Or select from recent history */}
              {recentScrapes.length > 0 && (
                <div style={{ marginTop: '0.5rem' }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                    Or select from past scrapes:
                  </span>
                  <select
                    value={selectedSource === 'current' ? '' : selectedSource}
                    onChange={(e) => {
                      if (e.target.value) {
                        setSelectedSource(e.target.value);
                        loadScrapeDetail(e.target.value);
                      }
                    }}
                    style={{
                      width: '100%',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.6rem 0.85rem',
                      color: 'var(--text-primary)',
                      fontSize: 'var(--text-sm)',
                      outline: 'none',
                    }}
                  >
                    <option value="">-- Choose past scrape from history --</option>
                    {recentScrapes.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.target_url} ({j.total_items} items, {new Date(j.created_at).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </Card>

          {/* Export Format Selector */}
          <Card title="2. Select File Format" subtitle="Supported standard extensions">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
              {FORMAT_OPTIONS.map((fmt) => {
                const isSelected = selectedFormat === fmt.id;
                return (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setSelectedFormat(fmt.id)}
                    style={{
                      padding: '0.85rem 0.65rem',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'rgba(0, 229, 163, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid',
                      borderColor: isSelected ? 'var(--accent-emerald-border)' : 'var(--border-subtle)',
                      boxShadow: isSelected ? 'var(--glow-primary-sm)' : 'none',
                      color: isSelected ? 'var(--text-white)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.35rem',
                      transition: 'all var(--ease-fast)',
                    }}
                  >
                    <span style={{ fontSize: '1.25rem', color: fmt.color }}>{fmt.icon}</span>
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{fmt.label}</span>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Scope Selector */}
          <Card title="3. Select Content Scope" subtitle="Export complete dataset or narrow to specific tab">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.65rem' }}>
              {SCOPE_OPTIONS.map((sc) => {
                const isSelected = selectedScope === sc.id;
                return (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => setSelectedScope(sc.id)}
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      background: isSelected ? 'rgba(0, 242, 254, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid',
                      borderColor: isSelected ? 'var(--accent-cyan)' : 'var(--border-subtle)',
                      color: isSelected ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all var(--ease-fast)',
                    }}
                  >
                    {sc.label}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* ── Right Column: Summary & Download CTA ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card title="Export Summary">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: 'var(--text-sm)', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Target: </span>
                <span style={{ color: 'var(--text-white)', fontWeight: 600 }}>
                  {currentResult?.target_url || 'None selected'}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Format: </span>
                <span style={{ color: 'var(--accent-primary)', fontWeight: 700, textTransform: 'uppercase' }}>
                  {selectedFormat}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Content Scope: </span>
                <span style={{ color: 'var(--accent-cyan)' }}>
                  {SCOPE_OPTIONS.find((s) => s.id === selectedScope)?.label}
                </span>
              </div>
              {currentResult && (
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Extracted Elements: </span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                    {currentResult.total_items} items
                  </span>
                </div>
              )}
            </div>

            <Button
              variant="cta"
              fullWidth
              size="lg"
              isLoading={isExporting}
              disabled={(!currentResult && selectedSource === 'current') || isExporting}
              onClick={handleExport}
              iconLeft={<ExportIcon size={16} />}
              iconRight={<ArrowRightIcon size={16} />}
            >
              Export & Download File →
            </Button>
          </Card>

          {/* Guide Card */}
          <Card title="Format Guidelines">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              <div>
                <strong style={{ color: 'var(--accent-emerald)' }}>CSV: </strong>
                Flattens lists and tables into comma-separated values for spreadsheet software.
              </div>
              <div>
                <strong style={{ color: 'var(--accent-amber)' }}>JSON: </strong>
                Preserves raw JSON hierarchy with full fidelity.
              </div>
              <div>
                <strong style={{ color: 'var(--accent-teal)' }}>Excel (XLSX): </strong>
                Creates formatted workbooks with dedicated sheets for links, images, and tables.
              </div>
              <div>
                <strong style={{ color: '#f87171' }}>PDF: </strong>
                Generates a clean paginated PDF document summarizing metadata, text preview, and statistics.
              </div>
              <div>
                <strong style={{ color: 'var(--accent-cyan)' }}>TXT: </strong>
                Outputs clean plain text stripped of HTML tags for LLM prompts and NLP.
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExportPage;
