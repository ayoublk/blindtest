import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'outline' | 'solid' | 'ghost';
  size?: 'small' | 'medium' | 'large' | 'icon';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'solid', 
  size = 'medium', 
  className = '', 
  ...props 
}) => {
  const baseClasses = "text-white rounded";
  
  const variantClasses = {
    outline: 'bg-transparent border border-current text-blue-500 hover:bg-blue-100',
    solid: 'bg-blue-500 hover:bg-blue-600',
    ghost: 'bg-transparent text-blue-500 hover:bg-blue-100',
  };

  const sizeClasses = {
    small: 'px-2 py-1 text-sm',
    medium: 'px-4 py-2',
    large: 'px-6 py-3 text-lg',
    icon: 'p-2',
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return <button className={classes} {...props}>{children}</button>;
};