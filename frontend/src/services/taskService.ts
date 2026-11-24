import type { CreateTaskDto, TaskDto, UpdateTaskDto } from '../types/task';
import { API_BASE_URL } from './apiConfig';
import { authService } from './authService';

export class ApiError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    authService.logout();
    throw new ApiError('Session expired. Please log in again.', 401);
  }

  if (!response.ok) {
    let errorMessage: string = `Request failed with status ${response.status}`;
    try {
      const errorData = (await response.json()) as { title?: string; message?: string };
      if (errorData && typeof errorData.title === 'string') {
        errorMessage = errorData.title;
      } else if (errorData && typeof errorData.message === 'string') {
        errorMessage = errorData.message;
      }
    } catch {
      // Body is not JSON
    }
    throw new ApiError(errorMessage, response.status);
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return (await response.json()) as T;
}

export const taskService = {
  async getTasks(): Promise<TaskDto[]> {
    const response: Response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...authService.getAuthHeaders(),
      },
    });
    return handleResponse<TaskDto[]>(response);
  },

  async getTaskById(id: number): Promise<TaskDto> {
    const response: Response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...authService.getAuthHeaders(),
      },
    });
    return handleResponse<TaskDto>(response);
  },

  async createTask(dto: CreateTaskDto): Promise<TaskDto> {
    const response: Response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...authService.getAuthHeaders(),
      },
      body: JSON.stringify(dto),
    });
    return handleResponse<TaskDto>(response);
  },

  async updateTask(id: number, dto: UpdateTaskDto): Promise<TaskDto> {
    const response: Response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...authService.getAuthHeaders(),
      },
      body: JSON.stringify(dto),
    });
    return handleResponse<TaskDto>(response);
  },

  async deleteTask(id: number): Promise<void> {
    const response: Response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: {
        ...authService.getAuthHeaders(),
      },
    });
    return handleResponse<void>(response);
  },
};
