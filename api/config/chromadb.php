<?php

return [

    /*
    |--------------------------------------------------------------------------
    | ChromaDB Connection
    |--------------------------------------------------------------------------
    |
    | Host and port for the ChromaDB HTTP server. Set these in your .env
    | file. Works with local Docker, a remote server, or Chroma Cloud.
    |
    */

    'base_url' => env('CHROMADB_BASE_URL', 'http://localhost:8000'),

    'timeout' => (int) env('CHROMADB_TIMEOUT', 5),

    'api_key' => env('CHROMADB_API_KEY'),

    /*
    |--------------------------------------------------------------------------
    | Collection
    |--------------------------------------------------------------------------
    |
    | The ChromaDB collection used to store PDF document chunks.
    |
    */

    'collection' => env('CHROMADB_COLLECTION', 'pdf_documents'),

    /*
    |--------------------------------------------------------------------------
    | Retrieval
    |--------------------------------------------------------------------------
    |
    | How many PDF chunks to retrieve per query. This is additive to the
    | existing knowledge-base entry retrieval — both are sent to Gemini.
    |
    */

    'top_k' => (int) env('CHROMADB_TOP_K', 5),

    /*
    |--------------------------------------------------------------------------
    | Chunking
    |--------------------------------------------------------------------------
    |
    | Controls how PDF text is split before embedding. Tune these based on
    | your PDF content: technical docs may benefit from larger chunks,
    | conversational content from smaller ones.
    |
    */

    'chunk_size' => (int) env('CHROMADB_CHUNK_SIZE', 500),

    'chunk_overlap' => (int) env('CHROMADB_CHUNK_OVERLAP', 50),

];
