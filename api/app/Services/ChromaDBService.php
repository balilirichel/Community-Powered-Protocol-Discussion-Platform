<?php

namespace App\Services;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChromaDBService
{
    private string $baseUrl;

    private int $timeout;

    private ?string $apiKey;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('chromadb.base_url', 'http://localhost:8000'), '/');
        $this->timeout = config('chromadb.timeout', 5);
        $this->apiKey = config('chromadb.api_key');
    }

    /**
     * Get or create a ChromaDB collection. Returns the collection ID, or null on failure.
     */
    public function getOrCreateCollection(string $name): ?string
    {
        try {
            $response = $this->request('POST', '/api/v1/collections', [
                'name' => $name,
                'get_or_create' => true,
            ]);

            if ($response->successful()) {
                return $response->json('id');
            }

            Log::error('ChromaDB get_or_create_collection failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('ChromaDB get_or_create_collection exception', [
                'message' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Add documents with pre-computed embeddings to a collection.
     *
     * @param  array<string>  $ids
     * @param  array<array<float>>  $embeddings
     * @param  array<string>  $documents
     * @param  array<array<string, mixed>>  $metadatas
     */
    public function addDocuments(
        string $collectionId,
        array $ids,
        array $embeddings,
        array $documents,
        array $metadatas,
    ): bool {
        try {
            $response = $this->request('POST', "/api/v1/collections/{$collectionId}/add", [
                'ids' => $ids,
                'embeddings' => $embeddings,
                'documents' => $documents,
                'metadatas' => $metadatas,
            ]);

            if ($response->successful()) {
                return true;
            }

            Log::error('ChromaDB addDocuments failed', [
                'collection_id' => $collectionId,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return false;
        } catch (\Exception $e) {
            Log::error('ChromaDB addDocuments exception', [
                'collection_id' => $collectionId,
                'message' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Query a collection with a pre-computed embedding vector.
     *
     * @return array{documents: array, metadatas: array, distances: array}|null
     */
    public function queryCollection(string $collectionId, array $queryEmbedding, int $nResults): ?array
    {
        try {
            $response = $this->request('POST', "/api/v1/collections/{$collectionId}/query", [
                'query_embeddings' => [$queryEmbedding],
                'n_results' => $nResults,
                'include' => ['documents', 'metadatas', 'distances'],
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('ChromaDB queryCollection failed', [
                'collection_id' => $collectionId,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('ChromaDB queryCollection exception', [
                'collection_id' => $collectionId,
                'message' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Delete all documents from a collection that match a metadata filter.
     * Useful for re-ingesting a specific PDF file.
     */
    public function deleteByMetadata(string $collectionId, array $where): bool
    {
        try {
            $response = $this->request('POST', "/api/v1/collections/{$collectionId}/delete", [
                'where' => $where,
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('ChromaDB deleteByMetadata exception', [
                'collection_id' => $collectionId,
                'message' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Build and send an HTTP request to ChromaDB.
     */
    private function request(string $method, string $endpoint, array $data = []): Response
    {
        $headers = ['Content-Type' => 'application/json'];

        if ($this->apiKey) {
            $headers['X-Chroma-Token'] = $this->apiKey;
        }

        return Http::withHeaders($headers)
            ->timeout($this->timeout)
            ->$method($this->baseUrl.$endpoint, $data);
    }
}
