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
            // Get all settings and convert to key-value array
            $settings = Setting::all();
            
            $settingsArray = [];
            foreach ($settings as $setting) {
                $settingsArray[$setting->key] = $setting->value;
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
            \Log::info('Settings update request:', $request->all());

            // Get all input data
            $data = $request->all();

            // Initialize Cloudinary for file uploads
            $cloudinary = new Cloudinary([
                'cloud' => [
                    'cloud_name' => config('cloudinary.cloud_name'),
                    'api_key' => config('cloudinary.api_key'),
                    'api_secret' => config('cloudinary.api_secret'),
                ],
                'url' => ['secure' => true]
            ]);

            // Handle file uploads first
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

                $data['website_logo'] = $result['secure_url'];
                \Log::info('Logo uploaded:', ['url' => $result['secure_url']]);
            }

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

                $data['meta_image'] = $result['secure_url'];
                \Log::info('Meta image uploaded:', ['url' => $result['secure_url']]);
            }

            // Update or create each setting
            foreach ($data as $key => $value) {
                // Skip files that were already handled
                if ($key === 'website_logo' && $request->hasFile('website_logo')) continue;
                if ($key === 'meta_image' && $request->hasFile('meta_image')) continue;

                // Skip Laravel/PHP internal keys
                if (in_array($key, ['_method', '_token'])) continue;

                Setting::updateOrCreate(
                    ['key' => $key],
                    [
                        'value' => is_array($value) ? json_encode($value) : $value,
                        'type' => 'text',
                        'group' => 'general'
                    ]
                );
            }

            return response()->json([
                'success' => true,
                'message' => 'Settings updated successfully'
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