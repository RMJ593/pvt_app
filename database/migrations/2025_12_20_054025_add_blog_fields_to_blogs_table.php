<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('blogs', function (Blueprint $table) {
            // Add missing columns if they don't exist
            if (!Schema::hasColumn('blogs', 'title')) {
                $table->string('title')->after('id');
            }
            if (!Schema::hasColumn('blogs', 'slug')) {
                $table->string('slug')->unique()->after('title');
            }
            if (!Schema::hasColumn('blogs', 'small_description')) {
                $table->text('small_description')->nullable()->after('slug');
            }
            if (!Schema::hasColumn('blogs', 'content')) {
                $table->longText('content')->nullable()->after('small_description');
            }
            if (!Schema::hasColumn('blogs', 'category_id')) {
                $table->foreignId('category_id')->nullable()->constrained('blog_categories')->onDelete('set null')->after('content');
            }
            if (!Schema::hasColumn('blogs', 'image')) {
                $table->string('image')->nullable()->after('category_id');
            }
            if (!Schema::hasColumn('blogs', 'banner_image')) {
                $table->string('banner_image')->nullable()->after('image');
            }
            if (!Schema::hasColumn('blogs', 'tags')) {
                $table->string('tags')->nullable()->after('banner_image');
            }
            if (!Schema::hasColumn('blogs', 'seo_title')) {
                $table->string('seo_title')->nullable()->after('tags');
            }
            if (!Schema::hasColumn('blogs', 'meta_keywords')) {
                $table->text('meta_keywords')->nullable()->after('seo_title');
            }
            if (!Schema::hasColumn('blogs', 'meta_description')) {
                $table->text('meta_description')->nullable()->after('meta_keywords');
            }
            if (!Schema::hasColumn('blogs', 'meta_image')) {
                $table->string('meta_image')->nullable()->after('meta_description');
            }
            if (!Schema::hasColumn('blogs', 'robots')) {
                $table->string('robots')->default('index,follow')->after('meta_image');
            }
            if (!Schema::hasColumn('blogs', 'og_type')) {
                $table->string('og_type')->default('article')->after('robots');
            }
            if (!Schema::hasColumn('blogs', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('og_type');
            }
        });
    }

    public function down(): void
    {
        Schema::table('blogs', function (Blueprint $table) {
            $columns = [
                'title', 'slug', 'small_description', 'content', 'category_id',
                'image', 'banner_image', 'tags', 'seo_title', 'meta_keywords',
                'meta_description', 'meta_image', 'robots', 'og_type', 'is_active'
            ];
            
            foreach ($columns as $column) {
                if (Schema::hasColumn('blogs', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};