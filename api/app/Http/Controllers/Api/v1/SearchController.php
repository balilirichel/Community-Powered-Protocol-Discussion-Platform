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
     * Search Protocols — pure Eloquent, no Typesense dependency.
     *
     * Route   : GET /api/v1/search/protocols
     * Auth    : public
     *
     * Query params:
     *   q        — search string; '*' or blank = match-all
     *   filter   — sort/rank mode:
     *                recent   (default) → created_at desc
     *                reviewed           → reviews_count desc
     *                rated              → rating desc
     *                upvoted            → votes_sum_value desc
     *   per_page — results per page (default 15)
     *
     * Previously used Protocol::search() (Laravel Scout / Typesense).
     * Replaced with Eloquent so this endpoint works when Typesense is
     * unavailable — it is the true database-backed fallback for the frontend.
     */
    public function protocols(Request $request): JsonResponse
    {
        $query   = $request->input('q', '*');
        $filter  = $request->input('filter', 'recent');
        $perPage = (int) $request->input('per_page', 15);

        $builder = Protocol::query()
            ->with('user')
            ->withCount('reviews')
            ->withSum('votes', 'value');

        // '*' (Typesense match-all wildcard) and blank both mean: no WHERE filter.
        if ($query !== '*' && $query !== '') {
            $builder->where('title', 'like', '%' . $query . '%');
        }

        // votes_sum_value is the alias produced by withSum('votes', 'value').
        match ($filter) {
            'reviewed' => $builder->orderByDesc('reviews_count'),
            'rated'    => $builder->orderByDesc('rating'),
            'upvoted'  => $builder->orderByDesc('votes_sum_value'),
            default    => $builder->orderByDesc('created_at'),   // 'recent'
        };

        $results = $builder->paginate($perPage);

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
     * Search Threads — pure Eloquent, no Typesense dependency.
     *
     * Route   : GET /api/v1/search/threads
     * Auth    : public
     *
     * Query params:
     *   q        — search string; '*' or blank = match-all
     *   filter   — sort/rank mode:
     *                recent   (default) → created_at desc
     *                reviewed           → comments_count desc
     *                rated              → no rating field; falls back to votes
     *                upvoted            → votes_sum_value desc
     *   per_page — results per page (default 15)
     *
     * Previously used Thread::search() (Laravel Scout / Typesense).
     * Replaced with Eloquent so this endpoint works when Typesense is
     * unavailable — it is the true database-backed fallback for the frontend.
     */
    public function threads(Request $request): JsonResponse
    {
        $query   = $request->input('q', '*');
        $filter  = $request->input('filter', 'recent');
        $perPage = (int) $request->input('per_page', 15);

        $note = null;

        $builder = Thread::query()
            ->with(['user', 'protocol'])
            ->withCount('comments')
            ->withSum('votes', 'value');

        // LIKE on title OR body when a real search string is given.
        if ($query !== '*' && $query !== '') {
            $builder->where(function ($q) use ($query) {
                $q->where('title', 'like', '%' . $query . '%')
                  ->orWhere('body',  'like', '%' . $query . '%');
            });
        }

        match ($filter) {
            'reviewed' => $builder->orderByDesc('comments_count'),
            'rated'    => (function () use ($builder, &$note) {
                $note = "'rated' is not applicable to threads (no rating field); sorting by votes instead.";
                $builder->orderByDesc('votes_sum_value');
            })(),
            'upvoted'  => $builder->orderByDesc('votes_sum_value'),
            default    => $builder->orderByDesc('created_at'),   // 'recent'
        };

        $results = $builder->paginate($perPage);

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
     * Trigger a full reindex of all searchable models into Typesense.
     *
     * Route : POST /api/v1/search/reindex
     * Auth  : auth:sanctum (required)
     *
     * Optional body param:
     *   model — 'protocol' | 'thread' (omit to reindex both)
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
