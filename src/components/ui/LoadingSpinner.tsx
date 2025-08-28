import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'border-blue-600' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2', 
    lg: 'h-12 w-12 border-4'
  };

  return (
    <div 
      className={`animate-spin rounded-full border-t-transparent ${sizeClasses[size]} ${color}`}
    />
  );
}