import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'outline-primary' | 'outline-secondary' | 'outline-success' | 'outline-danger' | 'outline-warning' | 'outline-info';
  size?: 'sm' | 'lg';
}

const Button: React.FC<ButtonProps> = ({ 
  loading, 
  children, 
  className = '', 
  variant = 'primary',
  size,
  disabled,
  ...props 
}) => {
  const sizeClass = size ? `btn-${size}` : '';
  const variantClass = `btn-${variant}`;
  
  return (
    <button 
      className={`btn ${variantClass} ${sizeClass} ${className} animate__animated animate__pulse`}
      disabled={loading || disabled} 
      style={{ 
        animationDuration: loading ? '1s' : '0.5s',
        animationIterationCount: loading ? 'infinite' : '1'
      }}
      {...props}
    >
      {loading && (
        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      )}
      {children}
    </button>
  );
};

export default Button;