import React from 'react';
import { Spinner } from '../common/Spinner';

export const LoadingState = ({
  message = 'Scraping and analyzing website content...',
  type = 'spinner', // 'spinner', 'skeleton'
}) => {
  if (type === 'skeleton') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.5rem 0' }}>
        <div className="skeleton-shimmer" style={{ height: 28, width: '40%', borderRadius: 'var(--radius-sm)' }} />
        <div className="skeleton-shimmer" style={{ height: 18, width: '90%', borderRadius: 'var(--radius-sm)' }} />
        <div className="skeleton-shimmer" style={{ height: 18, width: '75%', borderRadius: 'var(--radius-sm)' }} />
        <div className="skeleton-shimmer" style={{ height: 18, width: '60%', borderRadius: 'var(--radius-sm)' }} />
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3.5rem 1.5rem',
        textAlign: 'center',
        gap: '1.25rem',
      }}
    >
      <Spinner size={44} />
      <div>
        <p style={{ color: 'var(--text-primary)', fontSize: 'var(--text-base)', fontWeight: 'var(--weight-medium)' }}>
          {message}
        </p>
        <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginTop: '0.25rem', display: 'block' }}>
          Parsing DOM structure & extracting requested data types
        </span>
      </div>
    </div>
  );
};
