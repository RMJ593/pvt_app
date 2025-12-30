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
            if (!Schema::hasColumn('gallery_images', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('image');
            }
            
            // Remove unused columns if they exist
            if (Schema::hasColumn('gallery_images', 'description')) {
                $table->dropColumn('description');
            }
            if (Schema::hasColumn('gallery_images', 'order')) {
                $table->dropColumn('order');
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
            
            $table->text('description')->nullable();
            $table->integer('order')->default(0);
        });
    }
};