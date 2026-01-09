<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BlogController extends Controller
{
    public function index()
    {
        try {
            $blogs = Blog::orderBy('created_at', 'desc')->get();
            return response()->json([
                'success' => true,
                'data' => $blogs
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching blogs: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch blogs'
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'content' => 'required|string',
                'excerpt' => 'nullable|string',
                'author' => 'nullable|string|max:255',
                'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
                'is_featured' => 'nullable',
                'is_active' => 'nullable'
            ]);

            $imageUrl = null;
            if ($request->hasFile('image')) {
                try {
                    if (class_exists(\CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary::class) && 
                        config('cloudinary.cloud_name')) {
                        $uploadedFileUrl = \CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary::upload(
                            $request->file('image')->getRealPath(),
                            ['folder' => 'resto_int/blogs', 'resource_type' => 'image']
                        )->getSecurePath();
                        $imageUrl = $uploadedFileUrl;
                        Log::info('Blog image uploaded to Cloudinary: ' . $imageUrl);
                    } else {
                        throw new \Exception('Cloudinary not configured');
                    }
                } catch (\Exception $e) {
                    Log::warning('Cloudinary upload failed: ' . $e->getMessage());
                    $imageUrl = $request->file('image')->store('blogs', 'public');
                }
            }

            // Generate unique slug
            $slug = Str::slug($validated['title']);
            $originalSlug = $slug;
            $count = 1;
            while (Blog::where('slug', $slug)->exists()) {
                $slug = $originalSlug . '-' . $count;
                $count++;
            }

            $blog = Blog::create([
                'title' => $validated['title'],
                'slug' => $slug,
                'content' => $validated['content'],
                'excerpt' => $validated['excerpt'] ?? null,
                'author' => $validated['author'] ?? 'Admin',
                'image' => $imageUrl,
                'is_featured' => $request->is_featured === '1' || $request->is_featured === 1 || $request->is_featured === true,
                'is_active' => $request->is_active === '1' || $request->is_active === 1 || $request->is_active === true || !$request->has('is_active')
            ]);

            return response()->json([
                'success' => true,
                'data' => $blog,
                'message' => 'Blog created successfully'
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error creating blog: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create blog: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $blog = Blog::findOrFail($id);
            return response()->json([
                'success' => true,
                'data' => $blog
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Blog not found'
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $blog = Blog::findOrFail($id);

            $validated = $request->validate([
                'title' => 'sometimes|required|string|max:255',
                'content' => 'sometimes|required|string',
                'excerpt' => 'nullable|string',
                'author' => 'nullable|string|max:255',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'is_featured' => 'sometimes',
                'is_active' => 'sometimes'
            ]);

            $data = [];
            
            if ($request->has('title')) {
                $data['title'] = $validated['title'];
                
                // Regenerate slug if title changed
                $slug = Str::slug($validated['title']);
                $originalSlug = $slug;
                $count = 1;
                while (Blog::where('slug', $slug)->where('id', '!=', $id)->exists()) {
                    $slug = $originalSlug . '-' . $count;
                    $count++;
                }
                $data['slug'] = $slug;
            }
            
            if ($request->has('content')) $data['content'] = $validated['content'];
            if ($request->has('excerpt')) $data['excerpt'] = $validated['excerpt'];
            if ($request->has('author')) $data['author'] = $validated['author'];

            if ($request->hasFile('image')) {
                try {
                    if (class_exists(\CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary::class) && 
                        config('cloudinary.cloud_name')) {
                        $uploadedFileUrl = \CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary::upload(
                            $request->file('image')->getRealPath(),
                            ['folder' => 'resto_int/blogs', 'resource_type' => 'image']
                        )->getSecurePath();
                        $data['image'] = $uploadedFileUrl;
                    } else {
                        throw new \Exception('Cloudinary not configured');
                    }
                } catch (\Exception $e) {
                    if ($blog->image && !filter_var($blog->image, FILTER_VALIDATE_URL)) {
                        Storage::disk('public')->delete($blog->image);
                    }
                    $data['image'] = $request->file('image')->store('blogs', 'public');
                }
            }

            if ($request->has('is_featured')) {
                $data['is_featured'] = $request->is_featured === '1' || $request->is_featured === 1 || $request->is_featured === true;
            }
            if ($request->has('is_active')) {
                $data['is_active'] = $request->is_active === '1' || $request->is_active === 1 || $request->is_active === true;
            }

            $blog->update($data);

            return response()->json([
                'success' => true,
                'data' => $blog,
                'message' => 'Blog updated successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error updating blog: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update blog'
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $blog = Blog::findOrFail($id);
            
            if ($blog->image && !filter_var($blog->image, FILTER_VALIDATE_URL)) {
                Storage::disk('public')->delete($blog->image);
            }

            $blog->delete();

            return response()->json([
                'success' => true,
                'message' => 'Blog deleted successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error deleting blog: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete blog'
            ], 500);
        }
    }
}