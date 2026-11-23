import React, { useState } from 'react';
import type { CategoryDto } from '../types/category';
import type { TaskDto, UpdateTaskDto } from '../types/task';
import { CategoryBadge } from './CategoryBadge';

export interface TaskItemProps {
  task: TaskDto;
  categories: CategoryDto[];
  onToggleComplete: (task: TaskDto) => void;
  onUpdate: (id: number, dto: UpdateTaskDto) => Promise<void>;
  onDelete: (id: number) => void;
  isUpdating: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  categories,
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
  const [editError, setEditError] = useState<string | null>(null);

  const formattedDate = new Date(task.createdAt).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

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
            <div className="task-badges">
              {displayCategory && (
                <CategoryBadge category={displayCategory} size="sm" />
              )}
              <span className={`badge ${task.isCompleted ? 'badge-completed' : 'badge-pending'}`}>
                {task.isCompleted ? 'Completed' : 'Pending'}
              </span>
            </div>
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
    </div>
  );
};
