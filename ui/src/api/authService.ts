import apiClient from './client';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth';
import type { User } from '../types/auth';

export const authService = {
  register: (data: RegisterRequest) =>
    apiClient.post<AuthResponse>('/register', data).then((r) => r.data),

  login: (data: LoginRequest) =>
    apiClient.post<AuthResponse>('/login', data).then((r) => r.data),

  logout: () =>
    apiClient.post<void>('/logout').then((r) => r.data),

  getUser: () =>
    apiClient.get<User>('/user').then((r) => r.data),
};

