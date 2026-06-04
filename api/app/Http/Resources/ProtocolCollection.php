<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProtocolResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'title'        => $this->title,
            'content'      => $this->content,
            'tags'         => $this->tags ?? [],
            'rating'       => $this->rating,
            'author'       => [
                'id'   => $this->user->id,
                'name' => $this->user->name,
            ],
            'threads_count' => $this->whenCounted('threads'),
            'reviews_count' => $this->whenCounted('reviews'),
            'created_at'   => $this->created_at->toISOString(),
            'updated_at'   => $this->updated_at->toISOString(),
        ];
    }
}