/**
 * API client prepared for Python FastAPI backend integration.
 * In production/staging, requests point to `VITE_API_URL` (e.g., http://localhost:8000/api/v1).
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Standard HTTP client that automatically attaches Bearer JWT tokens
 * when user is authenticated with the FastAPI backend.
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('resume_architect_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorBody: any;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = await response.text();
      }

      let message = `API Request Failed: ${response.statusText}`;
      if (typeof errorBody === 'object' && errorBody !== null) {
        if (typeof errorBody.detail === 'string') {
          message = errorBody.detail;
        } else if (Array.isArray(errorBody.detail) && errorBody.detail.length > 0) {
          message = errorBody.detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ');
        } else if (typeof errorBody.message === 'string') {
          message = errorBody.message;
        }
      } else if (typeof errorBody === 'string' && errorBody.trim()) {
        message = errorBody;
      }

      throw new ApiError(message, response.status, errorBody);
    }

    return (await response.json()) as T;
  } catch (err: unknown) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(err instanceof Error ? err.message : 'Unknown network failure', 500);
  }
}
