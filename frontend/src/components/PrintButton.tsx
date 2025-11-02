import React from 'react';
import { Printer } from 'lucide-react';

interface PrintButtonProps {
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const PrintButton: React.FC<PrintButtonProps> = ({
  onClick,
  className = '',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const handlePrint = () => {
    if (onClick) {
      onClick();
    } else {
      // Default print behavior
      window.print();
    }
  };

  return (
    <button
      onClick={handlePrint}
      className={`flex items-center justify-center bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 ${sizeClasses[size]} ${className} mobile-btn mobile-touch-target print-button`}
      title="Print this FAQ"
    >
      <Printer className={`${iconSizes[size]} mr-2`} />
      <span className="hidden sm:inline">Print</span>
      <span className="sm:hidden">
        <Printer className={iconSizes[size]} />
      </span>
    </button>
  );
};

export default PrintButton;