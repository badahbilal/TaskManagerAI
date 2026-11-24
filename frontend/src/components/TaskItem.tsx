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
      <div className="task-row editing">
        <form className="task-inline-edit-form" onSubmit={handleSaveEdit}>
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
              autoFocus
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              className="form-input"
              value={editDescription}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditDescription(e.target.value)}
              placeholder="Description or notes (optional)..."
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
          <div className="edit-form-bottom-row">
            <label className="quick-add-daily-toggle">
              <input
                type="checkbox"
                className="form-checkbox"
                checked={editIsDaily}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditIsDaily(e.target.checked)}
                disabled={isUpdating}
              />
              <span className="daily-toggle-text">🔄 Daily Recurring</span>
            </label>
            <div className="edit-actions">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleCancelEdit}
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={isUpdating || !editTitle.trim()}
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  const isArchiveMode = viewMode === 'archive';
  const isUpcomingMode = viewMode === 'upcoming';
  const isTodayMode = viewMode === 'today';

  return (
    <div
      className={`task-row ${task.isCompleted ? 'completed' : ''} ${
        isArchiveMode ? 'archive-row' : ''
      }`}
    >
      <div className="task-row-main">
        {/* Checkbox or state indicator */}
        <div className="task-checkbox-slot">
          {isTodayMode && (
            <button
              type="button"
              className={`circular-checkbox ${task.isCompleted ? 'checked' : ''}`}
              onClick={() => onToggleComplete(task)}
              disabled={isUpdating}
              aria-label={task.isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
              title={task.isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>
          )}

          {isUpcomingMode && (
            <div
              className="circular-checkbox locked-checkbox"
              title="Completion unlocks on due date"
              aria-disabled="true"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
          )}

          {isArchiveMode && (
            <div
              className={`circular-checkbox archive-indicator ${task.isCompleted ? 'archive-done' : 'archive-missed'}`}
              title={task.isCompleted ? 'Completed on this date' : 'Missed (not completed on this date)'}
            >
              {task.isCompleted ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              )}
            </div>
          )}
        </div>

        {/* Task content */}
        <div className="task-content-slot">
          <div className="task-title-line">
            <span className={`task-title-text ${task.isCompleted ? 'title-completed' : ''}`}>
              {task.title}
            </span>
          </div>

          {task.description && (
            <p className="task-desc-text">{task.description}</p>
          )}

          <div className="task-meta-pills">
            {task.isDaily && (
              <span className="task-pill pill-daily" title="Daily Recurring Task">
                🔄 Daily
              </span>
            )}

            {displayCategory && (
              <CategoryBadge category={displayCategory} size="sm" />
            )}

            {isArchiveMode ? (
              task.isCompleted ? (
                <span className="task-pill pill-completed">
                  ✓ Completed {formattedCompletedAt ? `at ${formattedCompletedAt}` : ''}
                </span>
              ) : (
                <span className="task-pill pill-missed">
                  ✕ Missed
                </span>
              )
            ) : isUpcomingMode ? (
              <span className="task-pill pill-due">
                📅 Due {formattedDueDate}
              </span>
            ) : (
              <span className="task-pill pill-due-subtle">
                Today
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Hover action buttons (Edit, Delete) - Only for Today and Upcoming */}
      {!isArchiveMode && (
        <div className="task-hover-actions">
          <button
            type="button"
            className="btn-icon btn-action-edit"
            onClick={() => setIsEditing(true)}
            disabled={isUpdating}
            title="Edit task"
            aria-label="Edit task"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            type="button"
            className="btn-icon btn-action-delete"
            onClick={() => onDelete(task.id)}
            disabled={isUpdating}
            title="Delete task"
            aria-label="Delete task"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};
