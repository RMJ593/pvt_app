<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class SettingsController extends Controller
{
    public function index()
    {
        try {
            $settings = Setting::first();
            
            if (!$settings) {
                $settings = Setting::create([]);
            }
            
            return response()->json([
                'success' => true,
                'data' => $settings
            ]);
        } catch (\Exception $e) {
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
                $settings = Setting::create([]);
            }

            $data = $request->except(['popup_ad_image', 'default_image', 'website_logo', 'meta_image']);

            // Handle Popup Ad Image
            if ($request->hasFile('popup_ad_image')) {
                if ($settings->popup_ad_image) {
                    Storage::disk('public')->delete($settings->popup_ad_image);
                }
                $data['popup_ad_image'] = $request->file('popup_ad_image')->store('settings/popup', 'public');
            }

            // Handle Default Image
            if ($request->hasFile('default_image')) {
                if ($settings->default_image) {
                    Storage::disk('public')->delete($settings->default_image);
                }
                $data['default_image'] = $request->file('default_image')->store('settings/default', 'public');
            }

            // Handle Website Logo
            if ($request->hasFile('website_logo')) {
                if ($settings->website_logo) {
                    Storage::disk('public')->delete($settings->website_logo);
                }
                $data['website_logo'] = $request->file('website_logo')->store('settings/logo', 'public');
            }

            // Handle Meta Image
            if ($request->hasFile('meta_image')) {
                if ($settings->meta_image) {
                    Storage::disk('public')->delete($settings->meta_image);
                }
                $data['meta_image'] = $request->file('meta_image')->store('settings/meta', 'public');
            }

            // Handle boolean fields
            $booleanFields = [
                'enable_popup_ad',
                'show_open_times',
                'show_first_time',
                'show_second_time',
                'recaptcha_enable'
            ];

            foreach ($booleanFields as $field) {
                if ($request->has($field)) {
                    $data[$field] = $request->$field == '1' || $request->$field === true;
                }
            }

            // Handle JSON fields
            if ($request->has('booking_schedule')) {
                $data['booking_schedule'] = is_string($request->booking_schedule) 
                    ? json_decode($request->booking_schedule, true) 
                    : $request->booking_schedule;
            }

            if ($request->has('special_off_days')) {
                $data['special_off_days'] = is_string($request->special_off_days) 
                    ? json_decode($request->special_off_days, true) 
                    : $request->special_off_days;
            }

            $settings->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Settings updated successfully',
                'data' => $settings
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}