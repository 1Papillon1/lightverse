<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
      public function up(): void
    {
        Schema::create('aljmas_devices', function (Blueprint $table) {
            $table->id();
            $table->uuid('device_uuid')->unique(); // auto-generated on first app launch
            $table->string('nickname')->nullable();
            $table->timestamps();
        });
    }
 
    public function down(): void
    {
        Schema::dropIfExists('aljmas_devices');
    }
};
