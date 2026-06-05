<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'body'            => $this->body,
            'parent_id'       => $this->parent_id,
            'author'          => [
                'id'   => $this->user->id,
                'name' => $this->user->name,
            ],
            'thread_id'       => $this->thread_id,
            'upvotes_count'   => $this->whenCounted('upvotes_count'),
            'downvotes_count' => $this->whenCounted('downvotes_count'),
            'replies'         => CommentResource::collection(
                                    $this->whenLoaded('replies')
                                ),
            'created_at'      => $this->created_at->toISOString(),
            'updated_at'      => $this->updated_at->toISOString(),
        ];
    }
}