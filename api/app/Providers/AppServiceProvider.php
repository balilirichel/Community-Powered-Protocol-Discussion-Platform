<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Database\Eloquent\Relations\Relation; 
use Illuminate\Support\Facades\Gate;
use App\Models\Protocol;
use App\Models\Thread;
use App\Policies\ProtocolPolicy;
use App\Policies\ThreadPolicy;
use App\Models\Review;
use App\Policies\ReviewPolicy;
use App\Models\Comment;
use App\Policies\CommentPolicy;


class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
        Relation::morphMap([
            'thread'  => \App\Models\Thread::class,
            'comment' => \App\Models\Comment::class,
        ]);

        Gate::policy(Protocol::class, ProtocolPolicy::class);
        Gate::policy(Thread::class, ThreadPolicy::class);
        Gate::policy(Comment::class, CommentPolicy::class);
        Gate::policy(Review::class, ReviewPolicy::class);
    }
}
