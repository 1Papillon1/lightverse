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
        Schema::table('achievements', function (Blueprint $table) {
            if (Schema::hasColumn('achievements', 'name')) {
                $table->dropColumn('name');
            }

             if (Schema::hasColumn('achievements', 'category')) {
                $table->dropColumn('category');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('achievements', function (Blueprint $table) {
              $table->boolean('name')->default(false);
        });

        Schema::table('achievements', function (Blueprint $table) {
              $table->boolean('category')->default(false);
        });
    }
};
