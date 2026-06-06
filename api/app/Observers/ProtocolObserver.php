<?php

namespace App\Observers;

use App\Models\Protocol;

class ProtocolObserver
{
    /**
     * Handle the Protocol "created" event.
     */
    public function created(Protocol $protocol): void
    {
        try {
            $protocol->searchable();
        } catch (\Throwable $e) {
            // Keep observer isolated: do not throw on indexing failure.
        }
    }

    /**
     * Handle the Protocol "updated" event.
     */
    public function updated(Protocol $protocol): void
    {
        try {
            $protocol->searchable();
        } catch (\Throwable $e) {
            // noop
        }
    }

    /**
     * Handle the Protocol "deleted" event.
     */
    public function deleted(Protocol $protocol): void
    {
        try {
            $protocol->unsearchable();
        } catch (\Throwable $e) {
            // noop
        }
    }

    /**
     * Handle the Protocol "restored" event.
     */
    public function restored(Protocol $protocol): void
    {
        try {
            $protocol->searchable();
        } catch (\Throwable $e) {
            // noop
        }
    }

    /**
     * Handle the Protocol "force deleted" event.
     */
    public function forceDeleted(Protocol $protocol): void
    {
        try {
            $protocol->unsearchable();
        } catch (\Throwable $e) {
            // noop
        }
    }
}
