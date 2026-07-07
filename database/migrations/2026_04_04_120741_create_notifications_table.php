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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Notification type (light_earned, achievement, new_content, system)
            $table->string('type')->index();
            
            // Content
            $table->string('title');
            $table->text('message')->nullable();
            
            // Optional action URL (where clicking notification takes you)
            $table->string('action_url')->nullable();
            
            // Metadata (JSON for extra data like light amount, achievement ID, etc.)
            $table->json('metadata')->nullable();
            
            // Status
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index(['user_id', 'read_at']);
            $table->index('created_at');
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
