import React, { useState, useRef, useEffect } from 'react';

export const Dropdown = ({
  trigger,
  items = [],
  value = null,
  onChange = null,
  align = 'right', // 'left', 'right'
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const handleSelect = (item) => {
    onChange?.(item.value || item);
    item.onClick?.();
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`dropdown-container ${className}`}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      <div onClick={() => setIsOpen((prev) => !prev)} style={{ cursor: 'pointer' }}>
        {trigger}
      </div>

      {isOpen && (
        <div
          className="dropdown-menu animate-fade-in"
          style={{
            right: align === 'right' ? 0 : 'auto',
            left: align === 'left' ? 0 : 'auto',
          }}
        >
          {items.map((item, idx) => {
            if (item.divider) {
              return (
                <div
                  key={idx}
                  style={{
                    height: 1,
                    background: 'var(--border-subtle)',
                    margin: '0.35rem 0',
                  }}
                />
              );
            }

            const isSelected = value !== null && item.value === value;

            return (
              <button
                key={idx}
                type="button"
                className={`dropdown-item ${isSelected ? 'active' : ''}`}
                onClick={() => handleSelect(item)}
              >
                {item.icon && (
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    {item.icon}
                  </span>
                )}
                <span style={{ flex: 1 }}>{item.label}</span>
                {isSelected && (
                  <span style={{ color: 'var(--accent-primary)', fontSize: '0.8rem' }}>✓</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
