<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class SettingsController extends Controller
{
    public function index()
    {
        try {
            // Get all settings from key-value table
            $settingsRows = DB::table('settings')->get();
            
            // Convert to associative array
            $settings = [];
            foreach ($settingsRows as $row) {
                $settings[$row->key] = $row->value;
            }
            
            // Add additional fields from table columns
            $settingsRecord = DB::table('settings')->first();
            if ($settingsRecord) {
                $settings['default_image'] = $settingsRecord->default_image;
                $settings['popup_ad_image'] = $settingsRecord->popup_ad_image;
                $settings['booking_schedule'] = json_decode($settingsRecord->booking_schedule, true);
                $settings['first_value'] = $settingsRecord->first_value;
                $settings['first_name'] = $settingsRecord->first_name;
                $settings['second_value'] = $settingsRecord->second_value;
                $settings['second_name'] = $settingsRecord->second_name;
                $settings['third_value'] = $settingsRecord->third_value;
                $settings['third_name'] = $settingsRecord->third_name;
                $settings['fourth_value'] = $settingsRecord->fourth_value;
                $settings['fourth_name'] = $settingsRecord->fourth_name;
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
            // Update key-value settings
            foreach ($request->except(['popup_ad_image', 'default_image', 'website_logo']) as $key => $value) {
                DB::table('settings')->updateOrInsert(
                    ['key' => $key],
                    [
                        'value' => $value,
                        'type' => 'text',
                        'group' => 'general',
                        'updated_at' => now()
                    ]
                );
            }

            // Handle file uploads (these go in table columns, not key-value)
            $settingsRecord = DB::table('settings')->first();
            $data = [];

            if ($request->hasFile('popup_ad_image')) {
                $path = $request->file('popup_ad_image')->store('settings/popup', 'public');
                $data['popup_ad_image'] = $path;
            }

            if ($request->hasFile('default_image')) {
                $path = $request->file('default_image')->store('settings/default', 'public');
                $data['default_image'] = $path;
            }

            if ($request->hasFile('website_logo')) {
                $path = $request->file('website_logo')->store('settings/logo', 'public');
                DB::table('settings')->updateOrInsert(
                    ['key' => 'website_logo'],
                    [
                        'value' => $path,
                        'type' => 'file',
                        'group' => 'general',
                        'updated_at' => now()
                    ]
                );
            }

            if (!empty($data) && $settingsRecord) {
                DB::table('settings')->where('id', $settingsRecord->id)->update($data);
            }

            return response()->json([
                'success' => true,
                'message' => 'Settings updated successfully'
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