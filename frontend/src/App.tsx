import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { TaskFilters } from './components/TaskFilters';
import { TaskForm } from './components/TaskForm';
import { TaskItem } from './components/TaskItem';
import { TaskStats } from './components/TaskStats';
import { taskService } from './services/taskService';
import type { CreateTaskDto, TaskDto, TaskFilter, UpdateTaskDto } from './types/task';
import './App.css';

export const App: React.FC = () => {
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [updatingIds, setUpdatingIds] = useState<number[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadTasks = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const fetchedTasks = await taskService.getTasks();
      setTasks(fetchedTasks);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to connect to backend API';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleCreateTask = async (title: string, description: string): Promise<void> => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const createDto: CreateTaskDto = {
        title,
        description: description ? description : null,
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

  const handleToggleComplete = async (task: TaskDto): Promise<void> => {
    const newCompletionStatus = !task.isCompleted;
    setUpdatingIds((prev) => [...prev, task.id]);
    setErrorMessage(null);

    try {
      const updateDto: UpdateTaskDto = {
        title: task.title,
        description: task.description,
        isCompleted: newCompletionStatus,
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
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDesc = task.description?.toLowerCase().includes(query) ?? false;
        return matchesTitle || matchesDesc;
      });
  }, [tasks, filter, searchQuery]);

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
            <p className="header-subtitle">Clean Architecture .NET 10 & React</p>
          </div>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-refresh"
          onClick={loadTasks}
          disabled={isLoading}
          title="Refresh tasks"
        >
          <svg className={isLoading ? 'spinning' : ''} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          Refresh
        </button>
      </header>

      {errorMessage && (
        <div className="alert-banner">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div className="alert-content">
            <span className="alert-title">API Notice:</span> {errorMessage}
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
            <TaskForm onSubmit={handleCreateTask} isSubmitting={isSubmitting} />
          </div>

          <div className="dashboard-right">
            <TaskFilters
              currentFilter={filter}
              onFilterChange={setFilter}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              totalCount={tasks.length}
              pendingCount={pendingCount}
              completedCount={completedCount}
            />

            <div className="task-list-section">
              {isLoading ? (
                <div className="loading-state">
                  <div className="spinner" />
                  <p>Loading tasks from .NET 10 API...</p>
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
                      : filter !== 'all'
                      ? `No ${filter} tasks right now.`
                      : 'You have no tasks yet. Create your first task using the form on the left!'}
                  </p>
                </div>
              ) : (
                <div className="task-items-container">
                  {filteredTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggleComplete={handleToggleComplete}
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
