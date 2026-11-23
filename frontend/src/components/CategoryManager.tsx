import React, { useState } from 'react';
import type { CategoryDto, CreateCategoryDto } from '../types/category';
import { CategoryBadge } from './CategoryBadge';

export interface CategoryManagerProps {
  categories: CategoryDto[];
  onCreateCategory: (dto: CreateCategoryDto) => Promise<void>;
  onDeleteCategory: (id: number) => Promise<void>;
  isSubmitting: boolean;
}

const PRESET_COLORS: string[] = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#14b8a6', // Teal
];

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  onCreateCategory,
  onDeleteCategory,
  isSubmitting,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>(PRESET_COLORS[0]);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setValidationError('Category name is required');
      return;
    }

    if (trimmedName.length > 100) {
      setValidationError('Category name cannot exceed 100 characters');
      return;
    }

    setValidationError(null);
    try {
      await onCreateCategory({
        name: trimmedName,
        color: selectedColor,
      });
      setName('');
    } catch {
      // Error handled by parent
    }
  };

  return (
    <div className="category-manager-card">
      <div
        className="category-manager-header"
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setIsOpen(!isOpen);
          }
        }}
      >
        <div className="category-manager-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
          <span>Categories ({categories.length})</span>
        </div>
        <span className={`accordion-chevron ${isOpen ? 'open' : ''}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </div>

      {isOpen && (
        <div className="category-manager-body">
          <div className="category-list-chips">
            {categories.length === 0 ? (
              <span className="category-empty-text">No categories yet. Add one below!</span>
            ) : (
              categories.map((category) => (
                <CategoryBadge
                  key={category.id}
                  category={category}
                  onDelete={onDeleteCategory}
                  size="md"
                />
              ))
            )}
          </div>

          <form className="category-create-form" onSubmit={handleSubmit}>
            <div className="category-input-row">
              <input
                type="text"
                className="form-input category-input"
                placeholder="New category name..."
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setName(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                disabled={isSubmitting}
                maxLength={100}
              />
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={isSubmitting || !name.trim()}
              >
                Add
              </button>
            </div>

            {validationError && <div className="form-error">{validationError}</div>}

            <div className="color-palette-row">
              <span className="color-palette-label">Color:</span>
              <div className="color-swatches">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`color-swatch ${selectedColor === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                    aria-label={`Select color ${color}`}
                  />
                ))}
                <input
                  type="color"
                  className="color-picker-input"
                  value={selectedColor}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedColor(e.target.value)}
                  title="Custom color"
                />
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
