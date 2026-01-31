<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('settings', function (Blueprint $table) {
            // Theme Style Colors
            $table->string('main_color')->nullable()->after('id');
            $table->string('white_color')->nullable();
            $table->string('color_one')->nullable();
            $table->string('color_two')->nullable();
            $table->string('color_three')->nullable();
            $table->string('color_four')->nullable();
            $table->string('color_five')->nullable();
            $table->string('color_six')->nullable();
            $table->string('color_seven')->nullable();
            $table->string('color_eight')->nullable();
            $table->string('black_color')->nullable();
            $table->string('text_color')->nullable();
            $table->string('heading_color')->nullable();
            
            // Theme Content
            $table->text('admin_emails')->nullable();
            $table->text('short_about')->nullable();
            $table->text('contact_address')->nullable();
            $table->string('contact_phone')->nullable();
            $table->string('contact_email')->nullable();
            $table->text('meta_description')->nullable();
            $table->text('meta_keywords')->nullable();
            
            // Images
            $table->string('website_logo')->nullable();
            $table->string('meta_image')->nullable();
            
            // Social Media
            $table->string('facebook_url')->nullable();
            $table->string('twitter_url')->nullable();
            $table->string('instagram_url')->nullable();
            $table->string('linkedin_url')->nullable();
            $table->string('youtube_url')->nullable();
            
            // Extension Code
            $table->text('head_code')->nullable();
            $table->text('footer_code')->nullable();
        });
    }

    public function down()
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->dropColumn([
                'main_color', 'white_color', 'color_one', 'color_two', 'color_three',
                'color_four', 'color_five', 'color_six', 'color_seven', 'color_eight',
                'black_color', 'text_color', 'heading_color', 'admin_emails', 'short_about',
                'contact_address', 'contact_phone', 'contact_email', 'meta_description',
                'meta_keywords', 'website_logo', 'meta_image', 'facebook_url', 'twitter_url',
                'instagram_url', 'linkedin_url', 'youtube_url', 'head_code', 'footer_code'
            ]);
        });
    }
};