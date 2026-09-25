import React from 'react';

export const Badge = ({
  variant = 'emerald', // 'emerald', 'cyan', 'amber', 'danger', 'neutral'
  status = null,       // 'completed', 'pending', 'failed' (auto-sets variant & dot)
  label = null,
  dot = true,
  className = '',
  style = {},
}) => {
  let effectiveVariant = variant;
  let dotStatus = status;

  if (status === 'completed') {
    effectiveVariant = 'emerald';
    dotStatus = 'completed';
  } else if (status === 'pending' || status === 'running') {
    effectiveVariant = 'amber';
    dotStatus = 'pending';
  } else if (status === 'failed') {
    effectiveVariant = 'danger';
    dotStatus = 'failed';
  }

  const displayText =
    label || (status ? status.charAt(0).toUpperCase() + status.slice(1) : '');

  return (
    <span
      className={`badge badge-${effectiveVariant} ${className}`}
      style={{
        ...style,
      }}
    >
      {dot && dotStatus && <span className={`status-dot ${dotStatus}`} />}
      {displayText && <span>{displayText}</span>}
    </span>
  );
};
