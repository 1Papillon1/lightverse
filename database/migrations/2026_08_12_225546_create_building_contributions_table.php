<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('building_contributions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('building_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // contributor
            $table->unsignedInteger('amount'); // koliko Active Light je creator dobio
            $table->timestamps();

            // Jedan contribute po useru po izgradnji - sprječava spam/farming
            $table->unique(['building_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('building_contributions');
    }
};