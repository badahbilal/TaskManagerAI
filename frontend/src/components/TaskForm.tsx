import React, { useState } from 'react';

export interface TaskFormProps {
  onSubmit: (title: string, description: string) => Promise<void>;
  isSubmitting: boolean;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, isSubmitting }) => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
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
      await onSubmit(trimmedTitle, description.trim());
      setTitle('');
      setDescription('');
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
