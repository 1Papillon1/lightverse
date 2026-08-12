<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Denormalizirani cache Light vrijednosti - light_transactions ledger
            // ostaje izvor istine, ovo postoji isključivo radi brzog sortiranja
            // na leaderboardu (RankingController::orderByDesc('total_light')),
            // bez potrebe za live SUM() preko cijelog ledgera po useru.
            $table->unsignedInteger('core_light')->default(0)->after('password');
            $table->unsignedInteger('stable_light')->default(0)->after('core_light');
            $table->unsignedInteger('active_light')->default(0)->after('stable_light');
            $table->unsignedInteger('total_light')->default(0)->after('active_light');

            $table->index('total_light'); // leaderboard ORDER BY oslanja se na ovo
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['total_light']);
            $table->dropColumn(['core_light', 'stable_light', 'active_light', 'total_light']);
        });
    }
};