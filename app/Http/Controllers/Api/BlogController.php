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
            // Get all blogs without any relationships first
            $blogs = Blog::latest()->get();
            
            return response()->json([
                'success' => true,
                'data' => $blogs
            ]);
            
        } catch (\Exception $e) {
            // Log the actual error
            \Log::error('Blog Index Error: ' . $e->getMessage());
            \Log::error('File: ' . $e->getFile() . ' Line: ' . $e->getLine());
            
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    public function show($identifier)
    {
        try {
            // Find blog by ID or slug
            $blog = Blog::where('id', $identifier)
                ->orWhere('slug', $identifier)
                ->firstOrFail();
            
            return response()->json([
                'success' => true,
                'data' => $blog
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Blog Show Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
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
                'tags' => 'nullable|string',
                'seo_title' => 'nullable|string',
                'meta_keywords' => 'nullable|string',
                'meta_description' => 'nullable|string',
                'robots' => 'nullable|string',
                'og_type' => 'nullable|string',
            ]);

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
                'tags' => 'nullable|string',
                'seo_title' => 'nullable|string',
                'meta_keywords' => 'nullable|string',
                'meta_description' => 'nullable|string',
                'robots' => 'nullable|string',
                'og_type' => 'nullable|string',
            ]);

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
}