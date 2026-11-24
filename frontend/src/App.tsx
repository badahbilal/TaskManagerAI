import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthView } from './components/AuthView';
import { CategoryModal } from './components/CategoryModal';
import { TaskFilters } from './components/TaskFilters';
import { TaskForm } from './components/TaskForm';
import { TaskItem } from './components/TaskItem';
import { TaskStats } from './components/TaskStats';
import { useTheme } from './hooks/useTheme';
import { authService } from './services/authService';
import { categoryService } from './services/categoryService';
import { taskService } from './services/taskService';
import type { UserDto } from './types/auth';
import type { CategoryDto, CreateCategoryDto } from './types/category';
import type { CreateTaskDto, TaskDto, TaskFilter, UpdateTaskDto, ViewMode } from './types/task';
import './App.css';

const getLocalDateString = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const App: React.FC = () => {
  const [theme, toggleTheme] = useTheme();
  const [currentUser, setCurrentUser] = useState<UserDto | null>(() => authService.getUser());
  const [viewMode, setViewMode] = useState<ViewMode>('today');
  const [archiveDate, setArchiveDate] = useState<string>(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return getLocalDateString(yesterday);
  });

  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCategorySubmitting, setIsCategorySubmitting] = useState<boolean>(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [updatingIds, setUpdatingIds] = useState<number[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const todayDate = useMemo(() => getLocalDateString(new Date()), []);
  const tomorrowDate = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return getLocalDateString(tomorrow);
  }, []);
  const yesterdayDate = useMemo(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return getLocalDateString(yesterday);
  }, []);

  useEffect(() => {
    const handleAuthChange = (): void => {
      setCurrentUser(authService.getUser());
    };
    window.addEventListener('auth-changed', handleAuthChange);
    return () => window.removeEventListener('auth-changed', handleAuthChange);
  }, []);

  const loadData = useCallback(async (): Promise<void> => {
    if (!authService.isAuthenticated()) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      let tasksPromise: Promise<TaskDto[]>;
      if (viewMode === 'today') {
        tasksPromise = taskService.getTasks();
      } else if (viewMode === 'upcoming') {
        tasksPromise = taskService.getUpcomingTasks();
      } else {
        tasksPromise = taskService.getTasks(archiveDate);
      }

      const [fetchedTasks, fetchedCategories] = await Promise.all([
        tasksPromise,
        categoryService.getCategories(),
      ]);
      setTasks(fetchedTasks);
      setCategories(fetchedCategories);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to connect to backend API';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, [viewMode, archiveDate]);

  useEffect(() => {
    if (currentUser) {
      loadData();
    } else {
      setTasks([]);
      setCategories([]);
    }
  }, [currentUser, loadData]);

  const handleCreateTask = async (
    title: string,
    description: string,
    categoryId: number | null,
    dueDate?: string,
    isDaily?: boolean
  ): Promise<void> => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const createDto: CreateTaskDto = {
        title,
        description: description ? description : null,
        categoryId: categoryId,
        dueDate: dueDate,
        isDaily: isDaily ?? false,
      };
      const createdTask = await taskService.createTask(createDto);
      if (viewMode === 'today' && (!dueDate || dueDate === todayDate)) {
        setTasks((prev) => [createdTask, ...prev]);
      } else if (viewMode === 'upcoming' && dueDate && dueDate > todayDate) {
        setTasks((prev) => [createdTask, ...prev]);
      } else {
        await loadData();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create task';
      setErrorMessage(message);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTask = async (id: number, dto: UpdateTaskDto): Promise<void> => {
    setUpdatingIds((prev) => [...prev, id]);
    setErrorMessage(null);

    try {
      const updatedTask = await taskService.updateTask(id, dto);
      setTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update task';
      setErrorMessage(message);
      throw error;
    } finally {
      setUpdatingIds((prev) => prev.filter((updatingId) => updatingId !== id));
    }
  };

  const handleToggleComplete = async (task: TaskDto): Promise<void> => {
    if (viewMode === 'archive') {
      setErrorMessage('Archive mode is read-only. Past tasks cannot be modified.');
      return;
    }
    if (viewMode === 'upcoming') {
      setErrorMessage('Upcoming tasks cannot be marked complete before their due date.');
      return;
    }

    const newCompletionStatus = !task.isCompleted;
    setUpdatingIds((prev) => [...prev, task.id]);
    setErrorMessage(null);

    try {
      const updateDto: UpdateTaskDto = {
        title: task.title,
        description: task.description,
        isCompleted: newCompletionStatus,
        categoryId: task.categoryId,
        dueDate: task.dueDate,
        isDaily: task.isDaily,
      };
      const updatedTask = await taskService.updateTask(task.id, updateDto);
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? updatedTask : t))
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update task';
      setErrorMessage(message);
    } finally {
      setUpdatingIds((prev) => prev.filter((id) => id !== task.id));
    }
  };

  const handleDeleteTask = async (id: number): Promise<void> => {
    if (viewMode === 'archive') {
      setErrorMessage('Archive mode is read-only. Past tasks cannot be deleted.');
      return;
    }

    setUpdatingIds((prev) => [...prev, id]);
    setErrorMessage(null);

    try {
      await taskService.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete task';
      setErrorMessage(message);
    } finally {
      setUpdatingIds((prev) => prev.filter((updatingId) => updatingId !== id));
    }
  };

  const handleCreateCategory = async (dto: CreateCategoryDto): Promise<void> => {
    setIsCategorySubmitting(true);
    setErrorMessage(null);
    try {
      const createdCategory = await categoryService.createCategory(dto);
      setCategories((prev) => [...prev, createdCategory]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create category';
      setErrorMessage(message);
      throw error;
    } finally {
      setIsCategorySubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: number): Promise<void> => {
    setIsCategorySubmitting(true);
    setErrorMessage(null);
    try {
      await categoryService.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setTasks((prev) =>
        prev.map((t) => (t.categoryId === id ? { ...t, categoryId: null, category: null } : t))
      );
      if (selectedCategoryId === id) {
        setSelectedCategoryId('all');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete category';
      setErrorMessage(message);
    } finally {
      setIsCategorySubmitting(false);
    }
  };

  const handleLogout = (): void => {
    authService.logout();
    setCurrentUser(null);
    setTasks([]);
    setCategories([]);
  };

  const completedCount = useMemo(
    () => tasks.filter((t) => t.isCompleted).length,
    [tasks]
  );
  const pendingCount = useMemo(
    () => tasks.filter((t) => !t.isCompleted).length,
    [tasks]
  );

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (filter === 'completed') return task.isCompleted;
        if (filter === 'pending') return !task.isCompleted;
        return true;
      })
      .filter((task) => {
        if (selectedCategoryId === 'all') return true;
        return task.categoryId === selectedCategoryId;
      })
      .filter((task) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDesc = task.description?.toLowerCase().includes(query) ?? false;
        return matchesTitle || matchesDesc;
      });
  }, [tasks, filter, selectedCategoryId, searchQuery]);

  if (!currentUser) {
    return <AuthView onAuthSuccess={(user: UserDto) => setCurrentUser(user)} />;
  }

  const userInitials = currentUser.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const formattedToday = new Date().toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  const formattedArchiveDate = new Date(`${archiveDate}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const progressHeaderLabel: string =
    viewMode === 'today'
      ? "Today's Focus"
      : viewMode === 'upcoming'
      ? 'Upcoming Tasks'
      : `Archive (${formattedArchiveDate})`;

  return (
    <div className="app-container">
      {/* Top Navbar Header */}
      <header className="app-header">
        <div className="header-brand">
          <div className="brand-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v4" />
              <path d="m16.2 7.8 2.9-2.9" />
              <path d="M18 12h4" />
              <path d="m16.2 16.2 2.9 2.9" />
              <path d="M12 18v4" />
              <path d="m4.9 19.1 2.9-2.9" />
              <path d="M2 12h4" />
              <path d="m4.9 4.9 2.9 2.9" />
            </svg>
          </div>
          <div className="header-brand-text">
            <div className="header-title-row">
              <h1 className="header-title">TaskManager AI</h1>
              <span className="saas-badge">PRO</span>
            </div>
            <p className="header-subtitle">Linear-style Focus & Planning</p>
          </div>
        </div>

        <div className="header-actions">
          {/* Theme Toggle Button */}
          <button
            type="button"
            className="btn-theme-toggle"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          <div className="user-profile-badge" title={currentUser.email}>
            <span className="user-avatar">{userInitials}</span>
            <span className="user-name">{currentUser.fullName}</span>
          </div>

          <button
            type="button"
            className="btn-icon-nav"
            onClick={loadData}
            disabled={isLoading}
            title="Refresh tasks"
            aria-label="Refresh data"
          >
            <svg className={isLoading ? 'spinning' : ''} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          </button>

          <button
            type="button"
            className="btn-icon-nav btn-logout-icon"
            onClick={handleLogout}
            title="Sign out"
            aria-label="Sign out"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main SaaS Workspace Flow */}
      <main className="app-workspace">
        {/* Navigation Tabs */}
        <nav className="view-navigation" aria-label="Views">
          <button
            type="button"
            className={`view-nav-btn ${viewMode === 'today' ? 'active' : ''}`}
            onClick={() => setViewMode('today')}
          >
            <span className="view-nav-icon">📌</span>
            <div className="view-nav-text">
              <span className="view-nav-title">Today</span>
              <span className="view-nav-sub">{formattedToday}</span>
            </div>
          </button>

          <button
            type="button"
            className={`view-nav-btn ${viewMode === 'upcoming' ? 'active' : ''}`}
            onClick={() => setViewMode('upcoming')}
          >
            <span className="view-nav-icon">🚀</span>
            <div className="view-nav-text">
              <span className="view-nav-title">Upcoming</span>
              <span className="view-nav-sub">Future Plans</span>
            </div>
          </button>

          <button
            type="button"
            className={`view-nav-btn ${viewMode === 'archive' ? 'active' : ''}`}
            onClick={() => setViewMode('archive')}
          >
            <span className="view-nav-icon">📚</span>
            <div className="view-nav-text">
              <span className="view-nav-title">Archive</span>
              <span className="view-nav-sub">History</span>
            </div>
          </button>
        </nav>

        {/* Archive Date Selector Toolbar */}
        {viewMode === 'archive' && (
          <div className="archive-toolbar">
            <div className="archive-date-picker-wrap">
              <label htmlFor="archive-date-selector" className="archive-date-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Select History Date:
              </label>
              <input
                id="archive-date-selector"
                type="date"
                className="form-input archive-date-input"
                value={archiveDate}
                max={yesterdayDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  if (e.target.value) {
                    setArchiveDate(e.target.value);
                  }
                }}
              />
            </div>
            <div className="archive-quick-actions">
              <button
                type="button"
                className={`btn btn-sm ${archiveDate === yesterdayDate ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setArchiveDate(yesterdayDate)}
              >
                Yesterday
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  const prev = new Date(`${archiveDate}T00:00:00`);
                  prev.setDate(prev.getDate() - 1);
                  setArchiveDate(getLocalDateString(prev));
                }}
              >
                ◀ Prev Day
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={archiveDate >= yesterdayDate}
                onClick={() => {
                  const next = new Date(`${archiveDate}T00:00:00`);
                  next.setDate(next.getDate() + 1);
                  const nextStr = getLocalDateString(next);
                  if (nextStr <= yesterdayDate) {
                    setArchiveDate(nextStr);
                  }
                }}
              >
                Next Day ▶
              </button>
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="alert-banner">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div className="alert-content">
              <strong>Notice:</strong> {errorMessage}
            </div>
            <button
              type="button"
              className="alert-close"
              onClick={() => setErrorMessage(null)}
              aria-label="Dismiss alert"
            >
              ×
            </button>
          </div>
        )}

        {/* Sleek Compact Progress Header */}
        <TaskStats
          total={tasks.length}
          completed={completedCount}
          pending={pendingCount}
          label={progressHeaderLabel}
        />

        {/* Top Quick Task Creation Bar */}
        <TaskForm
          categories={categories}
          onSubmit={handleCreateTask}
          isSubmitting={isSubmitting}
          viewMode={viewMode}
          todayDate={todayDate}
          tomorrowDate={tomorrowDate}
          onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
        />

        {/* Filter Section: Category Pills + Search & Status Tabs */}
        <TaskFilters
          currentFilter={filter}
          onFilterChange={setFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onCategoryFilterChange={setSelectedCategoryId}
          totalCount={tasks.length}
          pendingCount={pendingCount}
          completedCount={completedCount}
          onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
        />

        {/* Polished Task Rows Container */}
        <div className="task-list-section">
          {isLoading ? (
            <div className="loading-state">
              <div className="spinner" />
              <p>Syncing your tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <h3 className="empty-state-title">No tasks found</h3>
              <p className="empty-state-desc">
                {searchQuery
                  ? 'No tasks matched your search query.'
                  : selectedCategoryId !== 'all'
                  ? 'No tasks found in the selected category.'
                  : filter !== 'all'
                  ? `No ${filter} tasks right now.`
                  : viewMode === 'upcoming'
                  ? 'No upcoming tasks scheduled yet. Add one in the quick-add bar above!'
                  : viewMode === 'archive'
                  ? `No records found for ${formattedArchiveDate}.`
                  : 'All clear for today! Type a task above and press Enter to plan.'}
              </p>
            </div>
          ) : (
            <div className="task-rows-stack">
              {filteredTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  categories={categories}
                  viewMode={viewMode}
                  onToggleComplete={handleToggleComplete}
                  onUpdate={handleUpdateTask}
                  onDelete={handleDeleteTask}
                  isUpdating={updatingIds.includes(task.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Centered Modal Dialog for Category Management */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onCreateCategory={handleCreateCategory}
        onDeleteCategory={handleDeleteCategory}
        isSubmitting={isCategorySubmitting}
      />
    </div>
  );
};

export default App;
