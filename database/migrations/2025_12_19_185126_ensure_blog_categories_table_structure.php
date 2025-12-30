<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Check if table exists, if not create it
        if (!Schema::hasTable('blog_categories')) {
            Schema::create('blog_categories', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('slug')->unique();
                $table->string('location')->nullable();
                $table->text('description')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        } else {
            // Table exists, add missing columns
            Schema::table('blog_categories', function (Blueprint $table) {
                if (!Schema::hasColumn('blog_categories', 'name')) {
                    $table->string('name')->after('id');
                }
                if (!Schema::hasColumn('blog_categories', 'slug')) {
                    $table->string('slug')->unique();
                }
                if (!Schema::hasColumn('blog_categories', 'location')) {
                    $table->string('location')->nullable();
                }
                if (!Schema::hasColumn('blog_categories', 'description')) {
                    $table->text('description')->nullable();
                }
                if (!Schema::hasColumn('blog_categories', 'is_active')) {
                    $table->boolean('is_active')->default(true);
                }
            });
        }
    }

    public function down(): void
    {
        // Don't drop the table in case there's other data
        Schema::table('blog_categories', function (Blueprint $table) {
            $columns = ['name', 'slug', 'location', 'description', 'is_active'];
            foreach ($columns as $column) {
                if (Schema::hasColumn('blog_categories', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};