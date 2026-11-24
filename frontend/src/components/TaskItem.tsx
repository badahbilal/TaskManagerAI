import React, { useState } from 'react';
import type { CategoryDto } from '../types/category';
import type { TaskDto, UpdateTaskDto, ViewMode } from '../types/task';
import { CategoryBadge } from './CategoryBadge';

export interface TaskItemProps {
  task: TaskDto;
  categories: CategoryDto[];
  viewMode: ViewMode;
  onToggleComplete: (task: TaskDto) => void;
  onUpdate: (id: number, dto: UpdateTaskDto) => Promise<void>;
  onDelete: (id: number) => void;
  isUpdating: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  categories,
  viewMode,
  onToggleComplete,
  onUpdate,
  onDelete,
  isUpdating,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>(task.title);
  const [editDescription, setEditDescription] = useState<string>(task.description || '');
  const [editCategoryId, setEditCategoryId] = useState<string>(
    task.categoryId ? task.categoryId.toString() : ''
  );
  const [editDueDate, setEditDueDate] = useState<string>(task.dueDate);
  const [editIsDaily, setEditIsDaily] = useState<boolean>(task.isDaily);
  const [editError, setEditError] = useState<string | null>(null);

  const formattedDueDate = new Date(`${task.dueDate}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedCompletedAt = task.completedAt
    ? new Date(task.completedAt).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  const handleSaveEdit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle) {
      setEditError('Title cannot be empty');
      return;
    }
    if (trimmedTitle.length > 200) {
      setEditError('Title cannot exceed 200 characters');
      return;
    }

    setEditError(null);
    try {
      const parsedCategoryId = editCategoryId ? parseInt(editCategoryId, 10) : null;
      await onUpdate(task.id, {
        title: trimmedTitle,
        description: editDescription.trim() || null,
        isCompleted: task.isCompleted,
        categoryId: parsedCategoryId,
        dueDate: editDueDate,
        isDaily: editIsDaily,
      });
      setIsEditing(false);
    } catch {
      // Error handled by parent
    }
  };

  const handleCancelEdit = (): void => {
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditCategoryId(task.categoryId ? task.categoryId.toString() : '');
    setEditDueDate(task.dueDate);
    setEditIsDaily(task.isDaily);
    setEditError(null);
    setIsEditing(false);
  };

  const displayCategory: CategoryDto | undefined =
    task.category || categories.find((c) => c.id === task.categoryId);

  if (isEditing) {
    return (
      <div className="task-card editing">
        <form className="task-edit-form" onSubmit={handleSaveEdit}>
          {editError && <div className="form-error">{editError}</div>}
          <div className="form-group">
            <input
              type="text"
              className="form-input"
              value={editTitle}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setEditTitle(e.target.value);
                if (editError) setEditError(null);
              }}
              placeholder="Task title..."
              disabled={isUpdating}
              maxLength={200}
            />
          </div>
          <div className="form-group">
            <textarea
              className="form-textarea"
              value={editDescription}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditDescription(e.target.value)}
              placeholder="Description (optional)..."
              rows={2}
              disabled={isUpdating}
            />
          </div>
          <div className="form-row-2col">
            <div className="form-group">
              <label htmlFor={`edit-category-${task.id}`} className="form-label">Category</label>
              <select
                id={`edit-category-${task.id}`}
                className="form-select"
                value={editCategoryId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEditCategoryId(e.target.value)}
                disabled={isUpdating}
              >
                <option value="">No Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id.toString()}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            {viewMode === 'upcoming' && (
              <div className="form-group">
                <label htmlFor={`edit-duedate-${task.id}`} className="form-label">Due Date</label>
                <input
                  id={`edit-duedate-${task.id}`}
                  type="date"
                  className="form-input"
                  value={editDueDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditDueDate(e.target.value)}
                  disabled={isUpdating}
                />
              </div>
            )}
          </div>
          <div className="form-group checkbox-form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                className="form-checkbox"
                checked={editIsDaily}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditIsDaily(e.target.checked)}
                disabled={isUpdating}
              />
              <span className="checkbox-text">🔄 Daily Recurring Task</span>
            </label>
          </div>
          <div className="edit-actions">
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={isUpdating || !editTitle.trim()}
            >
              Save Changes
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleCancelEdit}
              disabled={isUpdating}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Determine card appearance & behavior based on viewMode
  const isArchiveMode = viewMode === 'archive';
  const isUpcomingMode = viewMode === 'upcoming';
  const isTodayMode = viewMode === 'today';

  return (
    <div className={`task-card ${task.isCompleted ? 'completed' : ''} ${isArchiveMode ? 'archive-card' : ''}`}>
      <div className="task-card-main">
        {isTodayMode && (
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
        )}

        {isUpcomingMode && (
          <div
            className="checkbox-btn disabled-future"
            title="Future tasks cannot be marked complete before their due date"
            aria-disabled="true"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        )}

        {isArchiveMode && (
          <div
            className={`checkbox-btn archive-status-indicator ${task.isCompleted ? 'checked' : 'missed'}`}
            title={task.isCompleted ? 'Completed on this date' : 'Missed (not completed on this date)'}
          >
            {task.isCompleted ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            )}
          </div>
        )}

        <div className="task-content">
          <div className="task-header-row">
            <h3 className="task-title">{task.title}</h3>
            <div className="task-badges">
              {task.isDaily && (
                <span className="badge badge-daily" title="Daily Recurring Task">
                  🔄 Daily
                </span>
              )}
              {displayCategory && (
                <CategoryBadge category={displayCategory} size="sm" />
              )}
              {isArchiveMode ? (
                task.isCompleted ? (
                  <span className="badge badge-completed">
                    ✓ Completed {formattedCompletedAt ? `at ${formattedCompletedAt}` : ''}
                  </span>
                ) : (
                  <span className="badge badge-missed">
                    ✕ Missed
                  </span>
                )
              ) : isUpcomingMode ? (
                <span className="badge badge-planned">
                  📅 Due {formattedDueDate}
                </span>
              ) : (
                <span className={`badge ${task.isCompleted ? 'badge-completed' : 'badge-pending'}`}>
                  {task.isCompleted ? 'Completed' : 'Pending'}
                </span>
              )}
            </div>
          </div>
          {task.description && (
            <p className="task-description">{task.description}</p>
          )}
          <div className="task-footer">
            <span className="task-date">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Due: {formattedDueDate}
            </span>
          </div>
        </div>
      </div>

      {/* Action buttons: Only in Today and Upcoming modes. Archive is strictly read-only! */}
      {!isArchiveMode && (
        <div className="task-card-actions">
          <button
            type="button"
            className="btn-icon btn-edit"
            onClick={() => setIsEditing(true)}
            disabled={isUpdating}
            title="Edit task"
            aria-label="Edit task"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
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
      )}
    </div>
  );
};
