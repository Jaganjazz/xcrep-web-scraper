import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { SearchInput } from '../components/common/SearchInput';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/feedback/EmptyState';
import { LoadingState } from '../components/feedback/LoadingState';
import { datasetsApi } from '../api/datasetsApi';
import { exportApi } from '../api/exportApi';
import { useScrape } from '../context/ScrapeContext';
import { useToast } from '../components/common/Toast';
import {
  BookmarkIcon,
  ExportIcon,
  TrashIcon,
  SearchIcon,
  ExternalLinkIcon,
} from '../components/common/Icons';

export const SavedDataPage = () => {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [previewTarget, setPreviewTarget] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formTags, setFormTags] = useState('');

  const { setActiveTab, loadScrapeDetail } = useScrape();
  const toast = useToast();

  const fetchDatasets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await datasetsApi.getDatasets(1, 50);
      setDatasets(res || []);
    } catch (err) {
      console.error('Failed to load datasets:', err);
      toast.error('Could not load saved datasets.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDatasets();
  }, [fetchDatasets]);

  const handleCreateDataset = async () => {
    if (!formName.trim()) {
      toast.error('Please enter a dataset name.');
      return;
    }
    setIsProcessing(true);
    try {
      const tagList = formTags.split(',').map((t) => t.trim()).filter(Boolean);
      await datasetsApi.createDataset({
        name: formName.trim(),
        description: formDesc.trim(),
        tags: tagList.length ? tagList : ['dataset', 'custom'],
      });
      toast.success(`Dataset "${formName}" created!`);
      setIsCreateOpen(false);
      setFormName('');
      setFormDesc('');
      setFormTags('');
      fetchDatasets();
    } catch (err) {
      toast.error(`Creation failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditDataset = async () => {
    if (!editTarget || !formName.trim()) return;
    setIsProcessing(true);
    try {
      const tagList = formTags.split(',').map((t) => t.trim()).filter(Boolean);
      await datasetsApi.updateDataset(editTarget.id, {
        name: formName.trim(),
        description: formDesc.trim(),
        tags: tagList,
      });
      toast.success('Dataset updated successfully.');
      setIsEditOpen(false);
      setEditTarget(null);
      fetchDatasets();
    } catch (err) {
      toast.error(`Update failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteDataset = async () => {
    if (!deleteTargetId) return;
    setIsProcessing(true);
    try {
      await datasetsApi.deleteDataset(deleteTargetId);
      toast.success('Dataset deleted.');
      setDeleteTargetId(null);
      fetchDatasets();
    } catch (err) {
      toast.error(`Delete failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportDataset = async (dataset, format = 'json') => {
    try {
      toast.info(`Generating ${format.toUpperCase()} for "${dataset.name}"...`);
      const res = await exportApi.requestExport({
        datasetId: dataset.id,
        format,
        baseName: dataset.name,
      });
      if (res && res.download_url) {
        exportApi.triggerBrowserDownload(res.download_url, res.file_name);
        toast.success(`Downloaded ${res.file_name}!`);
      }
    } catch (err) {
      toast.error(`Export failed: ${err.message}`);
    }
  };

  const filteredDatasets = datasets.filter((ds) => {
    const term = search.toLowerCase();
    return (
      (ds.name || '').toLowerCase().includes(term) ||
      (ds.description || '').toLowerCase().includes(term) ||
      (ds.tags || []).some((t) => t.toLowerCase().includes(term))
    );
  });

  return (
    <div className="saved-data-page animate-fade-in">
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
            Saved Datasets
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            Curate, organize, preview, and export persistent collections from your web scrapes.
          </p>
        </div>

        <Button
          variant="cta"
          onClick={() => {
            setFormName('');
            setFormDesc('');
            setFormTags('');
            setIsCreateOpen(true);
          }}
          iconLeft={<BookmarkIcon size={14} />}
        >
          + New Dataset
        </Button>
      </div>

      {/* ── Search Bar ── */}
      <div style={{ marginBottom: '1.5rem', maxWidth: 420 }}>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search datasets by name, tags, or description..."
        />
      </div>

      {/* ── Datasets Grid ── */}
      {loading ? (
        <LoadingState message="Loading saved datasets..." />
      ) : filteredDatasets.length === 0 ? (
        <Card>
          <EmptyState
            title="No Datasets Found"
            description={search ? 'No datasets match your search term.' : 'You have not created any custom datasets yet. Save your scrape results or create a new dataset container.'}
            action={
              <Button variant="cta" onClick={() => setIsCreateOpen(true)}>
                + Create Your First Dataset
              </Button>
            }
          />
        </Card>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {filteredDatasets.map((ds) => (
            <div
              key={ds.id}
              className="glass-panel"
              style={{
                padding: '1.35rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform var(--ease-normal), border-color var(--ease-normal)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = 'var(--accent-emerald-border)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>📁</span>
                    <h3
                      style={{
                        fontSize: '1.05rem',
                        fontWeight: 'var(--weight-semibold)',
                        color: 'var(--text-white)',
                        margin: 0,
                      }}
                    >
                      {ds.name}
                    </h3>
                  </div>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--accent-primary)',
                      background: 'rgba(0, 229, 163, 0.1)',
                      border: '1px solid var(--accent-emerald-border)',
                      borderRadius: 'var(--radius-full)',
                      padding: '0.15rem 0.55rem',
                    }}
                  >
                    {ds.item_count || 'Dataset'}
                  </span>
                </div>

                <p
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                    marginBottom: '1rem',
                    minHeight: '36px',
                  }}
                >
                  {ds.description || 'No description provided.'}
                </p>

                {/* Tags */}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                  {(ds.tags || []).map((t, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-xs)',
                        padding: '0.15rem 0.45rem',
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '0.85rem',
                }}
              >
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {ds.job_id && (
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => loadScrapeDetail(ds.job_id)}
                      iconRight={<ExternalLinkIcon size={12} />}
                    >
                      Open
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => {
                      setPreviewTarget(ds);
                    }}
                  >
                    Preview
                  </Button>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => {
                      setEditTarget(ds);
                      setFormName(ds.name);
                      setFormDesc(ds.description || '');
                      setFormTags((ds.tags || []).join(', '));
                      setIsEditOpen(true);
                    }}
                  >
                    Rename
                  </Button>
                </div>

                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={() => handleExportDataset(ds, 'json')}
                    iconLeft={<ExportIcon size={12} />}
                  >
                    Export
                  </Button>
                  <button
                    onClick={() => setDeleteTargetId(ds.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '0.2rem 0.4rem',
                      borderRadius: 'var(--radius-xs)',
                      transition: 'color var(--ease-fast)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--status-error)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                    title="Delete Dataset"
                  >
                    <TrashIcon size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Create Modal ── */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Dataset">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Dataset Name *
            </label>
            <Input
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Competitive Price Analysis"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Description
            </label>
            <Input
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder="Notes or context regarding this collection..."
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Tags (comma-separated)
            </label>
            <Input
              value={formTags}
              onChange={(e) => setFormTags(e.target.value)}
              placeholder="e.g. ecommerce, books, research"
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>
            Cancel
          </Button>
          <Button variant="cta" onClick={handleCreateDataset} loading={isProcessing}>
            Create Dataset
          </Button>
        </div>
      </Modal>

      {/* ── Edit / Rename Modal ── */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Dataset">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Dataset Name *
            </label>
            <Input
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Description
            </label>
            <Input
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Tags (comma-separated)
            </label>
            <Input
              value={formTags}
              onChange={(e) => setFormTags(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <Button variant="ghost" onClick={() => setIsEditOpen(false)}>
            Cancel
          </Button>
          <Button variant="cta" onClick={handleEditDataset} loading={isProcessing}>
            Save Changes
          </Button>
        </div>
      </Modal>

      {/* ── Preview Modal ── */}
      {previewTarget && (
        <Modal
          isOpen={Boolean(previewTarget)}
          onClose={() => setPreviewTarget(null)}
          title={`Dataset: ${previewTarget.name}`}
          maxWidth="560px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', fontSize: 'var(--text-sm)' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Description: </span>
              <span style={{ color: 'var(--text-primary)' }}>{previewTarget.description || 'None'}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Linked Job ID: </span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                {previewTarget.job_id || 'Stand-alone collection'}
              </span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Created: </span>
              <span style={{ color: 'var(--text-secondary)' }}>
                {new Date(previewTarget.created_at).toLocaleString()}
              </span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Tags: </span>
              <span style={{ color: 'var(--text-primary)' }}>
                {(previewTarget.tags || []).join(', ')}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            {previewTarget.job_id && (
              <Button
                variant="outline"
                onClick={() => {
                  loadScrapeDetail(previewTarget.job_id);
                  setPreviewTarget(null);
                }}
              >
                Inspect in Workspace →
              </Button>
            )}
            <Button variant="secondary" onClick={() => setPreviewTarget(null)}>
              Close
            </Button>
          </div>
        </Modal>
      )}

      {/* ── Delete Confirmation ── */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteDataset}
        loading={isProcessing}
        title="Delete Dataset"
        message="Are you sure you want to permanently delete this saved dataset?"
        confirmText="Delete Dataset"
        variant="danger"
      />
    </div>
  );
};

export default SavedDataPage;
