<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('menu_links', function (Blueprint $table) {
            if (!Schema::hasColumn('menu_links', 'menu_id')) {
                $table->foreignId('menu_id')->after('id')->constrained()->onDelete('cascade');
            }
            if (!Schema::hasColumn('menu_links', 'parent_id')) {
                $table->foreignId('parent_id')->nullable()->after('menu_id')->constrained('menu_links')->onDelete('cascade');
            }
            if (!Schema::hasColumn('menu_links', 'title')) {
                $table->string('title')->after('parent_id');
            }
            if (!Schema::hasColumn('menu_links', 'url')) {
                $table->string('url')->after('title');
            }
            if (!Schema::hasColumn('menu_links', 'target')) {
                $table->string('target')->default('_self')->after('url');
            }
            if (!Schema::hasColumn('menu_links', 'order')) {
                $table->integer('order')->default(0)->after('target');
            }
            if (!Schema::hasColumn('menu_links', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('order');
            }
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