<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreKnowledgeBaseEntryRequest;
use App\Http\Requests\UpdateKnowledgeBaseEntryRequest;
use App\Models\KnowledgeBaseEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class KnowledgeBaseController extends Controller
{
    /**
     * GET /api/v1/admin/knowledge-base
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = KnowledgeBaseEntry::query();

        if ($request->has('published')) {
            $query->where('is_published', $request->boolean('published'));
        }

        $entries = $query->orderByDesc('updated_at')->paginate(15);

        return response()->json($entries);
    }

    /**
     * POST /api/v1/admin/knowledge-base
     */
    public function store(StoreKnowledgeBaseEntryRequest $request): JsonResponse
    {
        $entry = KnowledgeBaseEntry::create($request->validated());

        return response()->json($entry, 201);
    }

    /**
     * GET /api/v1/admin/knowledge-base/{id}
     */
    public function show(string $id): JsonResponse
    {
        $entry = KnowledgeBaseEntry::findOrFail($id);

        return response()->json($entry);
    }

    /**
     * PUT/PATCH /api/v1/admin/knowledge-base/{id}
     */
    public function update(UpdateKnowledgeBaseEntryRequest $request, string $id): JsonResponse
    {
        $entry = KnowledgeBaseEntry::findOrFail($id);

        $entry->update($request->validated());

        return response()->json($entry);
    }

    /**
     * DELETE /api/v1/admin/knowledge-base/{id}
     */
    public function destroy(string $id): JsonResponse
    {
        $entry = KnowledgeBaseEntry::findOrFail($id);

        $entry->delete();

        return response()->json([
            'message' => 'Knowledge base entry deleted successfully.',
        ]);
    }
}
