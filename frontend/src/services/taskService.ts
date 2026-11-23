import type { CreateTaskDto, TaskDto, UpdateTaskDto } from '../types/task';

const API_BASE_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:5238/api';

class ApiError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    try {
      const errorData = await response.json();
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
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<TaskDto[]>(response);
  },

  async getTaskById(id: number): Promise<TaskDto> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<TaskDto>(response);
  },

  async createTask(dto: CreateTaskDto): Promise<TaskDto> {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(dto),
    });
    return handleResponse<TaskDto>(response);
  },

  async updateTask(id: number, dto: UpdateTaskDto): Promise<TaskDto> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(dto),
    });
    return handleResponse<TaskDto>(response);
  },

  async deleteTask(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<void>(response);
  },
};
