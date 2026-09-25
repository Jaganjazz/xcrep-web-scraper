import React from 'react';

export const Checkbox = ({
  label,
  checked = false,
  onChange,
  id,
  disabled = false,
  description = null,
  className = '',
  style = {},
  ...props
}) => {
  return (
    <label
      htmlFor={id}
      className={`cyber-checkbox ${className}`}
      style={{
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style,
      }}
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        {...props}
      />
      <div>
        <span style={{ fontWeight: checked ? 'var(--weight-semibold)' : 'var(--weight-normal)' }}>
          {label}
        </span>
        {description && (
          <span
            style={{
              display: 'block',
              fontSize: 'var(--text-xs)',
              color: 'var(--text-muted)',
              marginTop: '0.1rem',
            }}
          >
            {description}
          </span>
        )}
      </div>
    </label>
  );
};
