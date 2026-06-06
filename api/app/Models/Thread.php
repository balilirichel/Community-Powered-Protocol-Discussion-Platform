<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Laravel\Scout\Searchable;

class Thread extends Model
{
    use HasFactory, Searchable;

    protected $fillable = [
        'user_id',
        'protocol_id',
        'title',
        'body',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function protocol(): BelongsTo
    {
        return $this->belongsTo(Protocol::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
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
        return 'threads';
    }

    /**
     * Fields indexed into Typesense.
     *
     * votes          = SUM of votes.value (1 upvote / -1 downvote)
     * comments_count = used for 'Most Reviewed' filter (threads have comments, not reviews)
     *
     * NOTE: 'tags' is intentionally excluded from Thread.
     *       The threads migration does NOT contain a tags column.
     *       Adding it would cause a schema mismatch error.
     */
    public function toSearchableArray(): array
    {
        return [
            'id'             => (string) $this->id,
            'title'          => (string) $this->title,
            'body'           => (string) $this->body,
            'user_id'        => (string) $this->user_id,
            'protocol_id'    => (string) $this->protocol_id,
            'votes'          => (int) ($this->votes_sum_value ?? $this->votes()->sum('value')),
            'comments_count' => (int) ($this->comments_count ?? $this->comments()->count()),
            'created_at'     => $this->created_at ? $this->created_at->timestamp : 0,
        ];
    }

    /**
     * Eager-load aggregates when bulk-importing via `scout:import` or
     * the reindex command so we avoid N+1 queries.
     */
    protected function makeAllSearchableUsing(Builder $query): Builder
    {
        return $query
            ->withSum('votes', 'value')
            ->withCount('comments');
    }
}