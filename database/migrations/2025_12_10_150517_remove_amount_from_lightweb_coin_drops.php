<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
     public function up(): void
    {
        Schema::table('lightweb_coin_drops', function (Blueprint $table) {
            if (Schema::hasColumn('lightweb_coin_drops', 'amount')) {
                $table->dropColumn('amount');
            }
        });
    }

    public function down(): void
    {
        Schema::table('lightweb_coin_drops', function (Blueprint $table) {
            $table->integer('amount')->default(1);
        });
    }
};
