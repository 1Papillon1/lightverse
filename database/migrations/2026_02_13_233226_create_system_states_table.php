<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('system_states', function (Blueprint $table) {
            $table->id();

            $table->bigInteger('core_light')->default(0);
            $table->bigInteger('stable_light')->default(0);
            $table->bigInteger('active_light')->default(0);

            $table->bigInteger('total_light')->default(0);

            $table->boolean('stabilizing')->default(false);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_states');
    }
};
