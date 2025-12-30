<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pages', function (Blueprint $table) {
            $table->string('page_title')->nullable()->after('small_heading');
            $table->string('location')->nullable()->after('slug');
            $table->unsignedBigInteger('hero_banner_id')->nullable()->after('location');
            $table->string('banner_image')->nullable()->after('content');
            $table->string('seo_title')->nullable()->after('banner_image');
            $table->text('meta_keywords')->nullable()->after('meta_description');
            $table->string('meta_image')->nullable()->after('meta_keywords');
            $table->string('robots')->default('index,follow')->after('meta_image');
            $table->string('og_type')->default('website')->after('robots');
            
            // Add foreign key if hero_banners table exists
            $table->foreign('hero_banner_id')->references('id')->on('hero_banners')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('pages', function (Blueprint $table) {
            $table->dropForeign(['hero_banner_id']);
            $table->dropColumn([
                'page_title',
                'location',
                'hero_banner_id',
                'banner_image',
                'seo_title',
                'meta_keywords',
                'meta_image',
                'robots',
                'og_type'
            ]);
        });
    }
};