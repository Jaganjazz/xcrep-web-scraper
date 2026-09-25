import React from 'react';
import { Button } from '../common/Button';

export const ErrorState = ({
  title = 'Execution Error',
  message = 'An unexpected error occurred while processing your request.',
  onRetry = null,
  className = '',
}) => {
  return (
    <div
      className={`glass-panel ${className}`}
      style={{
        padding: '1.75rem',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--status-error-bg)',
        border: '1px solid var(--status-error-border)',
        textAlign: 'center',
        margin: '1.5rem 0',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.2)',
          color: 'var(--status-error)',
          display: 'grid',
          placeContent: 'center',
          margin: '0 auto 1rem',
          fontSize: '1.35rem',
          fontWeight: 700,
        }}
      >
        ⚠️
      </div>
      <h4
        style={{
          color: 'var(--text-white)',
          marginBottom: '0.45rem',
          fontWeight: 'var(--weight-semibold)',
          fontSize: 'var(--text-md)',
        }}
      >
        {title}
      </h4>
      <p
        style={{
          color: 'var(--text-secondary)',
          fontSize: 'var(--text-sm)',
          maxWidth: 500,
          margin: '0 auto',
          marginBottom: onRetry ? '1.25rem' : 0,
          lineHeight: 1.5,
        }}
      >
        {message}
      </p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};
