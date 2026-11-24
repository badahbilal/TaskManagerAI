import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthView } from './components/AuthView';
import { CategoryManager } from './components/CategoryManager';
import { TaskFilters } from './components/TaskFilters';
import { TaskForm } from './components/TaskForm';
import { TaskItem } from './components/TaskItem';
import { TaskStats } from './components/TaskStats';
import { authService } from './services/authService';
import { categoryService } from './services/categoryService';
import { taskService } from './services/taskService';
import type { UserDto } from './types/auth';
import type { CategoryDto, CreateCategoryDto } from './types/category';
import type { CreateTaskDto, TaskDto, TaskFilter, UpdateTaskDto } from './types/task';
import './App.css';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserDto | null>(() => authService.getUser());
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCategorySubmitting, setIsCategorySubmitting] = useState<boolean>(false);
  const [updatingIds, setUpdatingIds] = useState<number[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

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
      const [fetchedTasks, fetchedCategories] = await Promise.all([
        taskService.getTasks(),
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
  }, []);

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
    categoryId: number | null
  ): Promise<void> => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const createDto: CreateTaskDto = {
        title,
        description: description ? description : null,
        categoryId: categoryId,
      };
      const createdTask = await taskService.createTask(createDto);
      setTasks((prev) => [createdTask, ...prev]);
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
    const newCompletionStatus = !task.isCompleted;
    setUpdatingIds((prev) => [...prev, task.id]);
    setErrorMessage(null);

    try {
      const updateDto: UpdateTaskDto = {
        title: task.title,
        description: task.description,
        isCompleted: newCompletionStatus,
        categoryId: task.categoryId,
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

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-brand">
          <div className="brand-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
          <div>
            <h1 className="header-title">TaskManager AI</h1>
            <p className="header-subtitle">Isolated Workspace (.NET 10 & React)</p>
          </div>
        </div>

        <div className="header-actions">
          <div className="user-profile-badge" title={currentUser.email}>
            <span className="user-avatar">{userInitials}</span>
            <span className="user-name">{currentUser.fullName}</span>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-refresh"
            onClick={loadData}
            disabled={isLoading}
            title="Refresh tasks and categories"
          >
            <svg className={isLoading ? 'spinning' : ''} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Refresh
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-logout"
            onClick={handleLogout}
            title="Sign out of your account"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </header>

      {errorMessage && (
        <div className="alert-banner">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div className="alert-content">
            <span className="alert-title">Notice:</span> {errorMessage}
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

      <main className="app-main">
        <section className="dashboard-grid">
          <div className="dashboard-left">
            <TaskStats
              total={tasks.length}
              completed={completedCount}
              pending={pendingCount}
            />
            <CategoryManager
              categories={categories}
              onCreateCategory={handleCreateCategory}
              onDeleteCategory={handleDeleteCategory}
              isSubmitting={isCategorySubmitting}
            />
            <TaskForm
              categories={categories}
              onSubmit={handleCreateTask}
              isSubmitting={isSubmitting}
            />
          </div>

          <div className="dashboard-right">
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
            />

            <div className="task-list-section">
              {isLoading ? (
                <div className="loading-state">
                  <div className="spinner" />
                  <p>Loading your tasks...</p>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  </div>
                  <h3>No tasks found</h3>
                  <p>
                    {searchQuery
                      ? 'No tasks matched your search query.'
                      : selectedCategoryId !== 'all'
                      ? 'No tasks found in the selected category.'
                      : filter !== 'all'
                      ? `No ${filter} tasks right now.`
                      : 'You have no tasks yet in your isolated workspace. Create one on the left!'}
                  </p>
                </div>
              ) : (
                <div className="task-items-container">
                  {filteredTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      categories={categories}
                      onToggleComplete={handleToggleComplete}
                      onUpdate={handleUpdateTask}
                      onDelete={handleDeleteTask}
                      isUpdating={updatingIds.includes(task.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
