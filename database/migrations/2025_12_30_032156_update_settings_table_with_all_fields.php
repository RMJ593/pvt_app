<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            // Basic Settings
            if (!Schema::hasColumn('settings', 'robots_txt')) {
                $table->text('robots_txt')->nullable();
            }
            
            // Popup Advertisement
            if (!Schema::hasColumn('settings', 'enable_popup_ad')) {
                $table->boolean('enable_popup_ad')->default(false);
            }
            if (!Schema::hasColumn('settings', 'popup_ad_image')) {
                $table->string('popup_ad_image')->nullable();
            }
            if (!Schema::hasColumn('settings', 'popup_ad_url')) {
                $table->string('popup_ad_url')->nullable();
            }
            
            // Default Image
            if (!Schema::hasColumn('settings', 'default_image')) {
                $table->string('default_image')->nullable();
            }
            
            // Timings
            if (!Schema::hasColumn('settings', 'show_open_times')) {
                $table->boolean('show_open_times')->default(true);
            }
            if (!Schema::hasColumn('settings', 'open_time_message')) {
                $table->string('open_time_message')->nullable();
            }
            if (!Schema::hasColumn('settings', 'shop_start_time')) {
                $table->time('shop_start_time')->nullable();
            }
            if (!Schema::hasColumn('settings', 'shop_close_time')) {
                $table->time('shop_close_time')->nullable();
            }
            
            if (!Schema::hasColumn('settings', 'show_first_time')) {
                $table->boolean('show_first_time')->default(false);
            }
            if (!Schema::hasColumn('settings', 'first_time_message')) {
                $table->string('first_time_message')->nullable();
            }
            if (!Schema::hasColumn('settings', 'first_start_time')) {
                $table->time('first_start_time')->nullable();
            }
            if (!Schema::hasColumn('settings', 'first_stop_time')) {
                $table->time('first_stop_time')->nullable();
            }
            
            if (!Schema::hasColumn('settings', 'show_second_time')) {
                $table->boolean('show_second_time')->default(false);
            }
            if (!Schema::hasColumn('settings', 'second_time_message')) {
                $table->string('second_time_message')->nullable();
            }
            if (!Schema::hasColumn('settings', 'second_start_time')) {
                $table->time('second_start_time')->nullable();
            }
            if (!Schema::hasColumn('settings', 'second_stop_time')) {
                $table->time('second_stop_time')->nullable();
            }
            
            // Booking Schedule (JSON)
            if (!Schema::hasColumn('settings', 'booking_schedule')) {
                $table->json('booking_schedule')->nullable();
            }
            
            // Special Off Days (JSON array of dates)
            if (!Schema::hasColumn('settings', 'special_off_days')) {
                $table->json('special_off_days')->nullable();
            }
            
            // Custom Fields
            if (!Schema::hasColumn('settings', 'first_name')) {
                $table->string('first_name')->nullable();
            }
            if (!Schema::hasColumn('settings', 'first_value')) {
                $table->string('first_value')->nullable();
            }
            if (!Schema::hasColumn('settings', 'second_name')) {
                $table->string('second_name')->nullable();
            }
            if (!Schema::hasColumn('settings', 'second_value')) {
                $table->string('second_value')->nullable();
            }
            if (!Schema::hasColumn('settings', 'third_name')) {
                $table->string('third_name')->nullable();
            }
            if (!Schema::hasColumn('settings', 'third_value')) {
                $table->string('third_value')->nullable();
            }
            if (!Schema::hasColumn('settings', 'fourth_name')) {
                $table->string('fourth_name')->nullable();
            }
            if (!Schema::hasColumn('settings', 'fourth_value')) {
                $table->string('fourth_value')->nullable();
            }
            
            // Google reCAPTCHA
            if (!Schema::hasColumn('settings', 'recaptcha_enable')) {
                $table->boolean('recaptcha_enable')->default(false);
            }
            if (!Schema::hasColumn('settings', 'recaptcha_key')) {
                $table->string('recaptcha_key')->nullable();
            }
            if (!Schema::hasColumn('settings', 'recaptcha_secret')) {
                $table->string('recaptcha_secret')->nullable();
            }
            
            // Extended Code
            if (!Schema::hasColumn('settings', 'head_code')) {
                $table->text('head_code')->nullable();
            }
            if (!Schema::hasColumn('settings', 'footer_code')) {
                $table->text('footer_code')->nullable();
            }
            if (!Schema::hasColumn('settings', 'body_code')) {
                $table->text('body_code')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $columns = [
                'robots_txt',
                'enable_popup_ad',
                'popup_ad_image',
                'popup_ad_url',
                'default_image',
                'show_open_times',
                'open_time_message',
                'shop_start_time',
                'shop_close_time',
                'show_first_time',
                'first_time_message',
                'first_start_time',
                'first_stop_time',
                'show_second_time',
                'second_time_message',
                'second_start_time',
                'second_stop_time',
                'booking_schedule',
                'special_off_days',
                'first_name',
                'first_value',
                'second_name',
                'second_value',
                'third_name',
                'third_value',
                'fourth_name',
                'fourth_value',
                'recaptcha_enable',
                'recaptcha_key',
                'recaptcha_secret',
                'body_code'
            ];
            
            foreach ($columns as $column) {
                if (Schema::hasColumn('settings', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};