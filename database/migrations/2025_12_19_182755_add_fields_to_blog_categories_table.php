<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('blog_categories', function (Blueprint $table) {
            // Add name column if it doesn't exist
            if (!Schema::hasColumn('blog_categories', 'name')) {
                $table->string('name')->after('id');
            }
            
            // Add slug column if it doesn't exist
            if (!Schema::hasColumn('blog_categories', 'slug')) {
                $table->string('slug')->unique();
            }
            
            // Add location column if it doesn't exist
            if (!Schema::hasColumn('blog_categories', 'location')) {
                $table->string('location')->nullable();
            }
            
            // Add is_active column if it doesn't exist
            if (!Schema::hasColumn('blog_categories', 'is_active')) {
                $table->boolean('is_active')->default(true);
            }
        });
    }

    public function down(): void
    {
        Schema::table('blog_categories', function (Blueprint $table) {
            if (Schema::hasColumn('blog_categories', 'slug')) {
                $table->dropColumn('slug');
            }
            if (Schema::hasColumn('blog_categories', 'location')) {
                $table->dropColumn('location');
            }
            if (Schema::hasColumn('blog_categories', 'is_active')) {
                $table->dropColumn('is_active');
            }
        });
    }
};