export interface TaskDto {
  id: number;
  title: string;
  description: string | null;
  isCompleted: boolean;
  createdAt: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string | null;
}

export interface UpdateTaskDto {
  title: string;
  description?: string | null;
  isCompleted: boolean;
}

export type TaskFilter = 'all' | 'pending' | 'completed';
