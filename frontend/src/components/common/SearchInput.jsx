import React from 'react';
import { SearchIcon, XIcon } from './Icons';

export const SearchInput = ({
  value = '',
  onChange,
  onClear,
  placeholder = 'Search...',
  shortcut = null,
  className = '',
  style = {},
  autoFocus = false,
  ...props
}) => {
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        ...style,
      }}
    >
      <span
        style={{
          position: 'absolute',
          left: '0.85rem',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          pointerEvents: 'none',
        }}
      >
        <SearchIcon width={16} height={16} />
      </span>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        style={{
          width: '100%',
          backgroundColor: 'var(--bg-input)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-md)',
          padding: '0.55rem 2.5rem 0.55rem 2.4rem',
          color: 'var(--text-primary)',
          fontSize: 'var(--text-sm)',
          fontFamily: 'var(--font-sans)',
          outline: 'none',
          transition: 'border-color 180ms ease, box-shadow 180ms ease, background-color 180ms ease',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--border-focus)';
          e.target.style.backgroundColor = 'var(--bg-input-focus)';
          e.target.style.boxShadow = 'var(--glow-cyan-sm)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'var(--border-medium)';
          e.target.style.backgroundColor = 'var(--bg-input)';
          e.target.style.boxShadow = 'none';
        }}
        {...props}
      />

      <div
        style={{
          position: 'absolute',
          right: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
        }}
      >
        {value ? (
          <button
            type="button"
            onClick={() => {
              if (onClear) onClear();
              else if (onChange) onChange('');
            }}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '0.15rem',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              borderRadius: 'var(--radius-xs)',
              transition: 'color 150ms ease',
            }}
            aria-label="Clear search"
          >
            <XIcon width={14} height={14} />
          </button>
        ) : shortcut ? (
          <kbd
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.07)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xs)',
              padding: '0.15rem 0.4rem',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)',
              pointerEvents: 'none',
            }}
          >
            {shortcut}
          </kbd>
        ) : null}
      </div>
    </div>
  );
};

export default SearchInput;
