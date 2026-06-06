import apiClient from './client';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth';
import type { User } from '../types/auth';

export const authService = {
  register: (data: RegisterRequest) =>
    apiClient.post<AuthResponse>('/api/register', data).then((r) => r.data),

  login: (data: LoginRequest) =>
    apiClient.post<AuthResponse>('/api/login', data).then((r) => r.data),

  logout: () =>
    apiClient.post<void>('/api/logout').then((r) => r.data),

  getUser: () =>
    apiClient.get<{ data: User }>('/api/user').then((r) => r.data.data),
};
