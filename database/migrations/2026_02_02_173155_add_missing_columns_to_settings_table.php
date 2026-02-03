<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            // Theme Colors
            if (!Schema::hasColumn('settings', 'main_color')) {
                $table->string('main_color')->nullable();
            }
            if (!Schema::hasColumn('settings', 'white_color')) {
                $table->string('white_color')->nullable();
            }
            if (!Schema::hasColumn('settings', 'color_one')) {
                $table->string('color_one')->nullable();
            }
            if (!Schema::hasColumn('settings', 'color_two')) {
                $table->string('color_two')->nullable();
            }
            if (!Schema::hasColumn('settings', 'color_three')) {
                $table->string('color_three')->nullable();
            }
            if (!Schema::hasColumn('settings', 'color_four')) {
                $table->string('color_four')->nullable();
            }
            if (!Schema::hasColumn('settings', 'color_five')) {
                $table->string('color_five')->nullable();
            }
            if (!Schema::hasColumn('settings', 'color_six')) {
                $table->string('color_six')->nullable();
            }
            if (!Schema::hasColumn('settings', 'color_seven')) {
                $table->string('color_seven')->nullable();
            }
            if (!Schema::hasColumn('settings', 'color_eight')) {
                $table->string('color_eight')->nullable();
            }
            if (!Schema::hasColumn('settings', 'black_color')) {
                $table->string('black_color')->nullable();
            }
            if (!Schema::hasColumn('settings', 'text_color')) {
                $table->string('text_color')->nullable();
            }
            if (!Schema::hasColumn('settings', 'heading_color')) {
                $table->string('heading_color')->nullable();
            }

            // Theme Content
            if (!Schema::hasColumn('settings', 'admin_emails')) {
                $table->text('admin_emails')->nullable();
            }
            if (!Schema::hasColumn('settings', 'short_about')) {
                $table->text('short_about')->nullable();
            }
            if (!Schema::hasColumn('settings', 'contact_address')) {
                $table->text('contact_address')->nullable();
            }
            if (!Schema::hasColumn('settings', 'contact_phone')) {
                $table->string('contact_phone')->nullable();
            }
            if (!Schema::hasColumn('settings', 'contact_email')) {
                $table->string('contact_email')->nullable();
            }
            if (!Schema::hasColumn('settings', 'meta_description')) {
                $table->text('meta_description')->nullable();
            }
            if (!Schema::hasColumn('settings', 'meta_keywords')) {
                $table->text('meta_keywords')->nullable();
            }

            // Images
            if (!Schema::hasColumn('settings', 'website_logo')) {
                $table->string('website_logo')->nullable();
            }
            if (!Schema::hasColumn('settings', 'meta_image')) {
                $table->string('meta_image')->nullable();
            }

            // Social Media
            if (!Schema::hasColumn('settings', 'facebook_url')) {
                $table->string('facebook_url')->nullable();
            }
            if (!Schema::hasColumn('settings', 'twitter_url')) {
                $table->string('twitter_url')->nullable();
            }
            if (!Schema::hasColumn('settings', 'instagram_url')) {
                $table->string('instagram_url')->nullable();
            }
            if (!Schema::hasColumn('settings', 'linkedin_url')) {
                $table->string('linkedin_url')->nullable();
            }
            if (!Schema::hasColumn('settings', 'youtube_url')) {
                $table->string('youtube_url')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $columns = [
                'main_color', 'white_color', 'color_one', 'color_two', 'color_three',
                'color_four', 'color_five', 'color_six', 'color_seven', 'color_eight',
                'black_color', 'text_color', 'heading_color',
                'admin_emails', 'short_about', 'contact_address', 'contact_phone',
                'contact_email', 'meta_description', 'meta_keywords',
                'website_logo', 'meta_image',
                'facebook_url', 'twitter_url', 'instagram_url', 'linkedin_url', 'youtube_url'
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('settings', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};