import apiClient from './client';
import type { Comment, CreateCommentRequest, UpdateCommentRequest, VoteRequest } from '../types/comment';
import type { PaginatedResponse } from '../types/protocol';
import type { ApiResponse } from '../types/api';

export const commentService = {
  listByThread: (thread: number | string) =>
    apiClient
      .get<PaginatedResponse<Comment>>(`/api/threads/${thread}/comments`)
      .then((r) => r.data),

  get: (thread: number | string, comment: number | string) =>
    apiClient
      .get<ApiResponse<Comment>>(`/api/threads/${thread}/comments/${comment}`)
      .then((r) => r.data.data),

  create: (thread: number | string, data: CreateCommentRequest) =>
    apiClient
      .post<ApiResponse<Comment>>(`/api/threads/${thread}/comments`, data)
      .then((r) => r.data.data),

  update: (thread: number | string, comment: number | string, data: UpdateCommentRequest) =>
    apiClient
      .put<ApiResponse<Comment>>(`/api/threads/${thread}/comments/${comment}`, data)
      .then((r) => r.data.data),

  patch: (thread: number | string, comment: number | string, data: UpdateCommentRequest) =>
    apiClient
      .patch<ApiResponse<Comment>>(`/api/threads/${thread}/comments/${comment}`, data)
      .then((r) => r.data.data),

  delete: (thread: number | string, comment: number | string) =>
    apiClient
      .delete<void>(`/api/threads/${thread}/comments/${comment}`)
      .then((r) => r.data),

  upvote: (comment: number | string, data: VoteRequest) =>
    apiClient.post<void>(`/api/comments/${comment}/vote`, data).then((r) => r.data),

  removeVote: (comment: number | string) =>
    apiClient.delete<void>(`/api/comments/${comment}/vote`).then((r) => r.data),
};
