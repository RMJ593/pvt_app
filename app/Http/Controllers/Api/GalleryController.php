<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GalleryImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Cloudinary\Cloudinary;

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
        try {
            \Log::info('Gallery upload attempt', [
                'has_file' => $request->hasFile('image'),
            ]);

            $validated = $request->validate([
                'image' => 'required|image|mimes:jpeg,jpg,png,gif,webp|max:10240',
                'title' => 'required|string|max:255',
            ]);

            if (!$request->hasFile('image')) {
                return response()->json(['error' => 'No file uploaded'], 400);
            }

            $uploadedFile = $request->file('image');
            
            \Log::info('Uploading to Cloudinary...', [
                'filename' => $uploadedFile->getClientOriginalName(),
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
            
            // Upload the file with explicit timestamp
            $result = $cloudinary->uploadApi()->upload($uploadedFile->getRealPath(), [
                'folder' => 'gallery',
                'resource_type' => 'image',
                'timestamp' => time()
            ]);
            
            $imageUrl = $result['secure_url'];
            $publicId = $result['public_id'];
            
            \Log::info('Cloudinary upload successful', [
                'url' => $imageUrl,
                'public_id' => $publicId,
            ]);
            
            // Save to database (without description)
            $gallery = GalleryImage::create([
                'title' => $validated['title'],
                'image' => $imageUrl,
                'cloudinary_public_id' => $publicId,
                'is_active' => true,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Image uploaded successfully',
                'data' => $gallery
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $e->errors()
            ], 422);
            
        } catch (\Exception $e) {
            \Log::error('Gallery upload error: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'error' => 'Upload failed',
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => basename($e->getFile()),
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
            'image' => 'nullable|image|mimes:jpeg,jpg,png,gif,webp|max:10240',
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
                // Initialize Cloudinary
                $cloudinary = new Cloudinary([
                    'cloud' => [
                        'cloud_name' => config('cloudinary.cloud_name'),
                        'api_key' => config('cloudinary.api_key'),
                        'api_secret' => config('cloudinary.api_secret'),
                    ],
                ]);
                
                // Delete old image from Cloudinary if exists
                if ($image->cloudinary_public_id) {
                    try {
                        $cloudinary->uploadApi()->destroy($image->cloudinary_public_id);
                    } catch (\Exception $e) {
                        \Log::warning('Failed to delete old image from Cloudinary: ' . $e->getMessage());
                    }
                }

                // Upload new image
                $result = $cloudinary->uploadApi()->upload($request->file('image')->getRealPath(), [
                    'folder' => 'gallery',
                    'resource_type' => 'image',
                    'timestamp' => time()
                ]);
                
                $data['image'] = $result['secure_url'];
                $data['cloudinary_public_id'] = $result['public_id'];
            }

            $image->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Gallery image updated successfully',
                'data' => $image
            ]);

        } catch (\Exception $e) {
            \Log::error('Gallery image update failed: ' . $e->getMessage());
            
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
            if ($image->cloudinary_public_id) {
                try {
                    $cloudinary = new Cloudinary([
                        'cloud' => [
                            'cloud_name' => config('cloudinary.cloud_name'),
                            'api_key' => config('cloudinary.api_key'),
                            'api_secret' => config('cloudinary.api_secret'),
                        ],
                    ]);
                    
                    $cloudinary->uploadApi()->destroy($image->cloudinary_public_id);
                    \Log::info('Deleted from Cloudinary: ' . $image->cloudinary_public_id);
                } catch (\Exception $e) {
                    \Log::warning('Failed to delete from Cloudinary: ' . $e->getMessage());
                }
            }

            $image->delete();

            return response()->json([
                'success' => true,
                'message' => 'Gallery image deleted successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('Gallery image deletion failed: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete gallery image',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}