import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Table } from '../common/Table';
import { Dropdown } from '../common/Dropdown';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useScrape } from '../../context/ScrapeContext';
import { useToast } from '../common/Toast';

const formatDate = (dateString) => {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
};

const getHostname = (url) => {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
};

export const RecentScrapesCard = () => {
  const {
    recentScrapes,
    isLoadingHistory,
    loadScrapeDetail,
    executeScrape,
    deleteScrape,
    setActiveTab,
    exportCurrentData,
  } = useScrape();

  const toast = useToast();
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await deleteScrape(deleteTargetId);
      setDeleteTargetId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const getRowActionItems = (row) => [
    {
      label: 'View Results',
      onClick: () => loadScrapeDetail(row.id),
    },
    {
      label: 'Re-scrape URL',
      onClick: () => {
        executeScrape(row.target_url);
        toast.info(`Re-scraping ${row.target_url}...`);
      },
    },
    {
      label: 'Export Data',
      onClick: () => {
        loadScrapeDetail(row.id).then(() => {
          setActiveTab('export');
        });
      },
    },
    {
      label: 'Copy URL',
      onClick: () => {
        navigator.clipboard?.writeText(row.target_url);
        toast.success('URL copied to clipboard');
      },
    },
    { divider: true },
    {
      label: 'Delete',
      onClick: () => setDeleteTargetId(row.id),
    },
  ];

  const columns = [
    {
      key: 'target_url',
      header: 'Website',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: 'var(--radius-xs)',
              background: 'rgba(0, 229, 163, 0.08)',
              border: '1px solid var(--accent-emerald-border)',
              display: 'grid',
              placeContent: 'center',
              fontSize: '0.85rem',
              flexShrink: 0,
            }}
          >
            🌐
          </span>
          <div>
            <div
              style={{
                fontWeight: 'var(--weight-semibold)',
                color: 'var(--text-white)',
                fontSize: 'var(--text-sm)',
              }}
            >
              {getHostname(row.target_url)}
            </div>
            <div
              style={{
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                maxWidth: '240px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {row.target_url}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'total_items',
      header: 'Data Extracted',
      render: (row) => (
        <span style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--accent-primary)' }}>
          {row.total_items > 0 ? `${row.total_items} items` : row.status === 'failed' ? 'Failed' : '0 items'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge status={row.status || 'completed'} />,
    },
    {
      key: 'created_at',
      header: 'Date',
      render: (row) => (
        <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
          {formatDate(row.created_at)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
          <button
            onClick={() => loadScrapeDetail(row.id)}
            style={{
              background: 'rgba(0, 229, 163, 0.1)',
              border: '1px solid var(--accent-emerald-border)',
              color: 'var(--accent-primary)',
              borderRadius: 'var(--radius-xs)',
              padding: '0.25rem 0.55rem',
              fontSize: 'var(--text-xs)',
              cursor: 'pointer',
              fontWeight: 'var(--weight-medium)',
              transition: 'background var(--ease-fast)',
            }}
          >
            View
          </button>
          <Dropdown
            align="right"
            items={getRowActionItems(row)}
            trigger={
              <button
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0.25rem 0.4rem',
                  fontSize: '1rem',
                  borderRadius: 'var(--radius-xs)',
                  transition: 'color var(--ease-fast)',
                }}
                aria-label="More actions"
              >
                •••
              </button>
            }
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1rem' }}>🕒</span>
            <span>Recent Scrapes</span>
          </div>
        }
        action={
          <button
            onClick={() => setActiveTab('history')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-primary)',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--weight-semibold)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.3rem 0.6rem',
              borderRadius: 'var(--radius-sm)',
              transition: 'all var(--ease-fast)',
            }}
          >
            <span>View All</span>
            <span>→</span>
          </button>
        }
      >
        {recentScrapes.length === 0 && !isLoadingHistory ? (
          <div
            style={{
              padding: '2.5rem 1rem',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: 'var(--text-sm)',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🕸️</div>
            <div>No scraping history yet.</div>
            <div style={{ fontSize: 'var(--text-xs)', marginTop: '0.25rem', color: 'var(--text-dim)' }}>
              Enter a website URL above and click Start Scraping to populate real history.
            </div>
          </div>
        ) : (
          <Table columns={columns} data={recentScrapes} isLoading={isLoadingHistory} />
        )}
      </Card>

      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
        title="Delete Scrape Record"
        message="Are you sure you want to delete this scrape record and all of its extracted data? This cannot be undone."
        confirmText="Delete Record"
        variant="danger"
      />
    </>
  );
};

export default RecentScrapesCard;
