<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Laravel\Scout\Searchable;

class Protocol extends Model
{
    use HasFactory, Searchable;

    protected $fillable = [
        'user_id',
        'title',
        'content',
        'tags',
        'rating',
    ];

    protected function casts(): array
    {
        return [
            'tags'   => 'array',
            'rating' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function threads(): HasMany
    {
        return $this->hasMany(Thread::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function votes(): MorphMany
    {
        return $this->morphMany(Vote::class, 'voteable');
    }

    // -------------------------------------------------------------------------
    // Scout / Typesense
    // -------------------------------------------------------------------------

    /**
     * The Typesense collection (index) name for this model.
     */
    public function searchableAs(): string
    {
        return 'protocols';
    }

    /**
     * Fields indexed into Typesense.
     *
     * votes  = SUM of votes.value (1 upvote / -1 downvote)
     * rating = stored decimal on protocols table
     * tags   = JSON array column — confirmed present in migration
     */
    public function toSearchableArray(): array
    {
        return [
            'id'            => (string) $this->id,
            'title'         => (string) $this->title,
            'content'       => (string) ($this->content ?? ''),
            'user_id'       => (string) $this->user_id,
            'user_name'     => (string) ($this->user->name ?? ''), 
            'tags'          => $this->tags ?? [],
            'votes'         => (int) ($this->votes_sum_value ?? $this->votes()->sum('value')),
            'rating'        => (float) $this->rating,
            'reviews_count' => (int) ($this->reviews_count ?? $this->reviews()->count()),
            'created_at'    => $this->created_at ? $this->created_at->timestamp : 0,
        ];
    }

    /**
     * Eager-load aggregates when bulk-importing via `scout:import` or
     * the reindex command so we avoid N+1 queries.
     */
    protected function makeAllSearchableUsing(Builder $query): Builder
    {
        return $query
            ->with('user') 
            ->withSum('votes', 'value')
            ->withCount('reviews');
    }

    public function recalculateRating(): void
    {
        $avg = $this->reviews()->avg('rating') ?? 0;
        $this->updateQuietly(['rating' => round($avg, 2)]);
    }
}