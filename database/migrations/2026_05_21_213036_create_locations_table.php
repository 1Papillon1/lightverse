<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
      public function up(): void
    {
        Schema::create('aljmas_locations', function (Blueprint $table) {
            $table->id();
            $table->integer('order')->default(0);        // sequence in the discovery chain
            $table->string('name');                      // standard name
            $table->string('dialect_name')->nullable();  // local Aljmaš name
            $table->decimal('lat', 10, 7);
            $table->decimal('lng', 10, 7);
            $table->integer('radius_meters')->default(30); // unlock radius
            $table->text('dialect_story');               // story told in local dialect
            $table->text('historical_note')->nullable(); // background/context
            $table->text('clue_text');                   // clue leading to next location (in dialect)
            $table->string('audio_url')->nullable();     // recorded local voice
            $table->string('image_url')->nullable();     // photo of the location
            $table->boolean('is_final')->default(false); // is this the last location?
            $table->timestamps();
        });
    }
 
    public function down(): void
    {
        Schema::dropIfExists('aljmas_locations');
    }
};
