<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ThreadResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'title'          => $this->title,
            'body'           => $this->body,
            'protocol'       => [
                'id'    => $this->protocol->id,
                'title' => $this->protocol->title,
            ],
            'author'         => [
                'id'   => $this->user->id,
                'name' => $this->user->name,
            ],
            'comments_count' => $this->whenCounted('comments'),
            'upvotes_count'  => $this->whenCounted('upvotes_count'),
            'downvotes_count'=> $this->whenCounted('downvotes_count'),
            'created_at'     => $this->created_at->toISOString(),
            'updated_at'     => $this->updated_at->toISOString(),
        ];
    }
}