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
        Schema::table('menu_items', function (Blueprint $table) {
            // Add is_active column if it doesn't exist
            if (!Schema::hasColumn('menu_items', 'is_active')) {
                $table->boolean('is_active')->default(true);
            }
            
            // Add new feature columns if they don't exist
            if (!Schema::hasColumn('menu_items', 'is_special_dish')) {
                $table->boolean('is_special_dish')->default(false);
            }
            if (!Schema::hasColumn('menu_items', 'is_special_offer')) {
                $table->boolean('is_special_offer')->default(false);
            }
            if (!Schema::hasColumn('menu_items', 'is_chef_selection')) {
                $table->boolean('is_chef_selection')->default(false);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('menu_items', function (Blueprint $table) {
            if (Schema::hasColumn('menu_items', 'is_special_dish')) {
                $table->dropColumn('is_special_dish');
            }
            if (Schema::hasColumn('menu_items', 'is_special_offer')) {
                $table->dropColumn('is_special_offer');
            }
            if (Schema::hasColumn('menu_items', 'is_chef_selection')) {
                $table->dropColumn('is_chef_selection');
            }
        });
    }
};