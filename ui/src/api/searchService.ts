import apiClient from './client';
import type { Protocol } from '../types/protocol';
import type { Thread } from '../types/thread';
import type { SearchParams, ReindexRequest, SearchResponse } from '../types/search';

export const searchService = {
  protocols: (params: SearchParams) =>
    apiClient
      .get<SearchResponse<Protocol>>('/search/protocols', { params })
      .then((r) => r.data),

  threads: (params: SearchParams) =>
    apiClient
      .get<SearchResponse<Thread>>('/search/threads', { params })
      .then((r) => r.data),

  reindex: (data: ReindexRequest = {}) =>
    apiClient
      .post<{ message: string }>('/search/reindex', data)
      .then((r) => r.data),
};
