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
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('title');
            $table->string('description')->nullable();
            $table->string('icon', 10)->default('✦');
            $table->enum('type', ['daily', 'weekly', 'monthly', 'progressive', 'one_time']);
            $table->enum('light_type', ['core', 'stable', 'active'])->default('active');
            $table->integer('light_reward');
            $table->integer('required_count')->default(1); // for progressive tasks
            $table->boolean('active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
