<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VoteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'value'         => $this->value,
            'voter'         => [
                'id'   => $this->user->id,
                'name' => $this->user->name,
            ],
            'voteable_type' => $this->voteable_type,
            'voteable_id'   => $this->voteable_id,
            'created_at'    => $this->created_at->toISOString(),
            'updated_at'    => $this->updated_at->toISOString(),
        ];
    }
}