import React from 'react';
import type { TaskDto } from '../types/task';

export interface TaskItemProps {
  task: TaskDto;
  onToggleComplete: (task: TaskDto) => void;
  onDelete: (id: number) => void;
  isUpdating: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleComplete,
  onDelete,
  isUpdating,
}) => {
  const formattedDate = new Date(task.createdAt).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`task-card ${task.isCompleted ? 'completed' : ''}`}>
      <div className="task-card-main">
        <button
          type="button"
          className={`checkbox-btn ${task.isCompleted ? 'checked' : ''}`}
          onClick={() => onToggleComplete(task)}
          disabled={isUpdating}
          aria-label={task.isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
          title={task.isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {task.isCompleted && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>
        <div className="task-content">
          <div className="task-header-row">
            <h3 className="task-title">{task.title}</h3>
            <span className={`badge ${task.isCompleted ? 'badge-completed' : 'badge-pending'}`}>
              {task.isCompleted ? 'Completed' : 'Pending'}
            </span>
          </div>
          {task.description && (
            <p className="task-description">{task.description}</p>
          )}
          <div className="task-footer">
            <span className="task-date">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {formattedDate}
            </span>
          </div>
        </div>
      </div>
      <div className="task-card-actions">
        <button
          type="button"
          className="btn-icon btn-delete"
          onClick={() => onDelete(task.id)}
          disabled={isUpdating}
          title="Delete task"
          aria-label="Delete task"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </button>
      </div>
    </div>
  );
};
