<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_responses', function (Blueprint $table) {
            $table->string('name')->after('id');
            $table->string('email')->after('name');
            $table->string('phone')->nullable()->after('email');
            $table->string('subject')->nullable()->after('phone');
            $table->text('message')->after('subject');
            $table->string('status')->default('new')->after('message'); // new, read, replied
        });
    }

    public function down(): void
    {
        Schema::table('user_responses', function (Blueprint $table) {
            $table->dropColumn(['name', 'email', 'phone', 'subject', 'message', 'status']);
        });
    }
};