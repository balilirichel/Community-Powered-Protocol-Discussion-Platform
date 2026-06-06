<?php

namespace App\Observers;

use App\Models\Thread;

class ThreadObserver
{
    /**
     * Handle the Thread "created" event.
     */
    public function created(Thread $thread): void
    {
        //
        try {
            $thread->searchable();
        } catch (\Throwable $e) {
            // noop
        }
    }

    /**
     * Handle the Thread "updated" event.
     */
    public function updated(Thread $thread): void
    {
        //
        try {
            $thread->searchable();
        } catch (\Throwable $e) {
            // noop
        }
    }

    /**
     * Handle the Thread "deleted" event.
     */
    public function deleted(Thread $thread): void
    {
        //
        try {
            $thread->unsearchable();
        } catch (\Throwable $e) {
            // noop
        }
    }

    /**
     * Handle the Thread "restored" event.
     */
    public function restored(Thread $thread): void
    {
        //
        try {
            $thread->searchable();
        } catch (\Throwable $e) {
            // noop
        }
    }

    /**
     * Handle the Thread "force deleted" event.
     */
    public function forceDeleted(Thread $thread): void
    {
        //
        try {
            $thread->unsearchable();
        } catch (\Throwable $e) {
            // noop
        }
    }
}
