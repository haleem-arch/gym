import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = "", onClick }) => {
  const isGlass = !className.includes('bg-') && !className.includes('border-');
  const baseStyle = isGlass
    ? `glass-panel glass-panel-hover rounded-xl p-6 ${onClick ? 'cursor-pointer' : ''} ${className}`
    : `bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700 ${onClick ? 'cursor-pointer' : ''} ${className}`;

  return (
    <div 
      onClick={onClick}
      className={baseStyle}
    >
      {children}
    </div>
  );
};

export default Card;
