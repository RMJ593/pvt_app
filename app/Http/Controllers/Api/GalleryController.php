<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GalleryImage; // Changed from Gallery to GalleryImage
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Cloudinary\Cloudinary;

class GalleryController extends Controller
{
    /**
     * Display a listing of gallery images
     */
    public function index()
    {
        try {
            $images = GalleryImage::orderBy('created_at', 'desc')->get();
            
            return response()->json([
                'success' => true,
                'data' => $images
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to fetch gallery images', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch gallery images',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created gallery image
     */
    public function store(Request $request)
    {
        \Log::info('=== GALLERY STORE REQUEST ===');
        \Log::info('Request Data', $request->all());
        \Log::info('Has File', ['has_image' => $request->hasFile('image')]);
        
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'image' => 'required|image|mimes:jpeg,jpg,png,gif,webp|max:5120', // 5MB max for gallery
            'is_active' => 'nullable'
        ]);

        if ($validator->fails()) {
            \Log::error('Validation failed', $validator->errors()->toArray());
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = [
                'title' => $request->title,
                'is_active' => $request->is_active == '1' || $request->is_active === true || !$request->has('is_active')
            ];

            // Handle image upload to Cloudinary
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                
                \Log::info('Uploading gallery image to Cloudinary', [
                    'filename' => $file->getClientOriginalName(),
                    'size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                ]);

                if (!$file->isValid()) {
                    throw new \Exception('Uploaded file is not valid');
                }

                // Initialize Cloudinary
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
                
                // Upload image to Cloudinary
                $result = $cloudinary->uploadApi()->upload(
                    $file->getRealPath(),
                    [
                        'folder' => 'gallery',
                        'resource_type' => 'image',
                        'quality' => 'auto',
                        'fetch_format' => 'auto'
                    ]
                );
                
                if (!isset($result['secure_url'])) {
                    throw new \Exception('Cloudinary upload failed - no URL returned');
                }
                
                $data['image'] = $result['secure_url'];
                $data['cloudinary_public_id'] = $result['public_id'];
                
                \Log::info('Gallery image uploaded to Cloudinary successfully', [
                    'url' => $result['secure_url'],
                    'public_id' => $result['public_id']
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'No image file uploaded'
                ], 422);
            }

            $gallery = GalleryImage::create($data);
            
            \Log::info('Gallery image created successfully', ['id' => $gallery->id]);

            return response()->json([
                'success' => true,
                'message' => 'Gallery image created successfully',
                'data' => $gallery
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Gallery creation failed', [
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

    /**
     * Display the specified gallery image
     */
    public function show($id)
    {
        try {
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
        } catch (\Exception $e) {
            \Log::error('Failed to fetch gallery image', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch gallery image'
            ], 500);
        }
    }

    /**
     * Update the specified gallery image
     */
    public function update(Request $request, $id)
    {
        \Log::info('=== GALLERY UPDATE REQUEST ===');
        \Log::info('ID', ['id' => $id]);
        \Log::info('Request Data', $request->all());
        
        $gallery = GalleryImage::find($id);

        if (!$gallery) {
            return response()->json([
                'success' => false,
                'message' => 'Gallery image not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,jpg,png,gif,webp|max:5120',
            'is_active' => 'nullable'
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
                $data['is_active'] = $request->is_active == '1' || $request->is_active === true;
            }

            // Handle image upload if new image provided
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                
                \Log::info('Updating gallery image on Cloudinary');

                $cloudinary = new Cloudinary([
                    'cloud' => [
                        'cloud_name' => config('cloudinary.cloud_name'),
                        'api_key' => config('cloudinary.api_key'),
                        'api_secret' => config('cloudinary.api_secret'),
                    ],
                ]);
                
                // Delete old image from Cloudinary if exists
                if ($gallery->cloudinary_public_id) {
                    try {
                        $cloudinary->uploadApi()->destroy($gallery->cloudinary_public_id, [
                            'resource_type' => 'image'
                        ]);
                        \Log::info('Deleted old gallery image from Cloudinary', [
                            'public_id' => $gallery->cloudinary_public_id
                        ]);
                    } catch (\Exception $e) {
                        \Log::warning('Failed to delete old image from Cloudinary', [
                            'error' => $e->getMessage()
                        ]);
                    }
                }

                // Upload new image
                $result = $cloudinary->uploadApi()->upload(
                    $file->getRealPath(),
                    [
                        'folder' => 'gallery',
                        'resource_type' => 'image',
                        'quality' => 'auto',
                        'fetch_format' => 'auto'
                    ]
                );
                
                $data['image'] = $result['secure_url'];
                $data['cloudinary_public_id'] = $result['public_id'];
                
                \Log::info('Gallery image updated on Cloudinary', [
                    'url' => $result['secure_url']
                ]);
            }

            $gallery->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Gallery image updated successfully',
                'data' => $gallery
            ]);

        } catch (\Exception $e) {
            \Log::error('Gallery update failed', [
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

    /**
     * Remove the specified gallery image
     */
    public function destroy($id)
    {
        $gallery = GalleryImage::find($id);

        if (!$gallery) {
            return response()->json([
                'success' => false,
                'message' => 'Gallery image not found'
            ], 404);
        }

        try {
            // Delete from Cloudinary if exists
            if ($gallery->cloudinary_public_id) {
                $cloudinary = new Cloudinary([
                    'cloud' => [
                        'cloud_name' => config('cloudinary.cloud_name'),
                        'api_key' => config('cloudinary.api_key'),
                        'api_secret' => config('cloudinary.api_secret'),
                    ],
                ]);
                
                try {
                    $cloudinary->uploadApi()->destroy($gallery->cloudinary_public_id, [
                        'resource_type' => 'image'
                    ]);
                    \Log::info('Deleted gallery image from Cloudinary', [
                        'public_id' => $gallery->cloudinary_public_id
                    ]);
                } catch (\Exception $e) {
                    \Log::warning('Failed to delete from Cloudinary', [
                        'error' => $e->getMessage()
                    ]);
                }
            }

            $gallery->delete();

            return response()->json([
                'success' => true,
                'message' => 'Gallery image deleted successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('Gallery deletion failed', [
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete gallery image',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}