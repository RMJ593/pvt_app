<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $table = 'settings';

    protected $fillable = [
        // Theme Colors
        'main_color',
        'white_color',
        'color_one',
        'color_two',
        'color_three',
        'color_four',
        'color_five',
        'color_six',
        'color_seven',
        'color_eight',
        'black_color',
        'text_color',
        'heading_color',
        
        // Theme Content
        'admin_emails',
        'short_about',
        'contact_address',
        'contact_phone',
        'contact_email',
        'meta_description',
        'meta_keywords',
        
        // Basic Settings
        'robots_txt',
        
        // Popup Advertisement
        'enable_popup_ad',
        'popup_ad_image',
        'popup_ad_url',
        
        // Default Image
        'default_image',
        
        // Timings
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
        
        // Booking Schedule
        'booking_schedule',
        'special_off_days',
        
        // Custom Fields
        'first_name',
        'first_value',
        'second_name',
        'second_value',
        'third_name',
        'third_value',
        'fourth_name',
        'fourth_value',
        
        // Google reCAPTCHA
        'recaptcha_enable',
        'recaptcha_key',
        'recaptcha_secret',
        
        // Images
        'website_logo',
        'meta_image',
        
        // Social Media
        'facebook_url',
        'twitter_url',
        'instagram_url',
        'linkedin_url',
        'youtube_url',
        
        // Extended Code
        'head_code',
        'footer_code',
        'body_code',
    ];

    protected $casts = [
        'enable_popup_ad' => 'boolean',
        'show_open_times' => 'boolean',
        'show_first_time' => 'boolean',
        'show_second_time' => 'boolean',
        'recaptcha_enable' => 'boolean',
        'booking_schedule' => 'array',
        'special_off_days' => 'array',
    ];
}