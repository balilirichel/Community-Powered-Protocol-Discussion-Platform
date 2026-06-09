<?php

namespace App\Console\Commands;

use App\Models\Protocol;
use Illuminate\Console\Command;

class RecalculateProtocolRatings extends Command
{
    protected $signature   = 'protocols:recalculate-ratings';
    protected $description = 'Recalculate all protocol ratings from their reviews average';

    public function handle(): void
    {
        $protocols = Protocol::withCount('reviews')->get();

        $bar = $this->output->createProgressBar($protocols->count());
        $bar->start();

        foreach ($protocols as $protocol) {
            $protocol->recalculateRating();
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info('All protocol ratings recalculated successfully.');
    }
}