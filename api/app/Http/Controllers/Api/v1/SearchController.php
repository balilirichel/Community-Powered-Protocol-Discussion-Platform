<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Protocol;
use App\Models\Thread;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    /**
     * Search Protocols via Typesense.
     *
     * Route   : GET /api/search/protocols
     * Auth    : auth:sanctum (required)
     *
     * Query params:
     *   q      — search string; use '*' or omit for match-all (search-as-you-type)
     *   filter — ranking/sort mode:
     *              recent   (default) → sort by created_at desc
     *              reviewed           → sort by reviews_count desc
     *              rated              → sort by rating desc
     *              upvoted            → sort by votes desc
     *   per_page — results per page (default 15)
     */
    public function protocols(Request $request): JsonResponse
    {
        $query   = $request->input('q', '*');
        $filter  = $request->input('filter', 'recent');
        $perPage = (int) $request->input('per_page', 15);

        $sortBy = match ($filter) {
            'reviewed' => 'reviews_count:desc',
            'rated'    => 'rating:desc',
            'upvoted'  => 'votes:desc',
            default    => 'created_at:desc',   // 'recent'
        };

        $results = Protocol::search($query)
            ->options(['sort_by' => $sortBy])
            ->paginate($perPage);

        return response()->json([
            'data'  => $results->items(),
            'meta'  => [
                'current_page' => $results->currentPage(),
                'per_page'     => $results->perPage(),
                'total'        => $results->total(),
                'last_page'    => $results->lastPage(),
            ],
            'filter' => $filter,
            'query'  => $query,
        ]);
    }

    /**
     * Search Threads via Typesense.
     *
     * Route   : GET /api/search/threads
     * Auth    : auth:sanctum (required)
     *
     * Query params:
     *   q      — search string; use '*' or omit for match-all (search-as-you-type)
     *   filter — ranking/sort mode:
     *              recent   (default) → sort by created_at desc
     *              reviewed           → sort by comments_count desc
     *                                   (threads have comments, not reviews)
     *              rated              → threads have no rating field;
     *                                   falls back to votes:desc with a note
     *              upvoted            → sort by votes desc
     *   per_page — results per page (default 15)
     */
    public function threads(Request $request): JsonResponse
    {
        $query   = $request->input('q', '*');
        $filter  = $request->input('filter', 'recent');
        $perPage = (int) $request->input('per_page', 15);

        $note = null;

        $sortBy = match ($filter) {
            'reviewed' => 'comments_count:desc',
            'rated'    => (function () use (&$note) {
                $note = "'rated' is not applicable to threads (no rating field); sorting by votes instead.";
                return 'votes:desc';
            })(),
            'upvoted'  => 'votes:desc',
            default    => 'created_at:desc',   // 'recent'
        };

        $results = Thread::search($query)
            ->options(['sort_by' => $sortBy])
            ->paginate($perPage);

        $response = [
            'data'  => $results->items(),
            'meta'  => [
                'current_page' => $results->currentPage(),
                'per_page'     => $results->perPage(),
                'total'        => $results->total(),
                'last_page'    => $results->lastPage(),
            ],
            'filter' => $filter,
            'query'  => $query,
        ];

        if ($note) {
            $response['note'] = $note;
        }

        return response()->json($response);
    }

    /**
     * Trigger a full reindex of all searchable models.
     *
     * Route : POST /api/search/reindex
     * Auth  : auth:sanctum (required)
     *
     * Optional body param:
     *   model — 'protocol' | 'thread' (omit to reindex both)
     *
     * Runs synchronously. For large datasets, consider dispatching a
     * queued job and returning a 202 Accepted instead.
     */
    public function reindex(Request $request): JsonResponse
    {
        $model = strtolower((string) $request->input('model', 'all'));

        $map = [
            'protocol' => Protocol::class,
            'thread'   => Thread::class,
        ];

        $targets = ($model === 'all' || ! isset($map[$model]))
            ? array_values($map)
            : [$map[$model]];

        $results = [];

        foreach ($targets as $modelClass) {
            $shortName = class_basename($modelClass);

            // Flush existing Typesense collection data, then reimport
            $modelClass::removeAllFromSearch();
            $modelClass::makeAllSearchable();

            $results[$shortName] = [
                'indexed' => $modelClass::count(),
                'status'  => 'ok',
            ];
        }

        return response()->json([
            'message' => 'Reindex complete.',
            'results' => $results,
        ]);
    }
}
