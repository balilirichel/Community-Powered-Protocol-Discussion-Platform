import apiClient from './client';
import type { Review, CreateReviewRequest, UpdateReviewRequest } from '../types/review';
import type { PaginatedResponse } from '../types/protocol';
import type { ApiResponse } from '../types/api';

export const reviewService = {
  listByProtocol: (protocol: number | string) =>
    apiClient
      .get<PaginatedResponse<Review>>(`/protocols/${protocol}/reviews`)
      .then((r) => r.data),

  get: (protocol: number | string, review: number | string) =>
    apiClient
      .get<ApiResponse<Review>>(`/protocols/${protocol}/reviews/${review}`)
      .then((r) => r.data.data),

  create: (protocol: number | string, data: CreateReviewRequest) =>
    apiClient
      .post<ApiResponse<Review>>(`/protocols/${protocol}/reviews`, data)
      .then((r) => r.data.data),

  update: (protocol: number | string, review: number | string, data: UpdateReviewRequest) =>
    apiClient
      .put<ApiResponse<Review>>(`/protocols/${protocol}/reviews/${review}`, data)
      .then((r) => r.data.data),

  patch: (protocol: number | string, review: number | string, data: UpdateReviewRequest) =>
    apiClient
      .patch<ApiResponse<Review>>(`/protocols/${protocol}/reviews/${review}`, data)
      .then((r) => r.data.data),

  delete: (protocol: number | string, review: number | string) =>
    apiClient
      .delete<void>(`/protocols/${protocol}/reviews/${review}`)
      .then((r) => r.data),
};
