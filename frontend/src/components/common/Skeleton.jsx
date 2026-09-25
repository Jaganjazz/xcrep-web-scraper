import React from 'react';

export const Skeleton = ({
  width = '100%',
  height = '1rem',
  borderRadius = 'var(--radius-sm)',
  className = '',
  style = {},
}) => {
  return (
    <div
      className={className}
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        backgroundImage: 'linear-gradient(90deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 255, 255, 0.02) 100%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-pulse 1.6s ease-in-out infinite',
        ...style,
      }}
    />
  );
};

export const SkeletonCard = () => (
  <div
    style={{
      padding: '1.25rem',
      backgroundColor: 'var(--bg-card)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <Skeleton width="36px" height="36px" borderRadius="var(--radius-md)" />
      <div style={{ flex: 1 }}>
        <Skeleton width="60%" height="0.9rem" style={{ marginBottom: '0.35rem' }} />
        <Skeleton width="40%" height="0.75rem" />
      </div>
    </div>
    <Skeleton width="100%" height="2rem" borderRadius="var(--radius-sm)" />
  </div>
);

export default Skeleton;
