<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'rating'      => $this->rating,
            'feedback'    => $this->feedback,
            'author'      => [
                'id'   => $this->user->id,
                'name' => $this->user->name,
            ],
            'protocol'    => [
                'id'    => $this->protocol->id,
                'title' => $this->protocol->title,
            ],
            'created_at'  => $this->created_at->toISOString(),
            'updated_at'  => $this->updated_at->toISOString(),
        ];
    }
}