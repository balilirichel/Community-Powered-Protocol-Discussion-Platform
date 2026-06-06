export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  protocols_count?: number;
  threads_count?: number;
  reviews_count?: number;
  created_at: string;
  updated_at: string;
  bio?: string | null;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  data: {
    user: User;
    token: string;
  };
}
