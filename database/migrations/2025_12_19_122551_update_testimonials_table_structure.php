<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('testimonials', function (Blueprint $table) {
            // Drop old columns if they exist
            if (Schema::hasColumn('testimonials', 'rating')) {
                $table->dropColumn('rating');
            }
            if (Schema::hasColumn('testimonials', 'is_featured')) {
                $table->dropColumn('is_featured');
            }
            
            // Add new column if it doesn't exist
            if (!Schema::hasColumn('testimonials', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('customer_image');
            }
        });
    }

    public function down(): void
    {
        Schema::table('testimonials', function (Blueprint $table) {
            $table->integer('rating')->default(5);
            $table->boolean('is_featured')->default(false);
            $table->dropColumn('is_active');
        });
    }
};