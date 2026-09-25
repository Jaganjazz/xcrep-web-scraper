import React from 'react';

export const Button = ({
  children,
  variant = 'cta', // 'cta', 'secondary', 'outline', 'gold', 'danger', 'ghost'
  size = 'md',      // 'sm', 'md', 'lg'
  isLoading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  icon = null,
  iconRight = null,
  fullWidth = false,
  style = {},
  ...props
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'cta':
        return 'btn-cta';
      case 'outline':
        return 'btn-outline';
      case 'gold':
        return 'btn-gold';
      case 'danger':
        return 'btn-danger';
      case 'secondary':
      default:
        return 'btn-secondary';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'btn-sm';
      case 'lg':
        return 'btn-lg';
      case 'md':
      default:
        return 'btn-md';
    }
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`btn ${getVariantClass()} ${getSizeClass()} ${className}`}
      style={{
        width: fullWidth ? '100%' : undefined,
        ...style,
      }}
      {...props}
    >
      {isLoading ? (
        <span
          style={{
            width: size === 'sm' ? 14 : 16,
            height: size === 'sm' ? 14 : 16,
            border: '2px solid rgba(0, 0, 0, 0.25)',
            borderTopColor: variant === 'secondary' || variant === 'outline' ? 'var(--accent-primary)' : '#000',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'spin 0.8s linear infinite',
          }}
        />
      ) : (
        <>
          {icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
          <span>{children}</span>
          {iconRight && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{iconRight}</span>}
        </>
      )}
    </button>
  );
};
