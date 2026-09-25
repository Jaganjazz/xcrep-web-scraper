import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { SearchInput } from '../components/common/SearchInput';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/feedback/EmptyState';
import { LoadingState } from '../components/feedback/LoadingState';
import { historyApi } from '../api/historyApi';
import { useScrape } from '../context/ScrapeContext';
import { useToast } from '../components/common/Toast';
import {
  ExternalLinkIcon,
  TrashIcon,
  ExportIcon,
  RefreshIcon,
} from '../components/common/Icons';

export const HistoryPage = () => {
  const [historyList, setHistoryList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');

  // Confirmation Modals
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isClearAllOpen, setIsClearAllOpen] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);

  const { loadScrapeDetail, executeScrape, setActiveTab } = useScrape();
  const toast = useToast();

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await historyApi.getHistory(page, pageSize, search, statusFilter);
      setHistoryList(res?.jobs || []);
      setTotalCount(res?.total || 0);
    } catch (err) {
      console.error('Failed to load history:', err);
      toast.error('Could not load history from server.');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, statusFilter, toast]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await historyApi.deleteJob(deleteTargetId);
      toast.success('Scrape record deleted.');
      setDeleteTargetId(null);
      loadHistory();
    } catch (err) {
      toast.error('Failed to delete job.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClearAll = async () => {
    setIsClearingAll(true);
    try {
      const res = await historyApi.clearAllHistory();
      toast.success(`Cleared ${res.deleted_count || 0} history records.`);
      setIsClearAllOpen(false);
      loadHistory();
    } catch (err) {
      toast.error('Failed to clear history.');
    } finally {
      setIsClearingAll(false);
    }
  };

  const handleReScrape = async (url) => {
    toast.info(`Starting re-scrape for ${url}...`);
    setActiveTab('scrape');
    await executeScrape(url);
  };

  // Sorting
  const sortedJobs = [...historyList].sort((a, b) => {
    if (sortBy === 'items_desc') return b.total_items - a.total_items;
    if (sortBy === 'duration_desc') return (b.duration || 0) - (a.duration || 0);
    return new Date(b.created_at) - new Date(a.created_at);
  });

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="history-page animate-fade-in">
      {/* ── Page Header ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '1.8rem',
              fontWeight: 'var(--weight-bold)',
              color: 'var(--text-white)',
              marginBottom: '0.35rem',
              letterSpacing: '-0.02em',
            }}
          >
            Scraping History
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            Review, re-run, inspect, and export your previous scraping sessions.
          </p>
        </div>

        {historyList.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsClearAllOpen(true)}
            iconLeft={<TrashIcon size={14} />}
            style={{ color: 'var(--status-error)' }}
          >
            Clear All History
          </Button>
        )}
      </div>

      {/* ── Filters & Search Toolbar ── */}
      <Card style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          {/* Search bar */}
          <div style={{ flex: '1 1 280px' }}>
            <SearchInput
              value={search}
              onChange={(val) => {
                setSearch(val);
                setPage(1);
              }}
              placeholder="Search website URLs or Job IDs..."
            />
          </div>

          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {['all', 'completed', 'failed', 'running'].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid',
                  borderColor: statusFilter === st ? 'var(--accent-primary)' : 'var(--border-subtle)',
                  background: statusFilter === st ? 'rgba(0, 229, 163, 0.12)' : 'transparent',
                  color: statusFilter === st ? 'var(--accent-primary)' : 'var(--text-muted)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'all var(--ease-fast)',
                }}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
                borderRadius: 'var(--radius-xs)',
                padding: '0.35rem 0.65rem',
                fontSize: 'var(--text-xs)',
                outline: 'none',
              }}
            >
              <option value="date_desc">Newest First</option>
              <option value="items_desc">Most Items</option>
              <option value="duration_desc">Longest Duration</option>
            </select>
          </div>
        </div>
      </Card>

      {/* ── Table Card ── */}
      <Card>
        {loading ? (
          <LoadingState message="Retrieving scraping database records..." />
        ) : sortedJobs.length === 0 ? (
          <EmptyState
            title="No Scrape Records Found"
            description={search || statusFilter !== 'all' ? 'No records match your search filter.' : "You haven't run any scraping tasks yet. Enter a website URL to start."}
            action={
              <Button variant="cta" onClick={() => setActiveTab('dashboard')}>
                Start a Scrape →
              </Button>
            }
          />
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '0.85rem' }}>Website Target</th>
                    <th style={{ textAlign: 'center', padding: '0.85rem' }}>Status</th>
                    <th style={{ textAlign: 'left', padding: '0.85rem' }}>Data Extracted</th>
                    <th style={{ textAlign: 'center', padding: '0.85rem' }}>Duration</th>
                    <th style={{ textAlign: 'left', padding: '0.85rem' }}>Date & Time</th>
                    <th style={{ textAlign: 'right', padding: '0.85rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedJobs.map((job) => (
                    <tr key={job.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.85rem', maxWidth: 300 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <span style={{ fontSize: '1rem' }}>🌐</span>
                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontWeight: 'var(--weight-semibold)',
                                color: 'var(--text-white)',
                                fontSize: 'var(--text-sm)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {job.target_url}
                            </div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                              ID: {job.id.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem', textAlign: 'center' }}>
                        <Badge status={job.status} />
                      </td>
                      <td style={{ padding: '0.85rem' }}>
                        <div style={{ fontWeight: 600, color: 'var(--accent-primary)', fontSize: 'var(--text-sm)' }}>
                          {job.total_items} items
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {job.pages_crawled || 1} {job.pages_crawled === 1 ? 'page' : 'pages'}
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                        {job.duration ? `${job.duration}s` : '—'}
                      </td>
                      <td style={{ padding: '0.85rem', color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
                        {new Date(job.created_at).toLocaleString()}
                      </td>
                      <td style={{ padding: '0.85rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                          <Button
                            variant="secondary"
                            size="xs"
                            onClick={() => loadScrapeDetail(job.id)}
                          >
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => handleReScrape(job.target_url)}
                            iconLeft={<RefreshIcon size={12} />}
                          >
                            Re-scrape
                          </Button>
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => {
                              loadScrapeDetail(job.id).then(() => setActiveTab('export'));
                            }}
                            iconLeft={<ExportIcon size={12} />}
                          >
                            Export
                          </Button>
                          <Button
                            variant="danger"
                            size="xs"
                            onClick={() => setDeleteTargetId(job.id)}
                            iconLeft={<TrashIcon size={12} />}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Toolbar */}
            {totalPages > 1 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '1.25rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border-subtle)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-muted)',
                }}
              >
                <div>
                  Showing {sortedJobs.length} of {totalCount} total scrape jobs
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button
                    variant="outline"
                    size="xs"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    ← Previous
                  </Button>
                  <span style={{ display: 'flex', alignItems: 'center', padding: '0 0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="xs"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next →
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Delete Scrape Record"
        message="Are you sure you want to delete this scrape record and its contents from the database?"
        confirmText="Delete Record"
        variant="danger"
      />

      {/* Clear All Confirmation */}
      <ConfirmDialog
        isOpen={isClearAllOpen}
        onClose={() => setIsClearAllOpen(false)}
        onConfirm={handleClearAll}
        loading={isClearingAll}
        title="Clear Entire Scrape History"
        message="Warning: This will permanently delete ALL recorded scraping jobs and extracted payloads from the persistent database. Are you sure you wish to continue?"
        confirmText="Clear All Data"
        variant="danger"
      />
    </div>
  );
};

export default HistoryPage;
