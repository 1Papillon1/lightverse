<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
     public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('core_light')->default(1);   // Genesis Spark
            $table->unsignedBigInteger('stable_light')->default(0);
            $table->unsignedBigInteger('active_light')->default(0);

            $table->unsignedBigInteger('total_light')->default(1)->index();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'core_light',
                'stable_light',
                'active_light',
                'total_light',
            ]);
        });
    }
};
