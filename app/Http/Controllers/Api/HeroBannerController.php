<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HeroBanner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;

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
                // Upload video to Cloudinary
                $uploadedFile = Cloudinary::uploadVideo($request->file('image')->getRealPath(), [
                    'folder' => 'restaurant/hero-banners',
                    'resource_type' => 'video'
                ]);
                
                // Store Cloudinary URL
                $data['image_path'] = $uploadedFile->getSecurePath();
                
                \Log::info('Hero banner video uploaded to Cloudinary:', [
                    'url' => $uploadedFile->getSecurePath(),
                    'public_id' => $uploadedFile->getPublicId()
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
                // Delete old video from Cloudinary if exists
                if ($banner->image_path) {
                    $this->deleteFromCloudinary($banner->image_path);
                }

                // Upload new video to Cloudinary
                $uploadedFile = Cloudinary::uploadVideo($request->file('image')->getRealPath(), [
                    'folder' => 'restaurant/hero-banners',
                    'resource_type' => 'video'
                ]);
                
                $data['image_path'] = $uploadedFile->getSecurePath();
                
                \Log::info('Hero banner video updated on Cloudinary:', [
                    'url' => $uploadedFile->getSecurePath()
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
                'error' => $e->getMessage()
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
            // Delete from Cloudinary
            if ($banner->image_path) {
                $this->deleteFromCloudinary($banner->image_path);
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
    private function deleteFromCloudinary($videoUrl)
    {
        try {
            // Extract public_id from Cloudinary URL
            if (preg_match('/\/v\d+\/(.+)\.\w+$/', $videoUrl, $matches)) {
                $publicId = $matches[1];
                Cloudinary::destroy($publicId, ['resource_type' => 'video']);
                \Log::info('Deleted video from Cloudinary:', ['public_id' => $publicId]);
            }
        } catch (\Exception $e) {
            \Log::warning('Failed to delete from Cloudinary:', ['error' => $e->getMessage()]);
        }
    }
}