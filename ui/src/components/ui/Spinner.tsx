import React from 'react';

interface SpinnerProps {
  size?: number;
  className?: string;
  label?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 16, className = '', label = 'Loading' }) => (
  <svg
    role="img"
    aria-label={label}
    className={["animate-spin", className].join(' ')}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.15" strokeWidth="4" />
    <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

export default Spinner;
