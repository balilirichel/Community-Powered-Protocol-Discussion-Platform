<?php

namespace App\Console\Commands;

use App\Models\Protocol;
use App\Models\Thread;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('typesense:reindex {--model= : Specific model to reindex: "Protocol" or "Thread" (default: all)}')]
#[Description('Flush and reimport all searchable models into Typesense')]
class TypesenseReindex extends Command
{
    /**
     * Execute the console command.
     *
     * Examples:
     *   php artisan typesense:reindex
     *   php artisan typesense:reindex --model=Protocol
     *   php artisan typesense:reindex --model=Thread
     */
    public function handle(): int
    {
        $modelOption = strtolower((string) $this->option('model'));

        $map = [
            'protocol' => Protocol::class,
            'thread'   => Thread::class,
        ];

        $targets = match ($modelOption) {
            'protocol' => [Protocol::class],
            'thread'   => [Thread::class],
            default    => array_values($map),
        };

        foreach ($targets as $modelClass) {
            $shortName = class_basename($modelClass);

            $this->info("[$shortName] Flushing existing index...");
            $modelClass::removeAllFromSearch();

            $this->info("[$shortName] Importing all records...");
            $modelClass::makeAllSearchable();

            $count = $modelClass::count();
            $this->info("[$shortName] ✓ {$count} record(s) indexed.");
            $this->newLine();
        }

        $this->info('Reindex complete.');

        return self::SUCCESS;
    }
}
