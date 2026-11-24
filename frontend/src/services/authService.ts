import type { AuthResponseDto, LoginRequestDto, RegisterRequestDto, UserDto } from '../types/auth';
import { API_BASE_URL } from './apiConfig';

const TOKEN_KEY: string = 'taskmanager_token';
const USER_KEY: string = 'taskmanager_user';

export class AuthError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
  }
}

export const authService = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser(): UserDto | null {
    const raw: string | null = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserDto;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  },

  saveAuth(data: AuthResponseDto): void {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    window.dispatchEvent(new Event('auth-changed'));
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.dispatchEvent(new Event('auth-changed'));
  },

  getAuthHeaders(): Record<string, string> {
    const token: string | null = this.getToken();
    if (!token) return {};
    return {
      Authorization: `Bearer ${token}`,
    };
  },

  async register(dto: RegisterRequestDto): Promise<AuthResponseDto> {
    const response: Response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      let errorMessage: string = `Registration failed (${response.status})`;
      try {
        const errorData = (await response.json()) as { message?: string; title?: string };
        if (errorData?.message) errorMessage = errorData.message;
        else if (errorData?.title) errorMessage = errorData.title;
      } catch {
        // Response body not JSON
      }
      throw new AuthError(errorMessage, response.status);
    }

    const data: AuthResponseDto = (await response.json()) as AuthResponseDto;
    this.saveAuth(data);
    return data;
  },

  async login(dto: LoginRequestDto): Promise<AuthResponseDto> {
    const response: Response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      let errorMessage: string = `Login failed (${response.status})`;
      try {
        const errorData = (await response.json()) as { message?: string; title?: string };
        if (errorData?.message) errorMessage = errorData.message;
        else if (errorData?.title) errorMessage = errorData.title;
      } catch {
        // Response body not JSON
      }
      throw new AuthError(errorMessage, response.status);
    }

    const data: AuthResponseDto = (await response.json()) as AuthResponseDto;
    this.saveAuth(data);
    return data;
  },
};
