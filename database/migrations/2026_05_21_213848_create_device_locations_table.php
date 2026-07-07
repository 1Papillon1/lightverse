<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('aljmas_device_locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')
                ->constrained('aljmas_devices')   // ← explicit table name
                ->onDelete('cascade');
            $table->foreignId('location_id')
                ->constrained('aljmas_locations') // ← explicit table name
                ->onDelete('cascade');
            $table->timestamp('unlocked_at');
            $table->unique(['device_id', 'location_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('aljmas_device_locations');
    }
};
