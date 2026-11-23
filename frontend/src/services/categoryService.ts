import type { CategoryDto, CreateCategoryDto, UpdateCategoryDto } from '../types/category';

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

export const categoryService = {
  async getCategories(): Promise<CategoryDto[]> {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
    return handleResponse<CategoryDto[]>(response);
  },

  async getCategoryById(id: number): Promise<CategoryDto> {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
    return handleResponse<CategoryDto>(response);
  },

  async createCategory(dto: CreateCategoryDto): Promise<CategoryDto> {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(dto),
    });
    return handleResponse<CategoryDto>(response);
  },

  async updateCategory(id: number, dto: UpdateCategoryDto): Promise<CategoryDto> {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(dto),
    });
    return handleResponse<CategoryDto>(response);
  },

  async deleteCategory(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<void>(response);
  },
};
