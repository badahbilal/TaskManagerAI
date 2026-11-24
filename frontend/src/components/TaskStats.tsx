import React from 'react';

export interface TaskStatsProps {
  total: number;
  completed: number;
  pending: number;
  label?: string;
}

export const TaskStats: React.FC<TaskStatsProps> = ({ total, completed, pending, label = "Today's Progress" }) => {
  const completionPercentage: number = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="progress-header-container">
      <div className="progress-header-main">
        <div className="progress-title-section">
          <span className="progress-label">{label}</span>
          <span className="progress-ratio">
            <strong>{completed}</strong> of <strong>{total}</strong> completed
          </span>
        </div>

        <div className="progress-chips-section">
          <span className="stat-chip stat-chip-pending">
            <span className="stat-dot dot-pending" />
            {pending} Pending
          </span>
          <span className="stat-chip stat-chip-completed">
            <span className="stat-dot dot-completed" />
            {completed} Done
          </span>
          <span className="stat-chip stat-chip-pct">
            {completionPercentage}%
          </span>
        </div>
      </div>

      <div className="progress-track-wrapper">
        <div
          className="progress-fill-bar"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>
    </div>
  );
};
