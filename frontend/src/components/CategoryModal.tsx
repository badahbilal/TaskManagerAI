import React, { useEffect, useState } from 'react';
import type { CategoryDto, CreateCategoryDto } from '../types/category';

export interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryDto[];
  onCreateCategory: (dto: CreateCategoryDto) => Promise<void>;
  onDeleteCategory: (id: number) => Promise<void>;
  isSubmitting: boolean;
}

const PRESET_COLORS: string[] = [
  '#6366f1', // Indigo
  '#3b82f6', // Blue
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#84cc16', // Lime
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#64748b', // Slate
];

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  categories,
  onCreateCategory,
  onDeleteCategory,
  isSubmitting,
}) => {
  const [name, setName] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>(PRESET_COLORS[0]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setValidationError('Category name is required.');
      return;
    }

    if (trimmedName.length > 100) {
      setValidationError('Category name cannot exceed 100 characters.');
      return;
    }

    setValidationError(null);
    try {
      await onCreateCategory({
        name: trimmedName,
        color: selectedColor,
      });
      setName('');
      setSelectedColor(PRESET_COLORS[0]);
    } catch {
      // Error handled by parent
    }
  };

  const handleDelete = async (id: number): Promise<void> => {
    setDeletingId(id);
    try {
      await onDeleteCategory(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
            </div>
            <div>
              <h2 className="modal-title">Manage Categories</h2>
              <p className="modal-subtitle">Organize tasks with custom color-coded labels</p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          {/* Create new category section */}
          <form className="modal-form" onSubmit={handleSubmit}>
            <h3 className="section-title">Add New Category</h3>
            {validationError && <div className="form-error">{validationError}</div>}

            <div className="form-group">
              <label htmlFor="cat-name-input" className="form-label">Category Name</label>
              <input
                id="cat-name-input"
                type="text"
                className="form-input"
                placeholder="e.g. Work, Deep Focus, Health..."
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setName(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                disabled={isSubmitting}
                maxLength={100}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Color Theme</label>
              <div className="color-swatches-grid">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`color-swatch-item ${selectedColor === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                    aria-label={`Select color ${color}`}
                  >
                    {selectedColor === color && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                ))}
                <label className="custom-color-picker-label" title="Custom Hex Color">
                  <input
                    type="color"
                    className="custom-color-picker-input"
                    value={selectedColor}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedColor(e.target.value)}
                  />
                  <span>Custom</span>
                </label>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || !name.trim()}
              >
                {isSubmitting ? 'Creating...' : '+ Create Category'}
              </button>
            </div>
          </form>

          {/* Existing categories list */}
          <div className="modal-category-list-section">
            <h3 className="section-title">Existing Categories ({categories.length})</h3>
            {categories.length === 0 ? (
              <p className="modal-empty-hint">No categories created yet. Add your first one above!</p>
            ) : (
              <div className="modal-category-items">
                {categories.map((cat) => (
                  <div key={cat.id} className="modal-category-row">
                    <div className="modal-category-info">
                      <span
                        className="modal-category-dot"
                        style={{ backgroundColor: cat.color || '#6366f1' }}
                      />
                      <span className="modal-category-name">{cat.name}</span>
                    </div>
                    <button
                      type="button"
                      className="btn-icon btn-delete modal-delete-btn"
                      onClick={() => handleDelete(cat.id)}
                      disabled={deletingId === cat.id}
                      title={`Delete "${cat.name}" category`}
                      aria-label={`Delete "${cat.name}" category`}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
