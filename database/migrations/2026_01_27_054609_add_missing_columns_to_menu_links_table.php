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
        Schema::table('menu_links', function (Blueprint $table) {
            // Add missing columns
            if (!Schema::hasColumn('menu_links', 'link_text')) {
                $table->string('link_text')->nullable()->after('title');
            }
            if (!Schema::hasColumn('menu_links', 'page_type')) {
                $table->string('page_type')->nullable()->after('page_id');
            }
            if (!Schema::hasColumn('menu_links', 'is_group')) {
                $table->boolean('is_group')->default(false)->after('is_active');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('menu_links', function (Blueprint $table) {
            $table->dropColumn(['link_text', 'page_type', 'is_group']);
        });
    }
};