<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
     public function up(): void
    {
        Schema::rename('light_transactions', 'light_transaction');
    }

    public function down(): void
    {
        Schema::rename('light_transaction', 'light_transactions');
    }
};
