<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GalleryImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class GalleryController extends Controller
{
    public function index()
    {
        $images = GalleryImage::orderBy('created_at', 'desc')->get();
        
        return response()->json([
            'success' => true,
            'data' => $images
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'image' => 'required|image|mimes:jpeg,jpg,png,gif,webp|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = [
                'title' => $request->title,
                'is_active' => true
            ];

            if ($request->hasFile('image')) {
                $image = $request->file('image');
                
                // Store directly in public disk root (not in 'gallery' subfolder)
                // This creates: storage/app/public/filename.jpg
                // Accessible via: /storage/filename.jpg
                $imageName = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                $imagePath = $image->storeAs('', $imageName, 'public');
                
                $data['image'] = $imagePath;
                
                \Log::info('Gallery image uploaded:', [
                    'original_name' => $image->getClientOriginalName(),
                    'saved_as' => $imageName,
                    'path' => $imagePath,
                    'url' => asset('storage/' . $imagePath)
                ]);
            }

            $galleryImage = GalleryImage::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Gallery image created successfully',
                'data' => $galleryImage
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Gallery image creation failed:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create gallery image',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        $image = GalleryImage::find($id);

        if (!$image) {
            return response()->json([
                'success' => false,
                'message' => 'Gallery image not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $image
        ]);
    }

    public function update(Request $request, $id)
    {
        $image = GalleryImage::find($id);

        if (!$image) {
            return response()->json([
                'success' => false,
                'message' => 'Gallery image not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,jpg,png,gif,webp|max:2048',
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
            $data = [];
            
            if ($request->has('title')) {
                $data['title'] = $request->title;
            }
            
            if ($request->has('is_active')) {
                $data['is_active'] = (bool)$request->is_active;
            }

            if ($request->hasFile('image')) {
                // Delete old image if exists
                if ($image->image && Storage::disk('public')->exists($image->image)) {
                    Storage::disk('public')->delete($image->image);
                    \Log::info('Old gallery image deleted:', ['path' => $image->image]);
                }

                $newImage = $request->file('image');
                $imageName = time() . '_' . uniqid() . '.' . $newImage->getClientOriginalExtension();
                $imagePath = $newImage->storeAs('', $imageName, 'public');
                $data['image'] = $imagePath;
                
                \Log::info('Gallery image updated:', [
                    'path' => $imagePath,
                    'url' => asset('storage/' . $imagePath)
                ]);
            }

            $image->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Gallery image updated successfully',
                'data' => $image
            ]);

        } catch (\Exception $e) {
            \Log::error('Gallery image update failed:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update gallery image',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        $image = GalleryImage::find($id);

        if (!$image) {
            return response()->json([
                'success' => false,
                'message' => 'Gallery image not found'
            ], 404);
        }

        try {
            // Delete image file if exists
            if ($image->image && Storage::disk('public')->exists($image->image)) {
                Storage::disk('public')->delete($image->image);
                \Log::info('Gallery image file deleted:', ['path' => $image->image]);
            }

            $image->delete();

            return response()->json([
                'success' => true,
                'message' => 'Gallery image deleted successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('Gallery image deletion failed:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete gallery image',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}