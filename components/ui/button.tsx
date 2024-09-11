import React from 'react';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => {
  return <button className="px-4 py-2 bg-blue-500 text-white rounded" {...props}>{children}</button>;
};