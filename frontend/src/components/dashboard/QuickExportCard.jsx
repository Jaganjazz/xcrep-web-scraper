import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { ExportIcon, ArrowRightIcon } from '../common/Icons';
import { useScrape } from '../../context/ScrapeContext';
import { useToast } from '../common/Toast';

const FORMATS = [
  { id: 'csv',  label: 'CSV',   icon: '📊', color: '#00e5a3', desc: 'Spreadsheet' },
  { id: 'json', label: 'JSON',  icon: '{}',  color: '#f59e0b', desc: 'Structured', mono: true },
  { id: 'xlsx', label: 'Excel', icon: '📈', color: '#00d2b4', desc: 'Workbook' },
  { id: 'pdf',  label: 'PDF',   icon: '📑', color: '#f87171', desc: 'Document' },
  { id: 'txt',  label: 'TXT',   icon: '📝', color: '#00f2fe', desc: 'Plaintext' },
];

export const QuickExportCard = () => {
  const { currentResult, exportCurrentData } = useScrape();
  const toast = useToast();
  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!currentResult) {
      toast.error('Scrape a website first before exporting data.');
      return;
    }
    setIsExporting(true);
    try {
      await exportCurrentData(selectedFormat);
    } catch (err) {
      toast.error(`Export failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const hasData = !!currentResult;

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span style={{ color: 'var(--accent-primary)', display: 'flex' }}>
            <ExportIcon size={18} />
          </span>
          <span>Quick Export</span>
        </div>
      }
      subtitle={hasData ? `Ready to export: ${currentResult.target_url}` : 'Export scraped data in multiple formats'}
    >
      {/* Format Picker */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(72px, 1fr))',
          gap: '0.6rem',
          marginBottom: '1.25rem',
        }}
      >
        {FORMATS.map((fmt) => {
          const isSelected = selectedFormat === fmt.id;
          return (
            <button
              key={fmt.id}
              onClick={() => setSelectedFormat(fmt.id)}
              title={fmt.desc}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem',
                padding: '0.75rem 0.4rem',
                borderRadius: 'var(--radius-md)',
                background: isSelected
                  ? 'linear-gradient(135deg, rgba(0, 229, 163, 0.15) 0%, rgba(0, 242, 254, 0.08) 100%)'
                  : 'rgba(255, 255, 255, 0.03)',
                border: isSelected
                  ? '1px solid var(--accent-emerald-border)'
                  : '1px solid var(--border-subtle)',
                color: isSelected ? 'var(--text-white)' : 'var(--text-secondary)',
                fontWeight: isSelected ? 'var(--weight-semibold)' : 'var(--weight-medium)',
                cursor: 'pointer',
                transition: 'all var(--ease-fast)',
                boxShadow: isSelected ? 'var(--glow-primary-sm)' : 'none',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.borderColor = 'var(--border-medium)';
                  e.currentTarget.style.color = 'var(--text-white)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <span
                style={{
                  color: fmt.color,
                  fontSize: fmt.mono ? '0.75rem' : '1rem',
                  fontFamily: fmt.mono ? 'var(--font-mono)' : 'inherit',
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                {fmt.icon}
              </span>
              <span style={{ fontSize: '0.72rem' }}>{fmt.label}</span>
              {isSelected && (
                <span
                  style={{
                    position: 'absolute',
                    top: 5,
                    right: 5,
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: 'var(--accent-primary)',
                    boxShadow: '0 0 6px var(--accent-primary)',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Info notice if no data */}
      {!hasData && (
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.6rem 0.85rem',
            fontSize: '0.76rem',
            color: 'var(--text-muted)',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span>ℹ️</span>
          <span>Scrape a URL above to enable instant export.</span>
        </div>
      )}

      <Button
        variant="cta"
        fullWidth
        isLoading={isExporting}
        disabled={!hasData || isExporting}
        onClick={handleExport}
        iconRight={<ArrowRightIcon size={15} />}
      >
        Export Current Data →
      </Button>
    </Card>
  );
};

export default QuickExportCard;
