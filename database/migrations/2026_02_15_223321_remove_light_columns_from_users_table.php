<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'core_light',
                'stable_light',
                'active_light',
                'total_light'
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->integer('core_light')->default(0);
            $table->integer('stable_light')->default(0);
            $table->integer('active_light')->default(0);
            $table->integer('total_light')->default(0);
        });
    }
};