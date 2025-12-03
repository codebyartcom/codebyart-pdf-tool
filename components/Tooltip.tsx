import React, { ReactNode } from 'react';

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, position = 'top', className = '' }) => {
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'bottom-[-4px] left-1/2 -translate-x-1/2',
    bottom: 'top-[-4px] left-1/2 -translate-x-1/2',
    left: 'right-[-4px] top-1/2 -translate-y-1/2',
    right: 'left-[-4px] top-1/2 -translate-y-1/2',
  };

  return (
    <div className={`group relative inline-flex items-center justify-center ${className}`}>
      {children}
      <div className={`
        absolute z-[100] invisible opacity-0 group-hover:visible group-hover:opacity-100
        transition-all duration-200 pointer-events-none
        bg-slate-800 text-white text-xs font-medium py-1.5 px-3 rounded-lg shadow-xl whitespace-nowrap
        ${positionClasses[position]}
      `}>
        {content}
        <div className={`
          absolute w-2 h-2 bg-slate-800 transform rotate-45
          ${arrowClasses[position]}
        `}></div>
      </div>
    </div>
  );
};

export default Tooltip;