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
         Schema::create('achievements', function (Blueprint $table) {
        $table->id();
        $table->string('code')->unique();      // e.g. "first_login_spawn"
        $table->string('name');                // Human readable
        $table->string('category')->nullable();// e.g. "login", "tutorial"
        $table->json('data')->nullable();      // reward data etc.
        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('achievements');
    }
};
