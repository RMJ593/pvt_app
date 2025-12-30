<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('menus', function (Blueprint $table) {
            $table->string('name')->after('id');
            $table->string('slug')->unique()->after('name');
            $table->string('location')->after('slug'); // 'header', 'footer', etc.
            $table->integer('order')->default(0)->after('location');
            $table->boolean('is_active')->default(true)->after('order');
        });
    }

    public function down(): void
    {
        Schema::table('menus', function (Blueprint $table) {
            $table->dropColumn(['name', 'slug', 'location', 'order', 'is_active']);
        });
    }
};