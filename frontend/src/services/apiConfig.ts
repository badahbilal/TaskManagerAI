/**
 * API configuration for TaskManager frontend.
 * Reads from VITE_API_URL environment variable, defaulting to the live Railway backend.
 * Ensures the URL is properly normalized with the '/api' prefix.
 */
const DEFAULT_API_BASE_URL: string = 'https://taskmanagerai-production.up.railway.app/api';

function getApiBaseUrl(): string {
  const envUrl: string | undefined = import.meta.env.VITE_API_URL as string | undefined;
  if (!envUrl || !envUrl.trim()) {
    return DEFAULT_API_BASE_URL;
  }

  const trimmedUrl: string = envUrl.trim().replace(/\/+$/, '');
  return trimmedUrl.endsWith('/api') ? trimmedUrl : `${trimmedUrl}/api`;
}

export const API_BASE_URL: string = getApiBaseUrl();
