import React from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  colorClass: string;
  icon: React.ReactNode;
  label: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, max, colorClass, icon, label }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  return (
    <div className="w-full mb-3">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center text-gray-700 font-bold text-sm">
          <span className="mr-2">{icon}</span>
          {label}
        </div>
        <span className="text-xs font-mono text-gray-500">{Math.round(value)}/{max}</span>
      </div>
      <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden shadow-inner border border-black/5">
        <div 
          className={`h-full transition-all duration-500 ease-out ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};