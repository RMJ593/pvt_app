<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('menu_links', function (Blueprint $table) {
            $table->foreignId('menu_id')->after('id')->constrained()->onDelete('cascade');
            $table->foreignId('parent_id')->nullable()->after('menu_id')->constrained('menu_links')->onDelete('cascade');
            $table->string('title')->after('parent_id');
            $table->string('url')->after('title');
            $table->string('target')->default('_self')->after('url'); // _self or _blank
            $table->integer('order')->default(0)->after('target');
            $table->boolean('is_active')->default(true)->after('order');
        });
    }

    public function down(): void
    {
        Schema::table('menu_links', function (Blueprint $table) {
            $table->dropForeign(['menu_id']);
            $table->dropForeign(['parent_id']);
            $table->dropColumn(['menu_id', 'parent_id', 'title', 'url', 'target', 'order', 'is_active']);
        });
    }
};