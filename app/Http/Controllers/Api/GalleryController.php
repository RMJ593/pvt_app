<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GalleryImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class GalleryController extends Controller
{
    public function index()
    {
        try {
            $images = GalleryImage::orderBy('created_at', 'desc')->get();
            return response()->json([
                'success' => true,
                'data' => $images
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching gallery images: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch gallery images'
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
                'is_active' => 'nullable'
            ]);

            $imageUrl = null;
            $cloudinaryPublicId = null;
            
            if ($request->hasFile('image')) {
                try {
                    if (class_exists(\CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary::class) && 
                        config('cloudinary.cloud_name')) {
                        
                        $uploadResult = \CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary::upload(
                            $request->file('image')->getRealPath(),
                            ['folder' => 'resto_int/gallery', 'resource_type' => 'image']
                        );
                        
                        $imageUrl = $uploadResult->getSecurePath();
                        $cloudinaryPublicId = $uploadResult->getPublicId();
                        
                        Log::info('Gallery image uploaded to Cloudinary: ' . $imageUrl);
                    } else {
                        throw new \Exception('Cloudinary not configured');
                    }
                } catch (\Exception $e) {
                    Log::warning('Cloudinary upload failed: ' . $e->getMessage());
                    $imageUrl = $request->file('image')->store('gallery', 'public');
                }
            }

            $gallery = GalleryImage::create([
                'title' => $validated['title'],
                'image' => $imageUrl,
                'cloudinary_public_id' => $cloudinaryPublicId,
                'is_active' => $request->is_active === '1' || $request->is_active === 1 || $request->is_active === true || !$request->has('is_active')
            ]);

            return response()->json([
                'success' => true,
                'data' => $gallery,
                'message' => 'Gallery image created successfully'
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error creating gallery image: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create gallery image: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $gallery = GalleryImage::findOrFail($id);
            return response()->json([
                'success' => true,
                'data' => $gallery
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gallery image not found'
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $gallery = GalleryImage::findOrFail($id);

            $validated = $request->validate([
                'title' => 'sometimes|required|string|max:255',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
                'is_active' => 'sometimes'
            ]);

            $data = [];
            
            if ($request->has('title')) $data['title'] = $validated['title'];

            if ($request->hasFile('image')) {
                try {
                    if (class_exists(\CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary::class) && 
                        config('cloudinary.cloud_name')) {
                        
                        // Delete old image from Cloudinary if exists
                        if ($gallery->cloudinary_public_id) {
                            try {
                                \CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary::destroy($gallery->cloudinary_public_id);
                            } catch (\Exception $e) {
                                Log::warning('Failed to delete old Cloudinary image: ' . $e->getMessage());
                            }
                        }
                        
                        $uploadResult = \CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary::upload(
                            $request->file('image')->getRealPath(),
                            ['folder' => 'resto_int/gallery', 'resource_type' => 'image']
                        );
                        
                        $data['image'] = $uploadResult->getSecurePath();
                        $data['cloudinary_public_id'] = $uploadResult->getPublicId();
                    } else {
                        throw new \Exception('Cloudinary not configured');
                    }
                } catch (\Exception $e) {
                    if ($gallery->image && !filter_var($gallery->image, FILTER_VALIDATE_URL)) {
                        Storage::disk('public')->delete($gallery->image);
                    }
                    $data['image'] = $request->file('image')->store('gallery', 'public');
                    $data['cloudinary_public_id'] = null;
                }
            }

            if ($request->has('is_active')) {
                $data['is_active'] = $request->is_active === '1' || $request->is_active === 1 || $request->is_active === true;
            }

            $gallery->update($data);

            return response()->json([
                'success' => true,
                'data' => $gallery,
                'message' => 'Gallery image updated successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error updating gallery image: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update gallery image'
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $gallery = GalleryImage::findOrFail($id);
            
            // Delete from Cloudinary if exists
            if ($gallery->cloudinary_public_id) {
                try {
                    \CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary::destroy($gallery->cloudinary_public_id);
                } catch (\Exception $e) {
                    Log::warning('Failed to delete Cloudinary image: ' . $e->getMessage());
                }
            } elseif ($gallery->image && !filter_var($gallery->image, FILTER_VALIDATE_URL)) {
                Storage::disk('public')->delete($gallery->image);
            }

            $gallery->delete();

            return response()->json([
                'success' => true,
                'message' => 'Gallery image deleted successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error deleting gallery image: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete gallery image'
            ], 500);
        }
    }
}