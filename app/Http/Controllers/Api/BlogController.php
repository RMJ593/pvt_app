<?php

namespace App\Http\Controllers;

use App\Models\Blog;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BlogController extends Controller
{
    public function index()
    {
        try {
            $blogs = Blog::with('category')->latest()->get();
            
            return response()->json([
                'success' => true,
                'data' => $blogs
            ]);
        } catch (\Exception $e) {
            \Log::error('Blog Index Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error fetching blogs: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($identifier)
    {
        try {
            // Try to find by slug first, then by ID
            $blog = Blog::where('slug', $identifier)
                ->orWhere('id', $identifier)
                ->with('category')
                ->firstOrFail();
            
            return response()->json([
                'success' => true,
                'data' => $blog
            ]);
        } catch (\Exception $e) {
            \Log::error('Blog Show Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Blog not found: ' . $e->getMessage()
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

            // Handle image uploads
            if ($request->hasFile('image')) {
                $validated['image'] = $this->uploadImage($request->file('image'), 'blogs');
            }

            if ($request->hasFile('banner_image')) {
                $validated['banner_image'] = $this->uploadImage($request->file('banner_image'), 'blogs/banners');
            }

            if ($request->hasFile('meta_image')) {
                $validated['meta_image'] = $this->uploadImage($request->file('meta_image'), 'blogs/meta');
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
                'message' => 'Error creating blog: ' . $e->getMessage()
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

            // Upload new images if provided
            if ($request->hasFile('image')) {
                $validated['image'] = $this->uploadImage($request->file('image'), 'blogs');
            }

            if ($request->hasFile('banner_image')) {
                $validated['banner_image'] = $this->uploadImage($request->file('banner_image'), 'blogs/banners');
            }

            if ($request->hasFile('meta_image')) {
                $validated['meta_image'] = $this->uploadImage($request->file('meta_image'), 'blogs/meta');
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
                'message' => 'Error updating blog: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $blog = Blog::findOrFail($id);
            $blog->delete();

            return response()->json([
                'success' => true,
                'message' => 'Blog deleted successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('Blog Delete Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error deleting blog: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload image to Cloudinary or local storage
     */
    private function uploadImage($file, $folder)
    {
        // Try Cloudinary first
        if (class_exists('\CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary')) {
            try {
                $uploadedFileUrl = \CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary::upload(
                    $file->getRealPath(),
                    [
                        'folder' => $folder,
                        'transformation' => [
                            'quality' => 'auto',
                            'fetch_format' => 'auto'
                        ]
                    ]
                )->getSecurePath();
                
                return $uploadedFileUrl;
            } catch (\Exception $e) {
                \Log::warning('Cloudinary upload failed, using local storage: ' . $e->getMessage());
            }
        }

        // Fallback to local storage
        $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs($folder, $filename, 'public');
        
        return $path;
    }
}