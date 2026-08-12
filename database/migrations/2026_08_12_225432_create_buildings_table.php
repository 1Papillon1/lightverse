<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('buildings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('planet_id'); // npr. 'verse-forge' - odakle je snimljeno
            $table->string('title');
            // Snapshot voxela u trenutku objave. NIJE live referenca na VoxelStore -
            // ako user kasnije promijeni svoj privatni prostor, ova kopija ostaje ista.
            $table->json('voxel_data');
            $table->unsignedInteger('block_count')->default(0);
            // Denormalizirani cache da ne moramo COUNT/SUM raditi na svaki gallery request
            $table->unsignedInteger('light_received')->default(0);
            $table->unsignedInteger('comment_count')->default(0);
            $table->float('rating_average')->default(0);
            $table->unsignedInteger('rating_count')->default(0);
            $table->timestamp('published_at');
            $table->timestamps();

            $table->index('published_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('buildings');
    }
};