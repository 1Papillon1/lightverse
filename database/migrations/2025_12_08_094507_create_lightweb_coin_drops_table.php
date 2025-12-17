<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;



return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lightweb_coin_drops', function (Blueprint $table) {
            $table->id();

            // Which user this drop belongs to
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // Amount of Lightweb Coins
            $table->integer('amount')->default(1);

            // Reason: reward, achievement, bonus, event, etc.
            $table->string('reason')->nullable();

            // 3D coordinates where the coin appears
            $table->float('x');
            $table->float('y');
            $table->float('z');
            $table->string('spawn_location')->nullable();

            // Whether user claimed it
            $table->boolean('claimed')->default(false);
            $table->timestamp('claimed_at')->nullable();

            // Expiration (default 10 minutes)
            $table->timestamp('expires_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lightweb_coin_drops');
    }
};
