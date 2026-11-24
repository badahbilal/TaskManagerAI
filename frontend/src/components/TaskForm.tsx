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
  onOpenCategoryModal?: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  categories,
  onSubmit,
  isSubmitting,
  viewMode,
  todayDate,
  tomorrowDate,
  onOpenCategoryModal,
}) => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>(tomorrowDate);
  const [isDaily, setIsDaily] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (viewMode === 'archive') {
    return (
      <div className="archive-readonly-notice">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span>
          <strong>Archive Mode:</strong> Historical records are read-only. Tasks cannot be added to past dates.
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
        setValidationError('Please choose a future due date');
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
      setIsExpanded(false);
    } catch {
      // Handled by parent component
    }
  };

  return (
    <div className={`quick-add-card ${isExpanded ? 'expanded' : ''}`}>
      <form onSubmit={handleSubmit} className="quick-add-form">
        {validationError && <div className="form-error quick-add-error">{validationError}</div>}

        <div className="quick-add-primary-row">
          <div className="quick-add-input-wrap">
            <span className="quick-add-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </span>
            <input
              type="text"
              className="quick-add-title-input"
              placeholder={
                viewMode === 'upcoming'
                  ? 'Plan a future task... (e.g. Prepare presentation, Due tomorrow)'
                  : 'Add a new task for today... (Press Enter to add)'
              }
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setTitle(e.target.value);
                if (validationError) setValidationError(null);
              }}
              onFocus={() => setIsExpanded(true)}
              disabled={isSubmitting}
              maxLength={200}
            />
          </div>

          <div className="quick-add-inline-actions">
            <button
              type="button"
              className={`btn-icon btn-options-toggle ${isExpanded ? 'active' : ''}`}
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? 'Collapse options' : 'More options (Category, Daily, Notes)'}
              aria-label="Toggle options"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>

            <button
              type="submit"
              className="btn btn-primary btn-quick-add"
              disabled={isSubmitting || !title.trim()}
            >
              {isSubmitting ? (
                <span className="btn-loading">
                  <span className="spinner-small" /> Adding
                </span>
              ) : (
                'Add Task'
              )}
            </button>
          </div>
        </div>

        {/* Expandable options row */}
        {isExpanded && (
          <div className="quick-add-options-tray">
            <div className="options-tray-row">
              <input
                type="text"
                className="form-input quick-add-desc-input"
                placeholder="Description or notes (optional)..."
                value={description}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
                disabled={isSubmitting}
              />

              <div className="quick-add-select-group">
                <select
                  className="form-select quick-add-category-select"
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

                {onOpenCategoryModal && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm btn-new-cat-inline"
                    onClick={onOpenCategoryModal}
                    title="Manage / Create Categories"
                  >
                    +
                  </button>
                )}
              </div>

              {viewMode === 'upcoming' && (
                <div className="quick-add-due-group">
                  <input
                    type="date"
                    className="form-input quick-add-date-input"
                    value={dueDate}
                    min={tomorrowDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDueDate(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>
              )}

              <label className="quick-add-daily-toggle" title="Task will spawn every morning automatically">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={isDaily}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsDaily(e.target.checked)}
                  disabled={isSubmitting}
                />
                <span className="daily-toggle-text">🔄 Daily</span>
              </label>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
