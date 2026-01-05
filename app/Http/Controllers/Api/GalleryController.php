<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GalleryImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;

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
                // Upload to Cloudinary
                $uploadedFile = Cloudinary::upload($request->file('image')->getRealPath(), [
                    'folder' => 'restaurant/gallery',
                    'resource_type' => 'image'
                ]);
                
                // Store Cloudinary URL
                $data['image'] = $uploadedFile->getSecurePath();
                
                \Log::info('Gallery image uploaded to Cloudinary:', [
                    'url' => $uploadedFile->getSecurePath(),
                    'public_id' => $uploadedFile->getPublicId()
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
                // Delete old image from Cloudinary if exists
                if ($image->image) {
                    $this->deleteFromCloudinary($image->image);
                }

                // Upload new image to Cloudinary
                $uploadedFile = Cloudinary::upload($request->file('image')->getRealPath(), [
                    'folder' => 'restaurant/gallery',
                    'resource_type' => 'image'
                ]);
                
                $data['image'] = $uploadedFile->getSecurePath();
                
                \Log::info('Gallery image updated on Cloudinary:', [
                    'url' => $uploadedFile->getSecurePath()
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
                'error' => $e->getMessage()
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
            // Delete from Cloudinary
            if ($image->image) {
                $this->deleteFromCloudinary($image->image);
            }

            $image->delete();

            return response()->json([
                'success' => true,
                'message' => 'Gallery image deleted successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('Gallery image deletion failed:', [
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete gallery image',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete image from Cloudinary
     */
    private function deleteFromCloudinary($imageUrl)
    {
        try {
            // Extract public_id from Cloudinary URL
            // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}.jpg
            if (preg_match('/\/v\d+\/(.+)\.\w+$/', $imageUrl, $matches)) {
                $publicId = $matches[1];
                Cloudinary::destroy($publicId);
                \Log::info('Deleted from Cloudinary:', ['public_id' => $publicId]);
            }
        } catch (\Exception $e) {
            \Log::warning('Failed to delete from Cloudinary:', ['error' => $e->getMessage()]);
        }
    }
}