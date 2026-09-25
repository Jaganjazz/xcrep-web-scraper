import React from 'react';

export const Spinner = ({ size = 36, color = 'var(--accent-emerald)' }) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: '3px solid rgba(255, 255, 255, 0.1)',
        borderTopColor: color,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
    />
  );
};
