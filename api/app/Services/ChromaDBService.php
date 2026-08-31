<?php

namespace App\Services;

use HelgeSverre\Chromadb\Chromadb;
use Illuminate\Support\Facades\Log;

class ChromaDBService
{
    private Chromadb $client;

    public function __construct(Chromadb $client)
    {
        $this->client = $client;
    }

    /**
     * Get or create a ChromaDB collection. Returns the collection ID, or null on failure.
     */
    public function getOrCreateCollection(string $name): ?string
    {
        try {
            // Verified against vendor/helgesverre/chromadb/src/Resources/Collections.php:55-62
            $response = $this->client->collections()->create(
                name: $name,
                getOrCreate: true,
            );

            if ($response->successful()) {
                return $response->json('id');
            }

            Log::error('ChromaDB getOrCreateCollection failed', [
                'name' => $name,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('ChromaDB getOrCreateCollection exception', [
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
            // Verified against vendor/helgesverre/chromadb/src/Resources/Items.php:31-38
            $response = $this->client->items()->add(
                collectionId: $collectionId,
                ids: $ids,
                embeddings: $embeddings,
                documents: $documents,
                metadatas: $metadatas,
            );

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
            // Verified against vendor/helgesverre/chromadb/src/Resources/Items.php:205-215
            $response = $this->client->items()->query(
                collectionId: $collectionId,
                queryEmbeddings: [$queryEmbedding],
                nResults: $nResults,
                include: ['documents', 'metadatas', 'distances'],
            );

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
            // Verified against vendor/helgesverre/chromadb/src/Resources/Items.php:156-161
            $response = $this->client->items()->delete(
                collectionId: $collectionId,
                where: $where,
            );

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('ChromaDB deleteByMetadata exception', [
                'collection_id' => $collectionId,
                'message' => $e->getMessage(),
            ]);

            return false;
        }
    }
}
