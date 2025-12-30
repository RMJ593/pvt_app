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
        Schema::table('gallery_images', function (Blueprint $table) {
            // Add is_active column if it doesn't exist
            if (!Schema::hasColumn('gallery_images', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('image');
            }
            
            // Make description and order nullable if they exist
            if (Schema::hasColumn('gallery_images', 'description')) {
                $table->text('description')->nullable()->change();
            }
            if (Schema::hasColumn('gallery_images', 'order')) {
                $table->integer('order')->nullable()->change();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('gallery_images', function (Blueprint $table) {
            if (Schema::hasColumn('gallery_images', 'is_active')) {
                $table->dropColumn('is_active');
            }
        });
    }
};