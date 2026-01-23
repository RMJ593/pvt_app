<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Cloudinary\Cloudinary;

class SettingsController extends Controller
{
    public function index()
    {
        try {
            // Get the first settings record (it's a hybrid table)
            $settings = Setting::first();

            if (!$settings) {
                return response()->json([
                    'success' => false,
                    'message' => 'No settings found'
                ], 404);
            }

            // Convert to array and include ALL fields
            $settingsArray = $settings->toArray();

            // The key and value are for the site_name
            // All other settings are in their own columns
            $settingsArray['site_name'] = $settings->value;

            return response()->json([
                'success' => true,
                'data' => $settingsArray
            ]);

        } catch (\Exception $e) {
            \Log::error('Settings fetch error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request)
    {
        try {
            \Log::info('Settings update request:', $request->all());

            $settings = Setting::first();

            if (!$settings) {
                $settings = new Setting();
                $settings->key = 'site_name';
                $settings->type = 'text';
                $settings->group = 'general';
            }

            // Initialize Cloudinary
            $cloudinary = new Cloudinary([
                'cloud' => [
                    'cloud_name' => config('cloudinary.cloud_name'),
                    'api_key' => config('cloudinary.api_key'),
                    'api_secret' => config('cloudinary.api_secret'),
                ],
                'url' => ['secure' => true]
            ]);

            // Handle popup_ad_image upload to Cloudinary
            if ($request->hasFile('popup_ad_image')) {
                \Log::info('Uploading popup ad image to Cloudinary...');
                
                $result = $cloudinary->uploadApi()->upload(
                    $request->file('popup_ad_image')->getRealPath(),
                    [
                        'folder' => 'settings/popup',
                        'resource_type' => 'image',
                        'timestamp' => time()
                    ]
                );

                $settings->popup_ad_image = $result['secure_url'];
                \Log::info('Popup ad image uploaded:', ['url' => $result['secure_url']]);
            }

            // Handle default_image upload to Cloudinary
            if ($request->hasFile('default_image')) {
                \Log::info('Uploading default image to Cloudinary...');
                
                $result = $cloudinary->uploadApi()->upload(
                    $request->file('default_image')->getRealPath(),
                    [
                        'folder' => 'settings/default',
                        'resource_type' => 'image',
                        'timestamp' => time()
                    ]
                );

                $settings->default_image = $result['secure_url'];
                \Log::info('Default image uploaded:', ['url' => $result['secure_url']]);
            }

            // Handle website_logo upload
            if ($request->hasFile('website_logo')) {
                \Log::info('Uploading website logo to Cloudinary...');
                
                $result = $cloudinary->uploadApi()->upload(
                    $request->file('website_logo')->getRealPath(),
                    [
                        'folder' => 'settings',
                        'resource_type' => 'image',
                        'timestamp' => time()
                    ]
                );

                $settings->website_logo = $result['secure_url'];
                \Log::info('Logo uploaded:', ['url' => $result['secure_url']]);
            }

            // Handle meta_image upload
            if ($request->hasFile('meta_image')) {
                \Log::info('Uploading meta image to Cloudinary...');
                
                $result = $cloudinary->uploadApi()->upload(
                    $request->file('meta_image')->getRealPath(),
                    [
                        'folder' => 'settings',
                        'resource_type' => 'image',
                        'timestamp' => time()
                    ]
                );

                $settings->meta_image = $result['secure_url'];
                \Log::info('Meta image uploaded:', ['url' => $result['secure_url']]);
            }

            // Update all text/boolean fields from the request
            $fillableFields = [
                'main_color', 'white_color', 'color_one', 'color_two', 'color_three',
                'color_four', 'color_five', 'color_six', 'color_seven', 'color_eight',
                'black_color', 'text_color', 'heading_color',
                'admin_emails', 'short_about', 'contact_address', 'contact_phone',
                'contact_email', 'meta_description', 'meta_keywords',
                'facebook_url', 'twitter_url', 'instagram_url', 'linkedin_url', 'youtube_url',
                'head_code', 'footer_code', 'body_code',
                
                // ADDED: Basic Settings
                'robots_txt',
                
                // ADDED: Popup Advertisement Settings
                'popup_ad_url',
                
                // ADDED: Timings
                'open_time_message',
                'shop_start_time',
                'shop_close_time',
                'first_time_message',
                'first_start_time',
                'first_stop_time',
                'second_time_message',
                'second_start_time',
                'second_stop_time',
                
                // ADDED: Custom Stats Fields
                'first_name', 'first_value',
                'second_name', 'second_value',
                'third_name', 'third_value',
                'fourth_name', 'fourth_value',
                
                // ADDED: Google reCAPTCHA
                'recaptcha_key',
                'recaptcha_secret',
                
                // ADDED: Google Maps
                'map_embed_url',
            ];

            foreach ($fillableFields as $field) {
                if ($request->has($field)) {
                    $settings->$field = $request->input($field);
                }
            }

            // Handle boolean fields (checkboxes)
            // These need special handling because checkboxes send 'true'/'false' as strings
            $booleanFields = [
                'enable_popup_ad',
                'show_open_times',
                'show_first_time',
                'show_second_time',
                'recaptcha_enable',
            ];

            foreach ($booleanFields as $field) {
                if ($request->has($field)) {
                    $value = $request->input($field);
                    // Convert string 'true'/'false' to actual boolean
                    $settings->$field = filter_var($value, FILTER_VALIDATE_BOOLEAN);
                    \Log::info("Boolean field {$field}:", ['value' => $settings->$field]);
                }
            }

            // Handle JSON fields
            if ($request->has('booking_schedule')) {
                $bookingSchedule = $request->input('booking_schedule');
                $settings->booking_schedule = is_string($bookingSchedule) 
                    ? json_decode($bookingSchedule, true) 
                    : $bookingSchedule;
            }

            if ($request->has('special_off_days')) {
                $specialOffDays = $request->input('special_off_days');
                $settings->special_off_days = is_string($specialOffDays) 
                    ? json_decode($specialOffDays, true) 
                    : $specialOffDays;
            }

            // Special handling for site_name (stored in 'value' column)
            if ($request->has('site_name')) {
                $settings->value = $request->input('site_name');
            }

            $settings->save();

            \Log::info('Settings saved successfully', [
                'enable_popup_ad' => $settings->enable_popup_ad,
                'popup_ad_image' => $settings->popup_ad_image,
                'popup_ad_url' => $settings->popup_ad_url,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Settings updated successfully',
                'data' => $settings
            ]);

        } catch (\Exception $e) {
            \Log::error('Settings update error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function clearCache()
    {
        try {
            \Artisan::call('cache:clear');
            \Artisan::call('config:clear');
            \Artisan::call('view:clear');

            return response()->json([
                'success' => true,
                'message' => 'Cache cleared successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to clear cache',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}