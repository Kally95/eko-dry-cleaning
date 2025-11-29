import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, selected }) => {
  const baseClasses = 'bg-white rounded-lg shadow-md p-6';
  const interactiveClasses = onClick
    ? 'cursor-pointer hover:shadow-lg transition-shadow'
    : '';
  const selectedClasses = selected
    ? 'ring-2 ring-primary-600'
    : '';

  return (
    <div
      className={`${baseClasses} ${interactiveClasses} ${selectedClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
