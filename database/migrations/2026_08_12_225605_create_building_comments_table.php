<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('building_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('building_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('body');
            // Moderacija od dana jedan - vidljivo svima dok admin/report ne kaže drugačije
            $table->boolean('is_hidden')->default(false);
            $table->timestamps();

            $table->index(['building_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('building_comments');
    }
};