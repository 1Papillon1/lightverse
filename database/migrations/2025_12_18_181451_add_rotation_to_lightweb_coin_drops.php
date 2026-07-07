<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
     public function up()
    {
        Schema::table('lightweb_coin_drops', function (Blueprint $table) {
            $table->float('rot_x')->default(0);
            $table->float('rot_y')->default(0);
            $table->float('rot_z')->default(0);
        });
    }

    public function down()
    {
        Schema::table('lightweb_coin_drops', function (Blueprint $table) {
            $table->dropColumn(['rot_x', 'rot_y', 'rot_z']);
        });
    }
};
