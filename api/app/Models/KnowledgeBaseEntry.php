<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KnowledgeBaseEntry extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'title',
        'content',
        'tags',
        'is_published',
    ];

    protected function casts(): array
    {
        return [
            'tags' => 'array',
            'is_published' => 'boolean',
        ];
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('is_published', true);
    }

    public function scopeSearchRelevant(Builder $query, string $search): Builder
    {
        return $query->whereFullText(['title', 'content'], $search, [
            'mode' => 'BOOLEAN',
        ]);
    }
}
