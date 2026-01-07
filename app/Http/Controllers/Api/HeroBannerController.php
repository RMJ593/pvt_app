<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HeroBanner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Cloudinary\Cloudinary;

class HeroBannerController extends Controller
{
    public function index()
    {
        $banners = HeroBanner::orderBy('order', 'asc')->get();
        
        // Add full_url for backward compatibility
        $banners->transform(function ($banner) {
            $banner->full_url = $banner->image_path;
            return $banner;
        });
        
        return response()->json([
            'success' => true,
            'data' => $banners
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'image' => 'required|file|mimes:mp4,webm,ogg,mov|max:102400', // 100MB
            'button_text' => 'nullable|string|max:255',
            'button_link' => 'nullable|string|max:255',
            'order' => 'nullable|integer',
            'is_active' => 'nullable|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $request->only(['title', 'subtitle', 'description', 'button_text', 'button_link', 'order']);
            $data['is_active'] = $request->has('is_active') ? (bool)$request->is_active : true;

            if ($request->hasFile('image')) {
                \Log::info('Uploading video to Cloudinary...', [
                    'filename' => $request->file('image')->getClientOriginalName(),
                    'size' => $request->file('image')->getSize(),
                ]);

                // Initialize Cloudinary with credentials
                $cloudinary = new Cloudinary([
                    'cloud' => [
                        'cloud_name' => config('cloudinary.cloud_name'),
                        'api_key' => config('cloudinary.api_key'),
                        'api_secret' => config('cloudinary.api_secret'),
                    ],
                    'url' => [
                        'secure' => true
                    ]
                ]);
                
                // Upload video to Cloudinary
                $result = $cloudinary->uploadApi()->upload(
                    $request->file('image')->getRealPath(),
                    [
                        'folder' => 'hero-banners',
                        'resource_type' => 'video',
                        'timestamp' => time()
                    ]
                );
                
                // Store Cloudinary URL
                $data['image_path'] = $result['secure_url'];
                
                \Log::info('Hero banner video uploaded to Cloudinary:', [
                    'url' => $result['secure_url'],
                    'public_id' => $result['public_id']
                ]);
            }

            $banner = HeroBanner::create($data);
            $banner->full_url = $banner->image_path;

            return response()->json([
                'success' => true,
                'message' => 'Hero banner created successfully',
                'data' => $banner
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Hero banner creation failed:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create hero banner',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        $banner = HeroBanner::find($id);

        if (!$banner) {
            return response()->json([
                'success' => false,
                'message' => 'Hero banner not found'
            ], 404);
        }

        $banner->full_url = $banner->image_path;

        return response()->json([
            'success' => true,
            'data' => $banner
        ]);
    }

    public function update(Request $request, $id)
    {
        $banner = HeroBanner::find($id);

        if (!$banner) {
            return response()->json([
                'success' => false,
                'message' => 'Hero banner not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|file|mimes:mp4,webm,ogg,mov|max:102400',
            'button_text' => 'nullable|string|max:255',
            'button_link' => 'nullable|string|max:255',
            'order' => 'nullable|integer',
            'is_active' => 'nullable|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $request->only(['title', 'subtitle', 'description', 'button_text', 'button_link', 'order']);
            
            if ($request->has('is_active')) {
                $data['is_active'] = (bool)$request->is_active;
            }

            if ($request->hasFile('image')) {
                \Log::info('Updating video on Cloudinary...', [
                    'filename' => $request->file('image')->getClientOriginalName(),
                ]);

                // Initialize Cloudinary
                $cloudinary = new Cloudinary([
                    'cloud' => [
                        'cloud_name' => config('cloudinary.cloud_name'),
                        'api_key' => config('cloudinary.api_key'),
                        'api_secret' => config('cloudinary.api_secret'),
                    ],
                ]);
                
                // Delete old video from Cloudinary if exists
                if ($banner->image_path && strpos($banner->image_path, 'cloudinary.com') !== false) {
                    $this->deleteFromCloudinary($banner->image_path, $cloudinary);
                }

                // Upload new video to Cloudinary
                $result = $cloudinary->uploadApi()->upload(
                    $request->file('image')->getRealPath(),
                    [
                        'folder' => 'hero-banners',
                        'resource_type' => 'video',
                        'timestamp' => time()
                    ]
                );
                
                $data['image_path'] = $result['secure_url'];
                
                \Log::info('Hero banner video updated on Cloudinary:', [
                    'url' => $result['secure_url']
                ]);
            }

            $banner->update($data);
            $banner->full_url = $banner->image_path;

            return response()->json([
                'success' => true,
                'message' => 'Hero banner updated successfully',
                'data' => $banner
            ]);

        } catch (\Exception $e) {
            \Log::error('Hero banner update failed:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update hero banner',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        $banner = HeroBanner::find($id);

        if (!$banner) {
            return response()->json([
                'success' => false,
                'message' => 'Hero banner not found'
            ], 404);
        }

        try {
            // Initialize Cloudinary
            $cloudinary = new Cloudinary([
                'cloud' => [
                    'cloud_name' => config('cloudinary.cloud_name'),
                    'api_key' => config('cloudinary.api_key'),
                    'api_secret' => config('cloudinary.api_secret'),
                ],
            ]);
            
            // Delete from Cloudinary
            if ($banner->image_path && strpos($banner->image_path, 'cloudinary.com') !== false) {
                $this->deleteFromCloudinary($banner->image_path, $cloudinary);
            }

            $banner->delete();

            return response()->json([
                'success' => true,
                'message' => 'Hero banner deleted successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('Hero banner deletion failed:', [
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete hero banner',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete video from Cloudinary
     */
    private function deleteFromCloudinary($videoUrl, $cloudinary)
    {
        try {
            // Extract public_id from Cloudinary URL
            // URL format: https://res.cloudinary.com/{cloud_name}/video/upload/v{version}/{public_id}.mp4
            if (preg_match('/\/v\d+\/(.+)\.\w+$/', $videoUrl, $matches)) {
                $publicId = $matches[1];
                $cloudinary->uploadApi()->destroy($publicId, ['resource_type' => 'video']);
                \Log::info('Deleted video from Cloudinary:', ['public_id' => $publicId]);
            }
        } catch (\Exception $e) {
            \Log::warning('Failed to delete from Cloudinary:', ['error' => $e->getMessage()]);
        }
    }
}