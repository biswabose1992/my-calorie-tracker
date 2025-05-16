import React from 'react';

interface ProgressBarProps {
  label: string;
  current: number;
  target: number;
  unit: string;
  colorClass: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ label, current, target, unit, colorClass }) => {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : (current > 0 ? 100 : 0);
  const isExceeded = target > 0 && current > target;
  const difference = isExceeded ? current - target : target - current;

  return (
    <div className="mb-3 last:mb-0">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className={`text-xs font-semibold ${isExceeded ? 'text-red-600' : 'text-gray-600'}`}>
          {current.toFixed(1)} of {target.toFixed(1)} {unit}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`${colorClass} h-2.5 rounded-full transition-all duration-500 ease-in-out ${isExceeded ? 'bg-red-600' : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-right text-xs mt-1">
        {isExceeded
          ? <span className="text-red-600 font-medium">Exceeds By: {difference.toFixed(1)} {unit}</span>
          : <span className="text-gray-600">Remaining: {difference.toFixed(1)} {unit}</span>
        }
      </div>
    </div>
  );
};

export default ProgressBar;