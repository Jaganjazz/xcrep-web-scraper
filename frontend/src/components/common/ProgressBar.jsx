import React from 'react';

export const ProgressBar = ({
  progress = 0, // 0 to 100
  status = null,
  substatus = null,
  color = 'var(--accent-primary)',
  height = '8px',
  showPercentage = true,
  animated = true,
  style = {},
}) => {
  const clampedProgress = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <div style={{ width: '100%', ...style }}>
      {(status || showPercentage) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.45rem',
            fontSize: 'var(--text-xs)',
          }}
        >
          <div>
            {status && (
              <span style={{ fontWeight: 'var(--weight-medium)', color: 'var(--text-primary)' }}>
                {status}
              </span>
            )}
            {substatus && (
              <span style={{ color: 'var(--text-muted)', marginLeft: '0.4rem' }}>
                ({substatus})
              </span>
            )}
          </div>
          {showPercentage && (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 'var(--weight-semibold)',
                color: 'var(--accent-primary)',
              }}
            >
              {clampedProgress}%
            </span>
          )}
        </div>
      )}

      <div
        style={{
          width: '100%',
          height,
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: `${clampedProgress}%`,
            height: '100%',
            background: 'var(--grad-cta)',
            borderRadius: 'var(--radius-full)',
            transition: 'width 300ms cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: 'var(--glow-primary-sm)',
            position: 'relative',
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
