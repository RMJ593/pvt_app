<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HeroBanner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class HeroBannerController extends Controller
{
    /**
     * Display a listing of hero banners
     */
    public function index()
    {
        $banners = HeroBanner::orderBy('order', 'asc')->get();
        
        // Add full URL to image_path for easier frontend access
        $banners->transform(function ($banner) {
            if ($banner->image_path) {
                $banner->full_url = asset('storage/' . $banner->image_path);
            }
            return $banner;
        });
        
        return response()->json([
            'success' => true,
            'data' => $banners
        ]);
    }

    /**
     * Store a newly created hero banner
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'image' => 'required|file|mimes:mp4,webm,ogg,mov|max:102400', // 100MB in KB
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

            // Handle video upload
            if ($request->hasFile('image')) {
                $video = $request->file('image');
                
                // Generate unique filename
                $videoName = time() . '_' . uniqid() . '.' . $video->getClientOriginalExtension();
                
                // Store in hero-banners folder
                $videoPath = $video->storeAs('hero-banners', $videoName, 'public');
                
                // Save relative path (without /storage/)
                $data['image_path'] = $videoPath;
                
                \Log::info('Video uploaded:', [
                    'original_name' => $video->getClientOriginalName(),
                    'saved_as' => $videoName,
                    'path' => $videoPath,
                    'full_url' => asset('storage/' . $videoPath)
                ]);
            }

            $banner = HeroBanner::create($data);
            
            // Add full URL for response
            $banner->full_url = asset('storage/' . $banner->image_path);

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

    /**
     * Display the specified hero banner
     */
    public function show($id)
    {
        $banner = HeroBanner::find($id);

        if (!$banner) {
            return response()->json([
                'success' => false,
                'message' => 'Hero banner not found'
            ], 404);
        }

        // Add full URL
        if ($banner->image_path) {
            $banner->full_url = asset('storage/' . $banner->image_path);
        }

        return response()->json([
            'success' => true,
            'data' => $banner
        ]);
    }

    /**
     * Update the specified hero banner
     */
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
            'image' => 'nullable|file|mimes:mp4,webm,ogg,mov|max:102400', // 100MB
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

            // Handle video upload
            if ($request->hasFile('image')) {
                // Delete old video if exists
                if ($banner->image_path && Storage::disk('public')->exists($banner->image_path)) {
                    Storage::disk('public')->delete($banner->image_path);
                    \Log::info('Old video deleted:', ['path' => $banner->image_path]);
                }

                $video = $request->file('image');
                $videoName = time() . '_' . uniqid() . '.' . $video->getClientOriginalExtension();
                $videoPath = $video->storeAs('hero-banners', $videoName, 'public');
                $data['image_path'] = $videoPath;
                
                \Log::info('New video uploaded:', [
                    'path' => $videoPath,
                    'full_url' => asset('storage/' . $videoPath)
                ]);
            }

            $banner->update($data);
            
            // Add full URL
            if ($banner->image_path) {
                $banner->full_url = asset('storage/' . $banner->image_path);
            }

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

    /**
     * Remove the specified hero banner
     */
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
            // Delete video if exists
            if ($banner->image_path && Storage::disk('public')->exists($banner->image_path)) {
                Storage::disk('public')->delete($banner->image_path);
                \Log::info('Video deleted:', ['path' => $banner->image_path]);
            }

            $banner->delete();

            return response()->json([
                'success' => true,
                'message' => 'Hero banner deleted successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('Hero banner deletion failed:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete hero banner',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}