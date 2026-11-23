import React, { useState } from 'react';
import type { CategoryDto } from '../types/category';

export interface TaskFormProps {
  categories: CategoryDto[];
  onSubmit: (title: string, description: string, categoryId: number | null) => Promise<void>;
  isSubmitting: boolean;
}

export const TaskForm: React.FC<TaskFormProps> = ({ categories, onSubmit, isSubmitting }) => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

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

    setValidationError(null);
    try {
      const parsedCategoryId = categoryId ? parseInt(categoryId, 10) : null;
      await onSubmit(trimmedTitle, description.trim(), parsedCategoryId);
      setTitle('');
      setDescription('');
      setCategoryId('');
    } catch {
      // Handled by parent component
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h2 className="form-title">Create New Task</h2>
      {validationError && <div className="form-error">{validationError}</div>}
      <div className="form-group">
        <input
          type="text"
          className="form-input"
          placeholder="What needs to be done? *"
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
      <div className="form-actions">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting || !title.trim()}
        >
          {isSubmitting ? (
            <span className="btn-loading">
              <span className="spinner-small" /> Adding...
            </span>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Task
            </>
          )}
        </button>
      </div>
    </form>
  );
};
