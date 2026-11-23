import React from 'react';
import type { CategoryDto } from '../types/category';

export interface CategoryBadgeProps {
  category: CategoryDto;
  onDelete?: (id: number) => void;
  size?: 'sm' | 'md';
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  onDelete,
  size = 'md',
}) => {
  const color = category.color || '#6366f1';

  return (
    <span
      className={`category-badge category-badge-${size}`}
      style={{
        backgroundColor: `${color}1a`, // ~10% opacity background
        borderColor: `${color}40`,
        color: color,
      }}
    >
      <span
        className="category-badge-dot"
        style={{ backgroundColor: color }}
      />
      <span className="category-badge-text">{category.name}</span>
      {onDelete && (
        <button
          type="button"
          className="category-badge-delete"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            onDelete(category.id);
          }}
          title={`Delete category ${category.name}`}
          aria-label={`Delete category ${category.name}`}
        >
          ×
        </button>
      )}
    </span>
  );
};
