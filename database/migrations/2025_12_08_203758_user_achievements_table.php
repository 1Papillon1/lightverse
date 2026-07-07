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
    Schema::create('user_achievements', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->cascadeOnDelete();
        $table->foreignId('achievement_id')->constrained()->cascadeOnDelete();
        $table->timestamp('unlocked_at')->nullable();
        $table->timestamps();

        $table->unique(['user_id', 'achievement_id']);
    });
}



    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
