import React from 'react';

export const Tabs = ({
  tabs = [],
  activeTab,
  onChange,
  className = '',
  variant = 'pill', // 'pill', 'underline'
}) => {
  return (
    <div className={`tabs-header ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            className={`tab-btn ${isActive ? 'active' : ''}`}
            onClick={() => onChange?.(tab.id)}
          >
            {tab.icon && (
              <span style={{ marginRight: '0.45rem', display: 'inline-flex', verticalAlign: 'middle' }}>
                {tab.icon}
              </span>
            )}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                style={{
                  marginLeft: '0.5rem',
                  padding: '0.1rem 0.45rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 'var(--text-xs)',
                  background: isActive ? 'rgba(0, 229, 163, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
