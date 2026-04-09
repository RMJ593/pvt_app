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
            'title'       => 'required|string|max:255',
            'subtitle'    => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'image'       => 'nullable|file|mimes:jpeg,jpg,png,webp,gif|max:10240', // 10MB, optional
            'is_active'   => 'nullable|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors'  => $validator->errors()
            ], 422);
        }

        try {
            $data = $request->only(['title', 'subtitle', 'description']);
            $data['is_active'] = $request->has('is_active') ? (bool) $request->is_active : true;

            if ($request->hasFile('image')) {
                \Log::info('Uploading image to Cloudinary...', [
                    'filename' => $request->file('image')->getClientOriginalName(),
                    'size'     => $request->file('image')->getSize(),
                ]);

                $cloudinary = $this->cloudinaryInstance();

                $result = $cloudinary->uploadApi()->upload(
                    $request->file('image')->getRealPath(),
                    [
                        'folder'        => 'hero-banners',
                        'resource_type' => 'image',
                        'timestamp'     => time()
                    ]
                );

                $data['image_path'] = $result['secure_url'];

                \Log::info('Hero banner image uploaded to Cloudinary:', [
                    'url'       => $result['secure_url'],
                    'public_id' => $result['public_id']
                ]);
            }

            $banner = HeroBanner::create($data);
            $banner->full_url = $banner->image_path;

            return response()->json([
                'success' => true,
                'message' => 'Hero banner created successfully',
                'data'    => $banner
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Hero banner creation failed:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create hero banner',
                'error'   => $e->getMessage()
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
            'data'    => $banner
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
            'title'       => 'sometimes|required|string|max:255',
            'subtitle'    => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'image'       => 'nullable|file|mimes:jpeg,jpg,png,webp,gif|max:10240', // 10MB
            'is_active'   => 'nullable|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors'  => $validator->errors()
            ], 422);
        }

        try {
            $data = $request->only(['title', 'subtitle', 'description']);

            if ($request->has('is_active')) {
                $data['is_active'] = (bool) $request->is_active;
            }

            if ($request->hasFile('image')) {
                \Log::info('Updating image on Cloudinary...', [
                    'filename' => $request->file('image')->getClientOriginalName(),
                ]);

                $cloudinary = $this->cloudinaryInstance();

                // Delete old image from Cloudinary if exists
                if ($banner->image_path && strpos($banner->image_path, 'cloudinary.com') !== false) {
                    $this->deleteFromCloudinary($banner->image_path, $cloudinary);
                }

                $result = $cloudinary->uploadApi()->upload(
                    $request->file('image')->getRealPath(),
                    [
                        'folder'        => 'hero-banners',
                        'resource_type' => 'image',
                        'timestamp'     => time()
                    ]
                );

                $data['image_path'] = $result['secure_url'];

                \Log::info('Hero banner image updated on Cloudinary:', [
                    'url' => $result['secure_url']
                ]);
            }

            $banner->update($data);
            $banner->full_url = $banner->image_path;

            return response()->json([
                'success' => true,
                'message' => 'Hero banner updated successfully',
                'data'    => $banner
            ]);

        } catch (\Exception $e) {
            \Log::error('Hero banner update failed:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update hero banner',
                'error'   => $e->getMessage()
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
            $cloudinary = $this->cloudinaryInstance();

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
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Return a configured Cloudinary instance.
     */
    private function cloudinaryInstance(): Cloudinary
    {
        return new Cloudinary([
            'cloud' => [
                'cloud_name' => config('cloudinary.cloud_name'),
                'api_key'    => config('cloudinary.api_key'),
                'api_secret' => config('cloudinary.api_secret'),
            ],
            'url' => [
                'secure' => true
            ]
        ]);
    }

    /**
     * Delete an image from Cloudinary by its URL.
     */
    private function deleteFromCloudinary(string $imageUrl, Cloudinary $cloudinary): void
    {
        try {
            // URL format: https://res.cloudinary.com/{cloud}/image/upload/v{ver}/{public_id}.ext
            if (preg_match('/\/v\d+\/(.+)\.\w+$/', $imageUrl, $matches)) {
                $publicId = $matches[1];
                $cloudinary->uploadApi()->destroy($publicId, ['resource_type' => 'image']);
                \Log::info('Deleted image from Cloudinary:', ['public_id' => $publicId]);
            }
        } catch (\Exception $e) {
            \Log::warning('Failed to delete from Cloudinary:', ['error' => $e->getMessage()]);
        }
    }
}