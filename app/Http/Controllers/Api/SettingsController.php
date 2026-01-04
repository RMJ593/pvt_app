<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SettingsController extends Controller
{
    public function index()
    {
        try {
            // Get the first (and should be only) settings record
            $settings = Setting::first();

            if (!$settings) {
                // If no settings exist, create default
                $settings = Setting::create([
                    'site_name' => 'Curry Leaf',
                    'email' => 'info@curryleaf.uk',
                    'phone' => '+447878277198',
                ]);
            }

            // Parse JSON fields safely
            $settingsArray = $settings->toArray();
            
            // Handle booking_schedule
            if (isset($settingsArray['booking_schedule']) && is_string($settingsArray['booking_schedule'])) {
                try {
                    $settingsArray['booking_schedule'] = json_decode($settingsArray['booking_schedule'], true);
                } catch (\Exception $e) {
                    $settingsArray['booking_schedule'] = [
                        'sunday' => [],
                        'monday' => [],
                        'tuesday' => [],
                        'wednesday' => [],
                        'thursday' => [],
                        'friday' => [],
                        'saturday' => []
                    ];
                }
            }

            // Handle special_off_days
            if (isset($settingsArray['special_off_days']) && is_string($settingsArray['special_off_days'])) {
                try {
                    $settingsArray['special_off_days'] = json_decode($settingsArray['special_off_days'], true) ?? [];
                } catch (\Exception $e) {
                    $settingsArray['special_off_days'] = [];
                }
            }

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
            $settings = Setting::first();

            if (!$settings) {
                $settings = new Setting();
            }

            // Update simple fields
            $simpleFields = [
                'site_name', 'email', 'phone', 'address', 'whatsapp_number',
                'facebook_url', 'twitter_url', 'instagram_url', 'linkedin_url',
                'website_logo', 'footer_logo', 'favicon',
                'main_color', 'color_2',
                'sunday_timing', 'weekday_timing',
                'robots_txt', 'popup_ad_url',
                'open_time_message', 'shop_start_time', 'shop_close_time',
                'first_time_message', 'first_start_time', 'first_stop_time',
                'second_time_message', 'second_start_time', 'second_stop_time',
                'first_name', 'first_value', 'second_name', 'second_value',
                'third_name', 'third_value', 'fourth_name', 'fourth_value',
                'recaptcha_key', 'recaptcha_secret',
                'head_code', 'body_code', 'footer_code'
            ];

            foreach ($simpleFields as $field) {
                if ($request->has($field)) {
                    $settings->$field = $request->input($field);
                }
            }

            // Boolean fields
            $booleanFields = [
                'enable_popup_ad', 'show_open_times', 'show_first_time', 
                'show_second_time', 'recaptcha_enable'
            ];

            foreach ($booleanFields as $field) {
                if ($request->has($field)) {
                    $settings->$field = filter_var($request->input($field), FILTER_VALIDATE_BOOLEAN);
                }
            }

            // JSON fields
            if ($request->has('booking_schedule')) {
                $bookingSchedule = $request->input('booking_schedule');
                $settings->booking_schedule = is_string($bookingSchedule) 
                    ? $bookingSchedule 
                    : json_encode($bookingSchedule);
            }

            if ($request->has('special_off_days')) {
                $specialOffDays = $request->input('special_off_days');
                $settings->special_off_days = is_string($specialOffDays) 
                    ? $specialOffDays 
                    : json_encode($specialOffDays);
            }

            // Handle file uploads
            if ($request->hasFile('popup_ad_image')) {
                // Delete old image
                if ($settings->popup_ad_image && Storage::disk('public')->exists($settings->popup_ad_image)) {
                    Storage::disk('public')->delete($settings->popup_ad_image);
                }

                $file = $request->file('popup_ad_image');
                $filename = time() . '_popup_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('', $filename, 'public');
                $settings->popup_ad_image = $path;
                
                \Log::info('Popup image uploaded:', ['path' => $path]);
            }

            if ($request->hasFile('default_image')) {
                // Delete old image
                if ($settings->default_image && Storage::disk('public')->exists($settings->default_image)) {
                    Storage::disk('public')->delete($settings->default_image);
                }

                $file = $request->file('default_image');
                $filename = time() . '_default_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('', $filename, 'public');
                $settings->default_image = $path;
                
                \Log::info('Default image uploaded:', ['path' => $path, 'url' => asset('storage/' . $path)]);
            }

            $settings->save();

            return response()->json([
                'success' => true,
                'message' => 'Settings updated successfully',
                'data' => $settings
            ]);

        } catch (\Exception $e) {
            \Log::error('Settings update error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
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