import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // Vous pouvez ajouter des props spécifiques ici si nécessaire
}

export const Input: React.FC<InputProps> = (props) => {
  return (
    <input
      className="px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      {...props}
    />
  );
};