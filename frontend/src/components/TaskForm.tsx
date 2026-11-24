import React, { useState } from 'react';
import type { CategoryDto } from '../types/category';
import type { ViewMode } from '../types/task';

export interface TaskFormProps {
  categories: CategoryDto[];
  onSubmit: (
    title: string,
    description: string,
    categoryId: number | null,
    dueDate?: string,
    isDaily?: boolean
  ) => Promise<void>;
  isSubmitting: boolean;
  viewMode: ViewMode;
  todayDate: string;
  tomorrowDate: string;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  categories,
  onSubmit,
  isSubmitting,
  viewMode,
  todayDate,
  tomorrowDate,
}) => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>(tomorrowDate);
  const [isDaily, setIsDaily] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (viewMode === 'archive') {
    return (
      <div className="archive-readonly-notice">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span>
          Archive mode is <strong>strictly read-only</strong>. New tasks cannot be added to past dates.
        </span>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setValidationError('Please enter a task title');
      return;
    }

    if (trimmedTitle.length > 200) {
      setValidationError('Title cannot exceed 200 characters');
      return;
    }

    let targetDueDate: string = todayDate;
    if (viewMode === 'upcoming') {
      if (!dueDate) {
        setValidationError('Please choose a due date for upcoming task');
        return;
      }
      if (dueDate <= todayDate) {
        setValidationError('Upcoming tasks must have a future due date (tomorrow or later)');
        return;
      }
      targetDueDate = dueDate;
    }

    setValidationError(null);
    try {
      const parsedCategoryId = categoryId ? parseInt(categoryId, 10) : null;
      await onSubmit(trimmedTitle, description.trim(), parsedCategoryId, targetDueDate, isDaily);
      setTitle('');
      setDescription('');
      setCategoryId('');
      setDueDate(tomorrowDate);
      setIsDaily(false);
    } catch {
      // Handled by parent component
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h2 className="form-title">
        {viewMode === 'upcoming' ? 'Plan Future Task' : 'Create Task for Today'}
      </h2>
      {validationError && <div className="form-error">{validationError}</div>}
      
      <div className="form-group">
        <input
          type="text"
          className="form-input"
          placeholder={viewMode === 'upcoming' ? 'What are you planning? *' : 'What needs to be done today? *'}
          value={title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setTitle(e.target.value);
            if (validationError) setValidationError(null);
          }}
          disabled={isSubmitting}
          maxLength={200}
        />
      </div>

      <div className="form-group">
        <textarea
          className="form-textarea"
          placeholder="Description or notes (optional)..."
          rows={2}
          value={description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div className="form-row-2col">
        <div className="form-group">
          <label htmlFor="task-category-select" className="form-label">Category</label>
          <select
            id="task-category-select"
            className="form-select"
            value={categoryId}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategoryId(e.target.value)}
            disabled={isSubmitting}
          >
            <option value="">No Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id.toString()}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {viewMode === 'upcoming' && (
          <div className="form-group">
            <label htmlFor="task-due-date-input" className="form-label">Due Date *</label>
            <input
              id="task-due-date-input"
              type="date"
              className="form-input"
              value={dueDate}
              min={tomorrowDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDueDate(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>
        )}
      </div>

      <div className="form-group checkbox-form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            className="form-checkbox"
            checked={isDaily}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsDaily(e.target.checked)}
            disabled={isSubmitting}
          />
          <span className="checkbox-text">
            <strong>🔄 Daily Recurring Task</strong>
            <span className="checkbox-hint">Automatically spawns a fresh copy each day when you log in</span>
          </span>
        </label>
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting || !title.trim()}
        >
          {isSubmitting ? (
            <span className="btn-loading">
              <span className="spinner-small" /> Scheduling...
            </span>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              {viewMode === 'upcoming' ? 'Schedule Future Task' : 'Add Today Task'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};
