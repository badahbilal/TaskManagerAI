import type { CategoryDto } from './category';

export interface TaskDto {
  id: number;
  title: string;
  description: string | null;
  isCompleted: boolean;
  createdAt: string;
  categoryId: number | null;
  category?: CategoryDto | null;
}

export interface CreateTaskDto {
  title: string;
  description?: string | null;
  categoryId?: number | null;
}

export interface UpdateTaskDto {
  title: string;
  description?: string | null;
  isCompleted: boolean;
  categoryId?: number | null;
}

export type TaskFilter = 'all' | 'pending' | 'completed';
