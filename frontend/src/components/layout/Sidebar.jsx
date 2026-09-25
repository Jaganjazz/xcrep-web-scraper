import React from 'react';
import {
  SpiderLogoIcon,
  DashboardIcon,
  ScrapeIcon,
  HistoryIcon,
  SavedDataIcon,
  ExportIcon,
  SettingsIcon,
  ArrowRightIcon,
} from '../common/Icons';
import { useScrape } from '../../context/ScrapeContext';
import { useToast } from '../common/Toast';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { id: 'scrape',    label: 'Scrape',    icon: <ScrapeIcon /> },
  { id: 'history',   label: 'History',   icon: <HistoryIcon /> },
  { id: 'saved',     label: 'Saved Data',icon: <SavedDataIcon /> },
  { id: 'export',    label: 'Export',    icon: <ExportIcon /> },
  { id: 'settings',  label: 'Settings',  icon: <SettingsIcon /> },
];

export const Sidebar = ({ isOpen = false, onClose = null }) => {
  const { activeTab, setActiveTab } = useScrape();
  const toast = useToast();

  const handleNavClick = (id) => {
    setActiveTab(id);
    onClose?.();
  };

  const handleUpgradeClick = () => {
    toast.success('Redirecting to Pro checkout portal…');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 48,
          }}
        />
      )}

      <aside
        className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}
        style={{
          width: 'var(--sidebar-width)',
          backgroundColor: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 50,
          padding: '1.5rem 1rem 1rem',
          transition: 'transform var(--ease-normal)',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {/* ── Brand Header ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0 0.5rem 1.75rem 0.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            marginBottom: '1rem',
          }}
        >
          <div
            style={{
              filter: 'drop-shadow(0 0 10px rgba(0, 229, 163, 0.55))',
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            <SpiderLogoIcon size={32} />
          </div>
          <div>
            <h1
              style={{
                fontSize: '1.1rem',
                fontWeight: 'var(--weight-bold)',
                letterSpacing: '-0.02em',
                color: 'var(--text-white)',
                lineHeight: 1.2,
              }}
            >
              Web Scraper
            </h1>
            <p style={{ fontSize: '0.67rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
              Extract. Explore. Analyze.
            </p>
          </div>
        </div>

        {/* ── Navigation ── */}
        <nav
          style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}
          aria-label="Main navigation"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                aria-current={isActive ? 'page' : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(0, 229, 163, 0.16) 0%, rgba(0, 242, 254, 0.08) 100%)'
                    : 'transparent',
                  border: isActive
                    ? '1px solid var(--accent-emerald-border)'
                    : '1px solid transparent',
                  boxShadow: isActive ? 'var(--glow-primary-sm)' : 'none',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 'var(--weight-semibold)' : 'var(--weight-medium)',
                  fontSize: 'var(--text-sm)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all var(--ease-fast)',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <span
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: '20%',
                      height: '60%',
                      width: 3,
                      borderRadius: '0 2px 2px 0',
                      background: 'var(--accent-primary)',
                      boxShadow: '0 0 8px var(--accent-primary)',
                    }}
                  />
                )}
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* ── Pro Version Card ── */}
        <div
          style={{
            background: 'var(--grad-gold-card)',
            border: '1px solid var(--accent-amber-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.15rem',
            marginTop: '1.5rem',
            boxShadow: '0 4px 20px rgba(245,158,11,0.12)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.65rem',
            }}
          >
            <span style={{ fontSize: '1rem' }}>👑</span>
            <h4
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--weight-bold)',
                color: 'var(--text-white)',
              }}
            >
              Pro Version
            </h4>
            <span
              style={{
                marginLeft: 'auto',
                fontSize: '0.65rem',
                fontWeight: 600,
                color: 'var(--accent-gold)',
                background: 'rgba(245,158,11,0.15)',
                borderRadius: 'var(--radius-full)',
                padding: '0.1rem 0.45rem',
                border: '1px solid rgba(245,158,11,0.25)',
              }}
            >
              NEW
            </span>
          </div>

          <ul
            style={{
              listStyle: 'none',
              fontSize: '0.76rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.3rem',
              marginBottom: '0.9rem',
            }}
          >
            {['No scraping limits', 'Faster execution', 'All export formats', 'Priority support'].map((feat) => (
              <li key={feat} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span style={{ color: 'var(--accent-gold)', fontSize: '0.75rem' }}>✓</span>
                {feat}
              </li>
            ))}
          </ul>

          <button
            onClick={handleUpgradeClick}
            className="btn btn-gold btn-sm"
            style={{ width: '100%' }}
          >
            <span>Upgrade Now</span>
            <ArrowRightIcon size={13} />
          </button>
        </div>

        {/* ── User Profile Section ── */}
        <div
          style={{
            marginTop: '1rem',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            cursor: 'pointer',
            transition: 'background var(--ease-fast)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.055)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
          onClick={() => toast.info('Navigate to Account Settings')}
          role="button"
          tabIndex={0}
          aria-label="User profile"
        >
          {/* Avatar */}
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1e3a5f 0%, #05d6a0 100%)',
              color: '#fff',
              display: 'grid',
              placeContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem',
              flexShrink: 0,
              boxShadow: '0 0 10px rgba(5,214,160,0.35)',
            }}
          >
            J
          </div>

          {/* User info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--weight-semibold)',
                color: 'var(--text-white)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              Jagan
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              Free Plan
            </div>
          </div>

          {/* Expand icon */}
          <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>⋯</span>
        </div>
      </aside>
    </>
  );
};
