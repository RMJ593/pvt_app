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

            // Handle file uploads
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

            // Update all other fields from the request
            $fillableFields = [
                'main_color', 'white_color', 'color_one', 'color_two', 'color_three',
                'color_four', 'color_five', 'color_six', 'color_seven', 'color_eight',
                'black_color', 'text_color', 'heading_color',
                'admin_emails', 'short_about', 'contact_address', 'contact_phone',
                'contact_email', 'meta_description', 'meta_keywords',
                'facebook_url', 'twitter_url', 'instagram_url', 'linkedin_url', 'youtube_url',
                'head_code', 'footer_code', 'body_code'
            ];

            foreach ($fillableFields as $field) {
                if ($request->has($field)) {
                    $settings->$field = $request->input($field);
                }
            }

            // Special handling for site_name (stored in 'value' column)
            if ($request->has('site_name')) {
                $settings->value = $request->input('site_name');
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