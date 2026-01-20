<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;

class BlogController extends Controller
{
    public function index()
    {
        try {
            // Load blogs without forcing category relationship
            $blogs = Blog::latest()->get();
            
            // Manually load categories for blogs that have them
            $blogs->load('category');
            
            return response()->json([
                'success' => true,
                'data' => $blogs
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Blog Index Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function show($identifier)
    {
        try {
            $blog = Blog::where('id', $identifier)
                ->orWhere('slug', $identifier)
                ->firstOrFail();
            
            // Load category if it exists
            $blog->load('category');
            
            return response()->json([
                'success' => true,
                'data' => $blog
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Blog Show Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 404);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'small_description' => 'required|string',
                'category_id' => 'required|exists:blog_categories,id',
                'content' => 'required|string',
                'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
                'banner_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
                'meta_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
                'tags' => 'nullable|string',
                'seo_title' => 'nullable|string',
                'meta_keywords' => 'nullable|string',
                'meta_description' => 'nullable|string',
                'robots' => 'nullable|string',
                'og_type' => 'nullable|string',
            ]);

            // Upload main image to Cloudinary
            if ($request->hasFile('image')) {
                $uploadedFileUrl = Cloudinary::upload($request->file('image')->getRealPath(), [
                    'folder' => 'blogs',
                    'transformation' => [
                        'width' => 800,
                        'height' => 1000,
                        'crop' => 'limit',
                        'quality' => 'auto'
                    ]
                ])->getSecurePath();
                $validated['image'] = $uploadedFileUrl;
            }

            // Upload banner image to Cloudinary
            if ($request->hasFile('banner_image')) {
                $bannerUrl = Cloudinary::upload($request->file('banner_image')->getRealPath(), [
                    'folder' => 'blogs/banners',
                    'transformation' => [
                        'width' => 1880,
                        'height' => 600,
                        'crop' => 'limit',
                        'quality' => 'auto'
                    ]
                ])->getSecurePath();
                $validated['banner_image'] = $bannerUrl;
            }

            // Upload meta image to Cloudinary
            if ($request->hasFile('meta_image')) {
                $metaUrl = Cloudinary::upload($request->file('meta_image')->getRealPath(), [
                    'folder' => 'blogs/meta',
                    'transformation' => [
                        'width' => 1200,
                        'height' => 630,
                        'crop' => 'limit',
                        'quality' => 'auto'
                    ]
                ])->getSecurePath();
                $validated['meta_image'] = $metaUrl;
            }

            // Generate slug
            $slug = Str::slug($validated['title']);
            $count = Blog::where('slug', 'like', $slug . '%')->count();
            $validated['slug'] = $count > 0 ? $slug . '-' . ($count + 1) : $slug;
            
            $validated['is_active'] = true;
            $validated['status'] = 'published';

            $blog = Blog::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Blog created successfully',
                'data' => $blog
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Blog Store Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $blog = Blog::findOrFail($id);

            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'small_description' => 'required|string',
                'category_id' => 'required|exists:blog_categories,id',
                'content' => 'required|string',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
                'banner_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
                'meta_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
                'tags' => 'nullable|string',
                'seo_title' => 'nullable|string',
                'meta_keywords' => 'nullable|string',
                'meta_description' => 'nullable|string',
                'robots' => 'nullable|string',
                'og_type' => 'nullable|string',
            ]);

            // Upload new main image if provided
            if ($request->hasFile('image')) {
                // Delete old image from Cloudinary if exists
                if ($blog->image && strpos($blog->image, 'cloudinary') !== false) {
                    $this->deleteCloudinaryImage($blog->image);
                }

                $uploadedFileUrl = Cloudinary::upload($request->file('image')->getRealPath(), [
                    'folder' => 'blogs',
                    'transformation' => [
                        'width' => 800,
                        'height' => 1000,
                        'crop' => 'limit',
                        'quality' => 'auto'
                    ]
                ])->getSecurePath();
                $validated['image'] = $uploadedFileUrl;
            }

            // Upload new banner image if provided
            if ($request->hasFile('banner_image')) {
                if ($blog->banner_image && strpos($blog->banner_image, 'cloudinary') !== false) {
                    $this->deleteCloudinaryImage($blog->banner_image);
                }

                $bannerUrl = Cloudinary::upload($request->file('banner_image')->getRealPath(), [
                    'folder' => 'blogs/banners',
                    'transformation' => [
                        'width' => 1880,
                        'height' => 600,
                        'crop' => 'limit',
                        'quality' => 'auto'
                    ]
                ])->getSecurePath();
                $validated['banner_image'] = $bannerUrl;
            }

            // Upload new meta image if provided
            if ($request->hasFile('meta_image')) {
                if ($blog->meta_image && strpos($blog->meta_image, 'cloudinary') !== false) {
                    $this->deleteCloudinaryImage($blog->meta_image);
                }

                $metaUrl = Cloudinary::upload($request->file('meta_image')->getRealPath(), [
                    'folder' => 'blogs/meta',
                    'transformation' => [
                        'width' => 1200,
                        'height' => 630,
                        'crop' => 'limit',
                        'quality' => 'auto'
                    ]
                ])->getSecurePath();
                $validated['meta_image'] = $metaUrl;
            }

            // Update slug if title changed
            if ($validated['title'] !== $blog->title) {
                $slug = Str::slug($validated['title']);
                $count = Blog::where('slug', 'like', $slug . '%')->where('id', '!=', $blog->id)->count();
                $validated['slug'] = $count > 0 ? $slug . '-' . ($count + 1) : $slug;
            }

            $blog->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Blog updated successfully',
                'data' => $blog
            ]);

        } catch (\Exception $e) {
            \Log::error('Blog Update Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $blog = Blog::findOrFail($id);
            
            // Delete images from Cloudinary
            if ($blog->image && strpos($blog->image, 'cloudinary') !== false) {
                $this->deleteCloudinaryImage($blog->image);
            }
            if ($blog->banner_image && strpos($blog->banner_image, 'cloudinary') !== false) {
                $this->deleteCloudinaryImage($blog->banner_image);
            }
            if ($blog->meta_image && strpos($blog->meta_image, 'cloudinary') !== false) {
                $this->deleteCloudinaryImage($blog->meta_image);
            }
            
            $blog->delete();

            return response()->json([
                'success' => true,
                'message' => 'Blog deleted successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('Blog Delete Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    private function deleteCloudinaryImage($imageUrl)
    {
        try {
            // Extract public ID from Cloudinary URL
            $parts = explode('/', $imageUrl);
            $filename = end($parts);
            $publicId = pathinfo($filename, PATHINFO_FILENAME);
            
            // Find the folder path
            $folderStart = strpos($imageUrl, '/blogs/');
            if ($folderStart !== false) {
                $pathAfterVersion = substr($imageUrl, $folderStart + 1);
                $publicId = pathinfo($pathAfterVersion, PATHINFO_DIRNAME) . '/' . $publicId;
            }
            
            Cloudinary::destroy($publicId);
        } catch (\Exception $e) {
            \Log::error('Failed to delete Cloudinary image: ' . $e->getMessage());
        }
    }
}