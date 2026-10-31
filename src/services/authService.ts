import { User, LoginCredentials, SignupCredentials } from '../types';
import { apiClient } from './api';

const STORAGE_KEY_USER = 'resume_architect_user';
const STORAGE_KEY_TOKEN = 'resume_architect_token';

interface BackendTokenResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    name: string;
    email: string;
    created_at: string;
  };
}

export const authService = {
  /**
   * Logs in a user via the FastAPI backend and stores the persistent JWT session.
   */
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    try {
      const normalizedEmail = (credentials.email || '').trim().toLowerCase();
      const data = await apiClient<BackendTokenResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: normalizedEmail,
          password: credentials.password,
        }),
      });

      const user: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        createdAt: data.user.created_at,
      };

      localStorage.setItem(STORAGE_KEY_TOKEN, data.access_token);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));

      return { user, token: data.access_token };
    } catch (err: unknown) {
      console.error('Login request failed:', err);
      throw err;
    }
  },

  /**
   * Registers a new user account in SQLite via the FastAPI backend.
   */
  async signup(credentials: SignupCredentials): Promise<{ user: User; token: string }> {
    try {
      const normalizedEmail = (credentials.email || '').trim().toLowerCase();
      const data = await apiClient<BackendTokenResponse>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          name: credentials.name.trim(),
          email: normalizedEmail,
          password: credentials.password,
        }),
      });

      const user: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        createdAt: data.user.created_at,
      };

      localStorage.setItem(STORAGE_KEY_TOKEN, data.access_token);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));

      return { user, token: data.access_token };
    } catch (err: unknown) {
      console.error('Signup request failed:', err);
      throw err;
    }
  },

  /**
   * Clears session from local storage and resets all cached user state.
   */
  async logout(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem('resume_architect_dev_resumes');
    try {
      sessionStorage.clear();
    } catch {
      // Ignore if unavailable
    }
  },

  /**
   * Verifies current session with backend /auth/me or returns cached session.
   */
  async refreshUser(): Promise<User | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const data = await apiClient<{ id: string; name: string; email: string; created_at: string }>('/auth/me');
      const user: User = {
        id: data.id,
        name: data.name,
        email: data.email,
        createdAt: data.created_at,
      };
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      return user;
    } catch {
      // Invalid/expired token
      this.logout();
      return null;
    }
  },

  /**
   * Checks for an existing session.
   */
  getCurrentUser(): User | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USER);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEY_TOKEN);
  },
};
