import apiClient from './client';
import type { Protocol } from '../types/protocol';
import type { Thread } from '../types/thread';
import type { SearchParams, ReindexRequest, SearchResponse } from '../types/search';

export const searchService = {
  protocols: (params: SearchParams) =>
    apiClient
      .get<SearchResponse<Protocol>>('/api/search/protocols', { params })
      .then((r) => r.data),

  threads: (params: SearchParams) =>
    apiClient
      .get<SearchResponse<Thread>>('/api/search/threads', { params })
      .then((r) => r.data),

  reindex: (data: ReindexRequest = {}) =>
    apiClient
      .post<{ message: string }>('/api/search/reindex', data)
      .then((r) => r.data),
};
