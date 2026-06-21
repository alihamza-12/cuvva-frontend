import React from 'react';
import Spinner from './Spinner';

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
  ...props
}) {
  const baseStyle =
    'flex items-center justify-center gap-2 font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'btn-primary text-white',
    secondary: 'btn-secondary text-white',
    danger:
      'bg-cuvva-red hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-xl shadow-md',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? <Spinner size="sm" /> : children}
    </button>
  );
}