import React from 'react';

export const Toggle = ({
  checked = false,
  onChange,
  disabled = false,
  label = null,
  description = null,
  size = 'md', // 'sm', 'md'
  id,
}) => {
  const switchId = id || `toggle-${Math.random().toString(36).substr(2, 9)}`;

  const isSm = size === 'sm';
  const width = isSm ? '36px' : '44px';
  const height = isSm ? '20px' : '24px';
  const knobSize = isSm ? '14px' : '18px';
  const translateVal = isSm ? '16px' : '20px';

  return (
    <label
      htmlFor={switchId}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: disabled ? 'not-allowed' : 'pointer',
        gap: '0.85rem',
        opacity: disabled ? 0.6 : 1,
        userSelect: 'none',
      }}
    >
      {(label || description) && (
        <div style={{ flex: 1 }}>
          {label && (
            <div
              style={{
                fontSize: isSm ? 'var(--text-xs)' : 'var(--text-sm)',
                fontWeight: 'var(--weight-medium)',
                color: 'var(--text-primary)',
              }}
            >
              {label}
            </div>
          )}
          {description && (
            <div
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--text-secondary)',
                marginTop: '0.15rem',
              }}
            >
              {description}
            </div>
          )}
        </div>
      )}

      <div style={{ position: 'relative', width, height }}>
        <input
          type="checkbox"
          id={switchId}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange && onChange(e.target.checked)}
          style={{
            opacity: 0,
            width: 0,
            height: 0,
            position: 'absolute',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: checked ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.1)',
            borderRadius: 'var(--radius-full)',
            border: checked ? '1px solid var(--accent-primary)' : '1px solid var(--border-medium)',
            transition: 'background-color 200ms ease, border-color 200ms ease, box-shadow 200ms ease',
            boxShadow: checked ? 'var(--glow-primary-sm)' : 'none',
          }}
        >
          <div
            style={{
              position: 'absolute',
              height: knobSize,
              width: knobSize,
              left: '2px',
              bottom: '2px',
              backgroundColor: checked ? '#06090e' : '#ffffff',
              borderRadius: '50%',
              transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1), background-color 200ms ease',
              transform: checked ? `translateX(${translateVal})` : 'translateX(0)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
            }}
          />
        </div>
      </div>
    </label>
  );
};

export default Toggle;
