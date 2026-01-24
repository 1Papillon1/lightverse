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
        Schema::table('users', function (Blueprint $table) {

            // Make email optional
            $table->string('email')->nullable()->change();

            // Email verification should be optional
            if (Schema::hasColumn('users', 'email_verified_at')) {
                $table->timestamp('email_verified_at')->nullable()->change();
            }

            // Ensure username is unique
            $table->string('username')->unique()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
         Schema::table('users', function (Blueprint $table) {

            // Revert email to required (old behavior)
            $table->string('email')->nullable(false)->change();

            // Revert verification timestamp
            if (Schema::hasColumn('users', 'email_verified_at')) {
                $table->timestamp('email_verified_at')->nullable(false)->change();
            }

            // Remove unique constraint if rolling back
            $table->dropUnique(['username']);
        });
    }
};
