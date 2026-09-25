import React from 'react';

export const EmptyState = ({
  icon = null,
  title = 'No Data Available',
  description = 'Start by entering a website URL above to scrape and extract structured data.',
  action = null,
  style = {},
}) => {
  return (
    <div
      style={{
        padding: '3.5rem 1.5rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.75rem',
        ...style,
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 'var(--radius-xl)',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          display: 'grid',
          placeContent: 'center',
          color: 'var(--accent-primary)',
          fontSize: '1.5rem',
          marginBottom: '0.5rem',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        {icon || '🌐'}
      </div>
      <h4
        style={{
          color: 'var(--text-white)',
          fontWeight: 'var(--weight-semibold)',
          fontSize: 'var(--text-lg)',
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </h4>
      <p
        style={{
          color: 'var(--text-secondary)',
          fontSize: 'var(--text-sm)',
          maxWidth: 440,
          lineHeight: var_lineHeight(),
        }}
      >
        {description}
      </p>
      {action && <div style={{ marginTop: '1rem' }}>{action}</div>}
    </div>
  );
};

function var_lineHeight() {
  return '1.55';
}
