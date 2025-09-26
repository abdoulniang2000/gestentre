import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ loading, children, className, ...props }) => {
  return (
    <button 
      className={className} 
      disabled={loading} 
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;