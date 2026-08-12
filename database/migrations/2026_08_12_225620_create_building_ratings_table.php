<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('building_ratings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('building_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('rating'); // 1-5
            $table->timestamps();

            // Jedna ocjena po useru po izgradnji - re-rate radi UPDATE, ne novi red
            $table->unique(['building_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('building_ratings');
    }
};