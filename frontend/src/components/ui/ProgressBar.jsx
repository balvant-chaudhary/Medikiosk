// src/components/ui/ProgressBar.jsx
import React from 'react';

export function ProgressBar({ current, total, labels = [] }) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-medium text-[var(--color-text-secondary)]">
          Step {current} of {total}
        </span>
        <span className="text-xs font-semibold text-[var(--color-primary)]">
          {percentage}%
        </span>
      </div>
      <div className="w-full h-[2px] bg-[var(--color-border)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-[#167765] transition-all duration-400 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {labels.length > 0 && (
        <div className="flex justify-between mt-2">
          {labels.map((label, i) => (
            <span
              key={i}
              className={`text-xs transition-colors ${
                i < current
                  ? 'text-[var(--color-primary)] font-semibold'
                  : i === current - 1
                  ? 'text-[var(--color-primary)]'
                  : 'text-[var(--color-text-muted)]'
              }`}
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProgressBar;
