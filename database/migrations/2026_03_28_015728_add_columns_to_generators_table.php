<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
{
    Schema::table('generators', function (Blueprint $table) {
        $table->foreignId('user_id')->after('id')->constrained()->cascadeOnDelete();
        $table->string('state')->default('inactive')->after('user_id');
        $table->unsignedTinyInteger('current_stage')->default(1)->after('state');
        $table->timestamp('stage_started_at')->nullable()->after('current_stage');
        $table->json('completed_stages')->nullable()->after('stage_started_at');
    });
}

public function down(): void
{
    Schema::table('generators', function (Blueprint $table) {
        $table->dropForeign(['user_id']);
        $table->dropColumn(['user_id', 'state', 'current_stage', 'stage_started_at', 'completed_stages']);
    });
}
};
