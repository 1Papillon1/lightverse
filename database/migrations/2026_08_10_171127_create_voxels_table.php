<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('voxels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('planet_id'); // npr. 'verse-forge'
            $table->json('data'); // Ovdje ide array [x, y, z, materialIndex]
            $table->timestamps();

            $table->unique(['user_id', 'planet_id']); // Jedna kreacija po planetu po korisniku
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('voxels');
    }
};
