<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SettingsController extends Controller
{
    public function index()
    {
        try {
            // Get all settings rows
            $settingsRows = DB::table('settings')->get();
            
            if ($settingsRows->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'data' => []
                ]);
            }
            
            // Build settings array from key-value pairs
            $settings = [];
            $firstRow = $settingsRows->first();
            
            // Get all key-value pairs from all rows
            foreach ($settingsRows as $row) {
                if ($row->key && $row->value) {
                    $settings[$row->key] = $row->value;
                }
            }
            
            // Add the column-based settings from first row
            $settings['default_image'] = $firstRow->default_image;
            $settings['popup_ad_image'] = $firstRow->popup_ad_image;
            $settings['popup_ad_url'] = $firstRow->popup_ad_url;
            $settings['booking_schedule'] = $firstRow->booking_schedule ? json_decode($firstRow->booking_schedule, true) : null;
            $settings['first_value'] = $firstRow->first_value;
            $settings['first_name'] = $firstRow->first_name;
            $settings['second_value'] = $firstRow->second_value;
            $settings['second_name'] = $firstRow->second_name;
            $settings['third_value'] = $firstRow->third_value;
            $settings['third_name'] = $firstRow->third_name;
            $settings['fourth_value'] = $firstRow->fourth_value;
            $settings['fourth_name'] = $firstRow->fourth_name;
            $settings['youtube_url'] = $firstRow->youtube_url ?? '';
            $settings['facebook_url'] = $firstRow->facebook_url ?? '';
            $settings['instagram_url'] = $firstRow->instagram_url ?? '';
            
            return response()->json([
                'success' => true,
                'data' => $settings
            ]);
        } catch (\Exception $e) {
            \Log::error('Settings Error: ' . $e->getMessage());
            
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
            foreach ($request->all() as $key => $value) {
                if (!is_file($value) && $key !== '_token') {
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