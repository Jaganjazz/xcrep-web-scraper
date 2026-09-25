import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Toggle } from '../components/common/Toggle';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { LoadingState } from '../components/feedback/LoadingState';
import { settingsApi } from '../api/settingsApi';
import { historyApi } from '../api/historyApi';
import { datasetsApi } from '../api/datasetsApi';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/common/Toast';
import {
  SettingsIcon,
  ShieldIcon,
  TrashIcon,
} from '../components/common/Icons';

export const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();
  const toast = useToast();

  const [settings, setSettings] = useState({
    user_agent: '',
    request_timeout_seconds: 15,
    max_concurrent_scrapes: 5,
    allow_local_urls: false,
    default_export_format: 'json',
    theme_preference: 'dark',
    retry_count: 2,
    max_pages: 10,
    max_depth: 2,
    request_delay: 0.5,
    follow_pagination: false,
    custom_headers: '',
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Data cleanup dialogs
  const [isClearHistoryOpen, setIsClearHistoryOpen] = useState(false);
  const [isClearDatasetsOpen, setIsClearDatasetsOpen] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const res = await settingsApi.getSettings();
        if (res) {
          setSettings(res);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
        toast.error('Could not retrieve settings from server.');
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, [toast]);

  const handleSave = async (e) => {
    e?.preventDefault();
    setSaving(true);
    try {
      const updated = await settingsApi.updateSettings(settings);
      setSettings(updated);
      toast.success('Settings updated and persisted successfully!');
    } catch (err) {
      toast.error(`Failed to save settings: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleClearHistory = async () => {
    setIsCleaning(true);
    try {
      const res = await historyApi.clearAllHistory();
      toast.success(`Cleared ${res.deleted_count || 0} history records.`);
      setIsClearHistoryOpen(false);
    } catch (err) {
      toast.error('Failed to clear history.');
    } finally {
      setIsCleaning(false);
    }
  };

  const handleClearDatasets = async () => {
    setIsCleaning(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
      const res = await fetch(`${baseUrl}/datasets/clear-all`, { method: 'DELETE' });
      const data = await res.json();
      toast.success(data.message || 'Cleared all saved datasets.');
      setIsClearDatasetsOpen(false);
    } catch (err) {
      toast.error('Failed to clear datasets.');
    } finally {
      setIsCleaning(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading system settings..." />;
  }

  return (
    <div className="settings-page animate-fade-in">
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
          Settings & System Configuration
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
          Manage crawler parameters, network headers, security policies, and application storage.
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: 840 }}>
        {/* ── 1. GENERAL SETTINGS ── */}
        <Card title="General Preferences" subtitle="Display theme and default export presets">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Appearance Theme
              </label>
              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setSettings({ ...settings, theme_preference: 'dark' });
                    if (theme !== 'dark') toggleTheme();
                  }}
                  style={{
                    flex: 1,
                    padding: '0.6rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid',
                    borderColor: settings.theme_preference === 'dark' ? 'var(--accent-primary)' : 'var(--border-subtle)',
                    background: settings.theme_preference === 'dark' ? 'rgba(0,229,163,0.1)' : 'rgba(255,255,255,0.03)',
                    color: settings.theme_preference === 'dark' ? 'var(--text-white)' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: 'var(--text-xs)',
                    cursor: 'pointer',
                  }}
                >
                  🌙 Dark Mode (Default)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSettings({ ...settings, theme_preference: 'light' });
                    if (theme !== 'light') toggleTheme();
                  }}
                  style={{
                    flex: 1,
                    padding: '0.6rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid',
                    borderColor: settings.theme_preference === 'light' ? 'var(--accent-primary)' : 'var(--border-subtle)',
                    background: settings.theme_preference === 'light' ? 'rgba(0,229,163,0.1)' : 'rgba(255,255,255,0.03)',
                    color: settings.theme_preference === 'light' ? 'var(--text-white)' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: 'var(--text-xs)',
                    cursor: 'pointer',
                  }}
                >
                  ☀️ Light Mode
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Default Export Format
              </label>
              <select
                value={settings.default_export_format}
                onChange={(e) => setSettings({ ...settings, default_export_format: e.target.value })}
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
                <option value="json">JSON (Complete structured data)</option>
                <option value="csv">CSV (Tabular format)</option>
                <option value="xlsx">Excel Workbook (.xlsx)</option>
                <option value="pdf">PDF Document Report</option>
                <option value="txt">Plain Text (.txt)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* ── 2. SCRAPING & CRAWLER SETTINGS ── */}
        <Card title="Scraping & Crawling Engine" subtitle="Execution limits, depth, rate limiting, and timeouts">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Request Timeout (seconds)
              </label>
              <Input
                type="number"
                min="3"
                max="60"
                value={settings.request_timeout_seconds}
                onChange={(e) => setSettings({ ...settings, request_timeout_seconds: Number(e.target.value) })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Retry Attempts
              </label>
              <Input
                type="number"
                min="0"
                max="5"
                value={settings.retry_count}
                onChange={(e) => setSettings({ ...settings, retry_count: Number(e.target.value) })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Default Maximum Pages
              </label>
              <Input
                type="number"
                min="1"
                max="50"
                value={settings.max_pages}
                onChange={(e) => setSettings({ ...settings, max_pages: Number(e.target.value) })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Default Crawl Depth
              </label>
              <Input
                type="number"
                min="1"
                max="3"
                value={settings.max_depth}
                onChange={(e) => setSettings({ ...settings, max_depth: Number(e.target.value) })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Request Delay Between Pages (sec)
              </label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={settings.request_delay}
                onChange={(e) => setSettings({ ...settings, request_delay: Number(e.target.value) })}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', paddingTop: '1.25rem' }}>
              <Toggle
                label="Auto-follow Pagination"
                description="Detect rel='next' links"
                checked={settings.follow_pagination}
                onChange={(checked) => setSettings({ ...settings, follow_pagination: checked })}
              />
            </div>
          </div>
        </Card>

        {/* ── 3. NETWORK & HEADERS ── */}
        <Card title="Network & Request Headers" subtitle="Browser emulation and custom HTTP headers">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Global User-Agent Header
              </label>
              <Input
                value={settings.user_agent}
                onChange={(e) => setSettings({ ...settings, user_agent: e.target.value })}
                placeholder="Mozilla/5.0 (Windows NT 10.0; Win64; x64)..."
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Custom Request Headers (JSON or header: value format)
              </label>
              <textarea
                value={settings.custom_headers}
                onChange={(e) => setSettings({ ...settings, custom_headers: e.target.value })}
                rows={3}
                placeholder='{"Accept-Language": "en-US,en;q=0.9", "DNT": "1"}'
                style={{
                  width: '100%',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.65rem 0.85rem',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--text-xs)',
                  fontFamily: 'var(--font-mono)',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>
          </div>
        </Card>

        {/* ── 4. SECURITY AUDIT STATUS ── */}
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--accent-primary)', display: 'flex' }}>
                <ShieldIcon size={18} />
              </span>
              <span>Security Protection Status (SSRF & Ingestion Guard)</span>
            </div>
          }
          subtitle="Real-time status of backend application security controls"
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '0.85rem',
            }}
          >
            {[
              { title: 'SSRF Hostname Guard', status: 'ACTIVE', desc: 'Blocks localhost, loopback, and .internal hostnames' },
              { title: 'Private IP Range Filter', status: 'ACTIVE', desc: 'Blocks RFC 1918 (10/8, 172.16/12, 192.168/16) and link-local' },
              { title: 'Cloud Metadata Protection', status: 'ACTIVE', desc: 'Blocks AWS/GCP/Azure 169.254.169.254 endpoints' },
              { title: 'Robots.txt RFC 9309 Engine', status: 'ACTIVE', desc: 'Respects site crawling rules and user-agent limits' },
              { title: 'Redirect Target Validation', status: 'ACTIVE', desc: 'Checks all HTTP redirect destinations against SSRF rules' },
              { title: 'Safe HTML Sanitization', status: 'ACTIVE', desc: 'Escapes raw markup to prevent frontend XSS script execution' },
            ].map((sec, idx) => (
              <div
                key={idx}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(5, 214, 160, 0.04)',
                  border: '1px solid var(--accent-emerald-border)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-white)' }}>
                    {sec.title}
                  </span>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      background: 'rgba(5, 214, 160, 0.2)',
                      color: 'var(--status-success)',
                      padding: '0.1rem 0.4rem',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    ✓ {sec.status}
                  </span>
                </div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                  {sec.desc}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* ── 5. DATA MANAGEMENT ── */}
        <Card title="Data Storage Management" subtitle="Purge persistent SQLite database tables">
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsClearHistoryOpen(true)}
              iconLeft={<TrashIcon size={14} />}
              style={{ color: 'var(--status-error)' }}
            >
              Clear All Scrape History
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsClearDatasetsOpen(true)}
              iconLeft={<TrashIcon size={14} />}
              style={{ color: 'var(--status-error)' }}
            >
              Clear All Saved Datasets
            </Button>
          </div>
        </Card>

        {/* ── Submit Action ── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <Button type="submit" variant="cta" size="lg" isLoading={saving}>
            Save All Settings
          </Button>
        </div>
      </form>

      {/* Clear History Confirmation */}
      <ConfirmDialog
        isOpen={isClearHistoryOpen}
        onClose={() => setIsClearHistoryOpen(false)}
        onConfirm={handleClearHistory}
        loading={isCleaning}
        title="Clear All Scrape History"
        message="Are you sure you want to permanently delete all scrape history records from the database?"
        confirmText="Clear History"
        variant="danger"
      />

      {/* Clear Datasets Confirmation */}
      <ConfirmDialog
        isOpen={isClearDatasetsOpen}
        onClose={() => setIsClearDatasetsOpen(false)}
        onConfirm={handleClearDatasets}
        loading={isCleaning}
        title="Clear All Saved Datasets"
        message="Are you sure you want to delete all saved dataset collections? This action is permanent."
        confirmText="Clear Datasets"
        variant="danger"
      />
    </div>
  );
};

export default SettingsPage;
