import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = "", onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700 ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
