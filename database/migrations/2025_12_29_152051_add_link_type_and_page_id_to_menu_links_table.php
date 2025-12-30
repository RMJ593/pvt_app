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
            // Check if columns don't exist before adding
            if (!Schema::hasColumn('menu_links', 'link_type')) {
                $table->string('link_type')->default('top_menu')->after('url');
            }
            if (!Schema::hasColumn('menu_links', 'page_id')) {
                $table->unsignedBigInteger('page_id')->nullable()->after('link_type');
                $table->foreign('page_id')->references('id')->on('pages')->onDelete('set null');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('menu_links', function (Blueprint $table) {
            if (Schema::hasColumn('menu_links', 'page_id')) {
                $table->dropForeign(['page_id']);
                $table->dropColumn('page_id');
            }
            if (Schema::hasColumn('menu_links', 'link_type')) {
                $table->dropColumn('link_type');
            }
        });
    }
};