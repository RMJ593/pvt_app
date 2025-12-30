<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class SettingsController extends Controller
{
    /**
     * Get all settings grouped by category
     */
    public function index()
    {
        $allSettings = Setting::all();
        $settings = [];

        foreach ($allSettings as $setting) {
            $settings[$setting->key] = $setting->value;
        }

        return response()->json([
            'success' => true,
            'data' => $settings
        ]);
    }

    /**
     * Update settings
     */
    public function update(Request $request)
    {
        try {
            $data = $request->all();
            
            foreach ($data as $key => $value) {
                // Skip Laravel method spoofing field
                if ($key === '_method') {
                    continue;
                }

                // Determine the type and group
                $type = 'text';
                $group = 'general';

                // Handle file uploads
                if ($request->hasFile($key)) {
                    $file = $request->file($key);
                    
                    // Delete old file if exists
                    $oldSetting = Setting::where('key', $key)->first();
                    if ($oldSetting && $oldSetting->value && Storage::disk('public')->exists($oldSetting->value)) {
                        Storage::disk('public')->delete($oldSetting->value);
                    }

                    // Store new file
                    $path = $file->store('settings', 'public');
                    $value = $path;
                    $type = 'file';
                }

                // Determine group based on key prefix
                if (str_starts_with($key, 'social_')) {
                    $group = 'social';
                } elseif (str_starts_with($key, 'contact_')) {
                    $group = 'contact';
                } elseif (str_starts_with($key, 'seo_')) {
                    $group = 'seo';
                }

                Setting::set($key, $value, $type, $group);
            }

            // Get updated settings
            $updatedSettings = Setting::getAll();

            return response()->json([
                'success' => true,
                'message' => 'Settings updated successfully',
                'data' => $updatedSettings
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update settings: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Clear cache
     */
    public function clearCache()
    {
        try {
            Cache::flush();
            Artisan::call('config:clear');
            Artisan::call('cache:clear');
            Artisan::call('view:clear');
            Artisan::call('route:clear');

            return response()->json([
                'success' => true,
                'message' => 'Cache cleared successfully!'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to clear cache: ' . $e->getMessage()
            ], 500);
        }
    }
}