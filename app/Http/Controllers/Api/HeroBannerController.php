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
            'image' => 'required|file|mimes:mp4,webm,ogg,mov,avi|max:102400', // 100MB in KB - Changed to accept videos
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
            $data = $request->only(['title', 'subtitle', 'button_text', 'button_link', 'order']);
            $data['is_active'] = $request->has('is_active') ? (bool)$request->is_active : true;

            // Handle video upload (field name is still 'image' for backward compatibility)
            if ($request->hasFile('image')) {
                $video = $request->file('image');
                $videoName = time() . '_' . $video->getClientOriginalName();
                $videoPath = $video->storeAs('hero-banners', $videoName, 'public');
                $data['image_path'] = $videoPath;
            }

            $banner = HeroBanner::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Hero banner created successfully',
                'data' => $banner
            ], 201);

        } catch (\Exception $e) {
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
            'image' => 'nullable|file|mimes:mp4,webm,ogg,mov,avi|max:102400', // 100MB - Video optional on update
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
            $data = $request->only(['title', 'subtitle', 'button_text', 'button_link', 'order']);
            
            if ($request->has('is_active')) {
                $data['is_active'] = (bool)$request->is_active;
            }

            // Handle video upload
            if ($request->hasFile('image')) {
                // Delete old video if exists
                if ($banner->image_path && Storage::disk('public')->exists($banner->image_path)) {
                    Storage::disk('public')->delete($banner->image_path);
                }

                $video = $request->file('image');
                $videoName = time() . '_' . $video->getClientOriginalName();
                $videoPath = $video->storeAs('hero-banners', $videoName, 'public');
                $data['image_path'] = $videoPath;
            }

            $banner->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Hero banner updated successfully',
                'data' => $banner
            ]);

        } catch (\Exception $e) {
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
            }

            $banner->delete();

            return response()->json([
                'success' => true,
                'message' => 'Hero banner deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete hero banner',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}