import type { CategoryDto } from './category';

export interface TaskDto {
  id: number;
  title: string;
  description: string | null;
  isCompleted: boolean;
  createdAt: string;
  dueDate: string;
  isDaily: boolean;
  completedAt: string | null;
  categoryId: number | null;
  category?: CategoryDto | null;
}

export interface CreateTaskDto {
  title: string;
  description?: string | null;
  categoryId?: number | null;
  dueDate?: string;
  isDaily?: boolean;
}

export interface UpdateTaskDto {
  title: string;
  description?: string | null;
  isCompleted: boolean;
  categoryId?: number | null;
  dueDate?: string;
  isDaily?: boolean;
}

export type TaskFilter = 'all' | 'pending' | 'completed';
export type ViewMode = 'today' | 'upcoming' | 'archive';
