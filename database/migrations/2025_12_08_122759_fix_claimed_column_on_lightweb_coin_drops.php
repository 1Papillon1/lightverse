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
         Schema::table('lightweb_coin_drops', function (Blueprint $table) {
        if (!Schema::hasColumn('lightweb_coin_drops', 'claimed')) {
            $table->boolean('claimed')->default(false);
        }

        if (Schema::hasColumn('lightweb_coin_drops', 'status')) {
            $table->dropColumn('status');
        }
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
