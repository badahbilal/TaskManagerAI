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
  onOpenCategoryModal?: () => void;
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
  onOpenCategoryModal,
}) => {
  return (
    <div className="filters-section-container">
      {/* Category Pills Row with + Category Button */}
      <div className="category-pills-bar">
        <div className="category-pills-scrollable">
          <button
            type="button"
            className={`category-pill ${selectedCategoryId === 'all' ? 'active' : ''}`}
            onClick={() => onCategoryFilterChange('all')}
          >
            <span className="category-pill-dot all-dot" />
            All Tasks
          </button>

          {categories.map((category) => {
            const isSelected: boolean = selectedCategoryId === category.id;
            const color: string = category.color || '#6366f1';
            return (
              <button
                key={category.id}
                type="button"
                className={`category-pill ${isSelected ? 'active' : ''}`}
                style={
                  isSelected
                    ? {
                        backgroundColor: color,
                        borderColor: color,
                        color: '#ffffff',
                      }
                    : undefined
                }
                onClick={() => onCategoryFilterChange(isSelected ? 'all' : category.id)}
              >
                <span
                  className="category-pill-dot"
                  style={{ backgroundColor: isSelected ? '#ffffff' : color }}
                />
                {category.name}
              </button>
            );
          })}
        </div>

        {onOpenCategoryModal && (
          <button
            type="button"
            className="btn btn-secondary btn-sm btn-add-category-pill"
            onClick={onOpenCategoryModal}
            title="Create or manage categories"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Category
          </button>
        )}
      </div>

      {/* Search Input & Status Tabs Row */}
      <div className="filters-sub-row">
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

        <div className="status-filter-tabs">
          <button
            type="button"
            className={`status-tab ${currentFilter === 'all' ? 'active' : ''}`}
            onClick={() => onFilterChange('all')}
          >
            All <span className="tab-count">{totalCount}</span>
          </button>
          <button
            type="button"
            className={`status-tab ${currentFilter === 'pending' ? 'active' : ''}`}
            onClick={() => onFilterChange('pending')}
          >
            Pending <span className="tab-count">{pendingCount}</span>
          </button>
          <button
            type="button"
            className={`status-tab ${currentFilter === 'completed' ? 'active' : ''}`}
            onClick={() => onFilterChange('completed')}
          >
            Done <span className="tab-count">{completedCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
