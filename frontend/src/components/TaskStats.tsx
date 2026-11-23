import React from 'react';

export interface TaskStatsProps {
  total: number;
  completed: number;
  pending: number;
}

export const TaskStats: React.FC<TaskStatsProps> = ({ total, completed, pending }) => {
  const completionPercentage: number = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="stats-container">
      <div className="stat-card">
        <span className="stat-label">Total Tasks</span>
        <span className="stat-value">{total}</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Pending</span>
        <span className="stat-value pending">{pending}</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Completed</span>
        <span className="stat-value completed">{completed}</span>
      </div>
      <div className="stat-card progress-card">
        <span className="stat-label">Progress</span>
        <div className="progress-info">
          <span className="stat-value">{completionPercentage}%</span>
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
