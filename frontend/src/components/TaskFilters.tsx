import React from 'react';
import type { CategoryDto } from '../types/category';
import type { TaskFilter } from '../types/task';

export interface TaskFiltersProps {
  currentFilter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categories: CategoryDto[];
  selectedCategoryId: number | 'all';
  onCategoryFilterChange: (categoryId: number | 'all') => void;
  totalCount: number;
  pendingCount: number;
  completedCount: number;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  currentFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  categories,
  selectedCategoryId,
  onCategoryFilterChange,
  totalCount,
  pendingCount,
  completedCount,
}) => {
  return (
    <div className="filters-bar">
      <div className="filters-top-row">
        <div className="search-input-wrapper">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <div className="filter-tabs">
          <button
            type="button"
            className={`filter-tab ${currentFilter === 'all' ? 'active' : ''}`}
            onClick={() => onFilterChange('all')}
          >
            All ({totalCount})
          </button>
          <button
            type="button"
            className={`filter-tab ${currentFilter === 'pending' ? 'active' : ''}`}
            onClick={() => onFilterChange('pending')}
          >
            Pending ({pendingCount})
          </button>
          <button
            type="button"
            className={`filter-tab ${currentFilter === 'completed' ? 'active' : ''}`}
            onClick={() => onFilterChange('completed')}
          >
            Completed ({completedCount})
          </button>
        </div>
      </div>

      {categories.length > 0 && (
        <div className="category-filter-chips">
          <span className="category-filter-label">Filter by Category:</span>
          <button
            type="button"
            className={`category-chip ${selectedCategoryId === 'all' ? 'active' : ''}`}
            onClick={() => onCategoryFilterChange('all')}
          >
            All
          </button>
          {categories.map((category) => {
            const isSelected = selectedCategoryId === category.id;
            const color = category.color || '#6366f1';
            return (
              <button
                key={category.id}
                type="button"
                className={`category-chip ${isSelected ? 'active' : ''}`}
                style={
                  isSelected
                    ? { backgroundColor: color, color: '#fff', borderColor: color }
                    : { borderColor: `${color}60`, color: color }
                }
                onClick={() => onCategoryFilterChange(isSelected ? 'all' : category.id)}
              >
                <span
                  className="category-chip-dot"
                  style={{ backgroundColor: isSelected ? '#fff' : color }}
                />
                {category.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
