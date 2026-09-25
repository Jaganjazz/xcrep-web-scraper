import React from 'react';

export const Input = ({
  value,
  onChange,
  placeholder = '',
  type = 'text',
  label = null,
  icon = null,
  suffix = null,
  error = null,
  helperText = null,
  disabled = false,
  className = '',
  style = {},
  inputStyle = {},
  ...props
}) => {
  return (
    <div style={{ width: '100%', ...style }}>
      {label && (
        <label
          style={{
            display: 'block',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--weight-semibold)',
            color: 'var(--text-primary)',
            marginBottom: '0.4rem',
            letterSpacing: '0.02em',
          }}
        >
          {label}
        </label>
      )}
      <div className="input-wrapper">
        {icon && <span className="input-prefix">{icon}</span>}
        <input
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`input-field ${error ? 'input-error' : ''} ${className}`}
          style={{
            paddingLeft: icon ? '2.75rem' : '1rem',
            paddingRight: suffix ? '3rem' : '1rem',
            ...inputStyle,
          }}
          {...props}
        />
        {suffix && <span className="input-suffix">{suffix}</span>}
      </div>
      {error ? (
        <span
          style={{
            color: 'var(--status-error)',
            fontSize: 'var(--text-xs)',
            marginTop: '0.35rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          ⚠️ {error}
        </span>
      ) : helperText ? (
        <span
          style={{
            color: 'var(--text-muted)',
            fontSize: 'var(--text-xs)',
            marginTop: '0.35rem',
            display: 'block',
          }}
        >
          {helperText}
        </span>
      ) : null}
    </div>
  );
};
