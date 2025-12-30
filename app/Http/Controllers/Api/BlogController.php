<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class BlogController extends Controller
{
    public function index()
    {
        try {
            $blogs = Blog::with('category')
                ->orderBy('created_at', 'desc')
                ->get();
            
            return response()->json($blogs);
        } catch (\Exception $e) {
            Log::error('Error fetching blogs: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to fetch blogs'], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'small_description' => 'required|string',
                'content' => 'required|string',
                'category_id' => 'required|exists:blog_categories,id',
                'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
                'banner_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
                'tags' => 'nullable|string',
                'seo_title' => 'nullable|string|max:255',
                'meta_keywords' => 'nullable|string',
                'meta_description' => 'nullable|string',
                'meta_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
                'robots' => 'nullable|string',
                'og_type' => 'nullable|string'
            ]);

            // Generate slug
            $slug = Str::slug($validated['title']);
            $originalSlug = $slug;
            $count = 1;
            while (Blog::where('slug', $slug)->exists()) {
                $slug = $originalSlug . '-' . $count;
                $count++;
            }

            // Handle image uploads
            $imagePath = null;
            $bannerImagePath = null;
            $metaImagePath = null;

            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('blogs', 'public');
            }

            if ($request->hasFile('banner_image')) {
                $bannerImagePath = $request->file('banner_image')->store('blogs/banners', 'public');
            }

            if ($request->hasFile('meta_image')) {
                $metaImagePath = $request->file('meta_image')->store('blogs/meta', 'public');
            }

            $blog = Blog::create([
                'title' => $validated['title'],
                'slug' => $slug,
                'small_description' => $validated['small_description'],
                'content' => $validated['content'],
                'category_id' => $validated['category_id'],
                'image' => $imagePath,
                'banner_image' => $bannerImagePath,
                'tags' => $validated['tags'] ?? null,
                'seo_title' => $validated['seo_title'] ?? null,
                'meta_keywords' => $validated['meta_keywords'] ?? null,
                'meta_description' => $validated['meta_description'] ?? null,
                'meta_image' => $metaImagePath,
                'robots' => $validated['robots'] ?? 'index,follow',
                'og_type' => $validated['og_type'] ?? 'article',
                'is_active' => true
            ]);

            $blog->load('category');

            return response()->json($blog, 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error creating blog: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'message' => 'Failed to create blog: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $blog = Blog::with('category')->findOrFail($id);
            return response()->json($blog);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Blog not found'], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $blog = Blog::findOrFail($id);

            $validated = $request->validate([
                'title' => 'sometimes|required|string|max:255',
                'small_description' => 'sometimes|required|string',
                'content' => 'sometimes|required|string',
                'category_id' => 'sometimes|required|exists:blog_categories,id',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
                'banner_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
                'tags' => 'nullable|string',
                'seo_title' => 'nullable|string|max:255',
                'meta_keywords' => 'nullable|string',
                'meta_description' => 'nullable|string',
                'meta_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
                'robots' => 'nullable|string',
                'og_type' => 'nullable|string',
                'is_active' => 'sometimes|boolean'
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

            if ($request->has('small_description')) {
                $data['small_description'] = $validated['small_description'];
            }

            if ($request->has('content')) {
                $data['content'] = $validated['content'];
            }

            if ($request->has('category_id')) {
                $data['category_id'] = $validated['category_id'];
            }

            if ($request->has('tags')) {
                $data['tags'] = $validated['tags'];
            }

            if ($request->has('seo_title')) {
                $data['seo_title'] = $validated['seo_title'];
            }

            if ($request->has('meta_keywords')) {
                $data['meta_keywords'] = $validated['meta_keywords'];
            }

            if ($request->has('meta_description')) {
                $data['meta_description'] = $validated['meta_description'];
            }

            if ($request->has('robots')) {
                $data['robots'] = $validated['robots'];
            }

            if ($request->has('og_type')) {
                $data['og_type'] = $validated['og_type'];
            }

            if ($request->has('is_active')) {
                $data['is_active'] = $validated['is_active'];
            }

            // Handle image uploads
            if ($request->hasFile('image')) {
                if ($blog->image) {
                    Storage::disk('public')->delete($blog->image);
                }
                $data['image'] = $request->file('image')->store('blogs', 'public');
            }

            if ($request->hasFile('banner_image')) {
                if ($blog->banner_image) {
                    Storage::disk('public')->delete($blog->banner_image);
                }
                $data['banner_image'] = $request->file('banner_image')->store('blogs/banners', 'public');
            }

            if ($request->hasFile('meta_image')) {
                if ($blog->meta_image) {
                    Storage::disk('public')->delete($blog->meta_image);
                }
                $data['meta_image'] = $request->file('meta_image')->store('blogs/meta', 'public');
            }

            $blog->update($data);
            $blog->load('category');

            return response()->json($blog);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error updating blog: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to update blog'], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $blog = Blog::findOrFail($id);
            
            // Delete images
            if ($blog->image) {
                Storage::disk('public')->delete($blog->image);
            }
            if ($blog->banner_image) {
                Storage::disk('public')->delete($blog->banner_image);
            }
            if ($blog->meta_image) {
                Storage::disk('public')->delete($blog->meta_image);
            }

            $blog->delete();

            return response()->json(null, 204);

        } catch (\Exception $e) {
            Log::error('Error deleting blog: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to delete blog'], 500);
        }
    }
}