<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BlogCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class BlogCategoryController extends Controller
{
    public function index()
    {
        try {
            $categories = BlogCategory::orderBy('created_at', 'desc')->get();
            return response()->json([
                'success' => true,
                'data' => $categories
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching blog categories: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch blog categories'
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'slug' => 'required|string|max:255|unique:blog_categories,slug',
                'location' => 'required|string|max:255',
                'description' => 'nullable|string',
                'is_active' => 'nullable'
            ]);

            // Convert is_active to boolean properly
            $isActive = $request->is_active === '1' || $request->is_active === 1 || $request->is_active === true || !$request->has('is_active');

            $category = BlogCategory::create([
                'name' => $validated['name'],
                'slug' => $validated['slug'],
                'location' => $validated['location'],
                'description' => $validated['description'] ?? null,
                'is_active' => $isActive
            ]);

            return response()->json([
                'success' => true,
                'data' => $category,
                'message' => 'Blog category created successfully'
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error creating blog category: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create blog category'
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $category = BlogCategory::findOrFail($id);
            return response()->json([
                'success' => true,
                'data' => $category
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Blog category not found'
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $category = BlogCategory::findOrFail($id);

            $validated = $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'slug' => 'sometimes|required|string|max:255|unique:blog_categories,slug,' . $id,
                'location' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string',
                'is_active' => 'sometimes'
            ]);

            $data = [];
            
            if ($request->has('name')) {
                $data['name'] = $validated['name'];
            }
            
            if ($request->has('slug')) {
                $data['slug'] = $validated['slug'];
            }
            
            if ($request->has('location')) {
                $data['location'] = $validated['location'];
            }
            
            if ($request->has('description')) {
                $data['description'] = $validated['description'];
            }
            
            if ($request->has('is_active')) {
                // Convert string "1"/"0" to boolean properly
                $data['is_active'] = $request->is_active === '1' || $request->is_active === 1 || $request->is_active === true;
            }

            $category->update($data);

            return response()->json([
                'success' => true,
                'data' => $category,
                'message' => 'Blog category updated successfully'
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error updating blog category: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update blog category'
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $category = BlogCategory::findOrFail($id);
            $category->delete();

            return response()->json([
                'success' => true,
                'message' => 'Blog category deleted successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error deleting blog category: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete blog category'
            ], 500);
        }
    }
}