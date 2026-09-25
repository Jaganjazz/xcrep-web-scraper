import React from 'react';
import { SearchIcon, SunIcon, MoonIcon, BellIcon } from '../common/Icons';
import { Dropdown } from '../common/Dropdown';
import { useTheme } from '../../context/ThemeContext';
import { useScrape } from '../../context/ScrapeContext';
import { useToast } from '../common/Toast';

export const Navbar = ({ onToggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const { setIsSearchOpen } = useScrape();
  const toast = useToast();

  const userMenuItems = [
    { label: 'Profile & Account', onClick: () => toast.info('Navigating to Account Profile') },
    { label: 'API Keys & Access', onClick: () => toast.info('Managing API Keys') },
    { label: 'Usage & Quotas', onClick: () => toast.info('Viewing Plan Usage') },
    { divider: true },
    { label: 'Sign Out', onClick: () => toast.warning('Logged out successfully') },
  ];

  return (
    <header
      style={{
        height: 'var(--navbar-height)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        borderBottom: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-navbar)',
        backdropFilter: 'var(--glass-filter-nav)',
        WebkitBackdropFilter: 'var(--glass-filter-nav)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Left: Mobile hamburger & Global Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, maxWidth: 500 }}>
        {/* Mobile toggle button */}
        <button
          onClick={onToggleSidebar}
          className="mobile-menu-btn"
          style={{
            display: 'none',
            background: 'transparent',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.4rem',
            color: 'var(--text-primary)',
            cursor: 'pointer',
          }}
          aria-label="Toggle Navigation Menu"
        >
          ☰
        </button>

        {/* Global Search Bar */}
        <div
          onClick={() => setIsSearchOpen(true)}
          style={{ position: 'relative', width: '100%', maxWidth: 420, cursor: 'pointer' }}
        >
          <span
            style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
            }}
          >
            <SearchIcon size={16} />
          </span>
          <input
            type="text"
            readOnly
            placeholder="Search past scrapes, URLs, or data..."
            style={{
              width: '100%',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              padding: '0.55rem 4rem 0.55rem 2.6rem',
              color: 'var(--text-primary)',
              fontSize: 'var(--text-sm)',
              cursor: 'pointer',
              transition: 'border-color var(--ease-fast), box-shadow var(--ease-fast)',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--accent-cyan)';
              e.target.style.boxShadow = '0 0 0 3px var(--accent-cyan-subtle)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border-subtle)';
              e.target.style.boxShadow = 'none';
            }}
          />
          <span
            style={{
              position: 'absolute',
              right: '0.85rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '4px',
              padding: '0.12rem 0.4rem',
              fontSize: '0.65rem',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              fontWeight: 500,
            }}
          >
            Ctrl K
          </span>
        </div>
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '50%',
            width: 38,
            height: 38,
            display: 'grid',
            placeContent: 'center',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            transition: 'background var(--ease-fast)',
          }}
          title="Toggle Light/Dark Theme"
        >
          {theme === 'dark' ? <SunIcon size={18} /> : <MoonIcon size={18} />}
        </button>

        {/* Notifications */}
        <button
          onClick={() => toast.info('You have 2 completed scrape jobs.')}
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '50%',
            width: 38,
            height: 38,
            display: 'grid',
            placeContent: 'center',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            position: 'relative',
            transition: 'background var(--ease-fast)',
          }}
          title="Notifications"
        >
          <BellIcon size={18} />
          <span
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: 'var(--accent-primary)',
              boxShadow: '0 0 6px var(--accent-primary)',
            }}
          />
        </button>

        {/* User Profile Avatar Dropdown */}
        <Dropdown
          items={userMenuItems}
          trigger={
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.35rem 0.75rem',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-full)',
                cursor: 'pointer',
                transition: 'border-color var(--ease-fast)',
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1e3a5f 0%, #05d6a0 100%)',
                  color: '#fff',
                  display: 'grid',
                  placeContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                }}
              >
                J
              </div>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-white)' }}>
                Jagan
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>▼</span>
            </div>
          }
        />
      </div>
    </header>
  );
};
