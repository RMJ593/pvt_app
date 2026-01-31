<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BlogController extends Controller
{
    public function index()
    {
        try {
            $blogs = Blog::latest()->get();
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
                $uploadResult = cloudinary()->uploadApi()->upload(
                    $request->file('image')->getRealPath(),
                    [
                        'folder' => 'blogs',
                        'resource_type' => 'image'
                    ]
                );
                $validated['image'] = $uploadResult['secure_url'];
            }

            // Upload banner image to Cloudinary
            if ($request->hasFile('banner_image')) {
                $uploadResult = cloudinary()->uploadApi()->upload(
                    $request->file('banner_image')->getRealPath(),
                    [
                        'folder' => 'blogs/banners',
                        'resource_type' => 'image'
                    ]
                );
                $validated['banner_image'] = $uploadResult['secure_url'];
            }

            // Upload meta image to Cloudinary
            if ($request->hasFile('meta_image')) {
                $uploadResult = cloudinary()->uploadApi()->upload(
                    $request->file('meta_image')->getRealPath(),
                    [
                        'folder' => 'blogs/meta',
                        'resource_type' => 'image'
                    ]
                );
                $validated['meta_image'] = $uploadResult['secure_url'];
            }

            // Generate slug
            $slug = Str::slug($validated['title']);
            $count = Blog::where('slug', 'like', $slug . '%')->count();
            $validated['slug'] = $count > 0 ? $slug . '-' . ($count + 1) : $slug;
            
            $validated['is_active'] = true;

            $blog = Blog::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Blog created successfully',
                'data' => $blog
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Blog Store Error: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
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
                if ($blog->image && strpos($blog->image, 'cloudinary') !== false) {
                    $this->deleteCloudinaryImage($blog->image);
                }
                
                $uploadResult = cloudinary()->uploadApi()->upload(
                    $request->file('image')->getRealPath(),
                    [
                        'folder' => 'blogs',
                        'resource_type' => 'image'
                    ]
                );
                $validated['image'] = $uploadResult['secure_url'];
            }

            // Upload new banner image if provided
            if ($request->hasFile('banner_image')) {
                if ($blog->banner_image && strpos($blog->banner_image, 'cloudinary') !== false) {
                    $this->deleteCloudinaryImage($blog->banner_image);
                }
                
                $uploadResult = cloudinary()->uploadApi()->upload(
                    $request->file('banner_image')->getRealPath(),
                    [
                        'folder' => 'blogs/banners',
                        'resource_type' => 'image'
                    ]
                );
                $validated['banner_image'] = $uploadResult['secure_url'];
            }

            // Upload new meta image if provided
            if ($request->hasFile('meta_image')) {
                if ($blog->meta_image && strpos($blog->meta_image, 'cloudinary') !== false) {
                    $this->deleteCloudinaryImage($blog->meta_image);
                }
                
                $uploadResult = cloudinary()->uploadApi()->upload(
                    $request->file('meta_image')->getRealPath(),
                    [
                        'folder' => 'blogs/meta',
                        'resource_type' => 'image'
                    ]
                );
                $validated['meta_image'] = $uploadResult['secure_url'];
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
            $parts = explode('/', $imageUrl);
            $filename = end($parts);
            $publicId = pathinfo($filename, PATHINFO_FILENAME);
            
            $folderStart = strpos($imageUrl, '/blogs/');
            if ($folderStart !== false) {
                $pathAfterVersion = substr($imageUrl, $folderStart + 1);
                $publicId = pathinfo($pathAfterVersion, PATHINFO_DIRNAME) . '/' . $publicId;
            }
            
            cloudinary()->uploadApi()->destroy($publicId);
        } catch (\Exception $e) {
            \Log::error('Failed to delete Cloudinary image: ' . $e->getMessage());
        }
    }
}