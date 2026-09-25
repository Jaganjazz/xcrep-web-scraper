import React from 'react';

export const Card = ({
  children,
  className = '',
  variant = 'glass', // 'glass', 'elevated', 'active'
  title = null,
  subtitle = null,
  icon = null,
  action = null,
  footer = null,
  style = {},
  contentStyle = {},
  ...props
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'elevated':
        return 'glass-panel-elevated';
      case 'active':
        return 'glass-panel glass-panel-active';
      case 'glass':
      default:
        return 'glass-panel';
    }
  };

  return (
    <div className={`${getVariantClass()} ${className}`} style={{ padding: '1.5rem', ...style }} {...props}>
      {(title || subtitle || icon || action) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '1.25rem',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {icon && (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'var(--accent-primary)',
                  fontSize: '1.1rem',
                }}
              >
                {icon}
              </span>
            )}
            <div>
              {title && (
                <h3
                  style={{
                    fontSize: 'var(--text-md)',
                    fontWeight: 'var(--weight-semibold)',
                    color: 'var(--text-white)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {title}
                </h3>
              )}
              {subtitle && (
                <p
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-secondary)',
                    marginTop: '0.2rem',
                    lineHeight: 1.4,
                  }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {action && <div style={{ flexShrink: 0 }}>{action}</div>}
        </div>
      )}

      <div style={contentStyle}>{children}</div>

      {footer && (
        <div
          style={{
            marginTop: '1.25rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
};
