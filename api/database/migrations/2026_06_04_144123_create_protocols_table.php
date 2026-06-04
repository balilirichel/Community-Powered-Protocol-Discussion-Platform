<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('protocols', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('content');
            $table->json('tags')->nullable();
            $table->decimal('rating', 3, 2)->default(0.00); // e.g., 4.50
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('protocols');
    }
};