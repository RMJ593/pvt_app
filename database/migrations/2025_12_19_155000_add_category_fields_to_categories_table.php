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
        Schema::table('categories', function (Blueprint $table) {
            // Add new columns if they don't exist
            if (!Schema::hasColumn('categories', 'small_heading')) {
                $table->string('small_heading')->nullable()->after('name');
            }
            if (!Schema::hasColumn('categories', 'location')) {
                $table->string('location')->nullable()->after('small_heading');
            }
            if (!Schema::hasColumn('categories', 'is_royalty')) {
                $table->boolean('is_royalty')->default(false)->after('is_active');
            }
            if (!Schema::hasColumn('categories', 'is_special_selection')) {
                $table->boolean('is_special_selection')->default(false)->after('is_royalty');
            }
            
            // Make description nullable if it's not
            if (Schema::hasColumn('categories', 'description')) {
                $table->text('description')->nullable()->change();
            }
            
            // Make order nullable if it's not
            if (Schema::hasColumn('categories', 'order')) {
                $table->integer('order')->nullable()->change();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn(['small_heading', 'location', 'is_royalty', 'is_special_selection']);
        });
    }
};