<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index()
    {
        try {
            $categories = Category::orderBy('order', 'asc')
                ->orderBy('created_at', 'desc')
                ->get();
            return response()->json([
                'success' => true,
                'data' => $categories
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching categories: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch categories'
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'small_heading' => 'required|string|max:255',
                'location' => 'required|string|max:255',
                'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
                'description' => 'nullable|string',
                'order' => 'nullable|integer',
                'is_royalty' => 'nullable|boolean',
                'is_special_selection' => 'nullable|boolean'
            ]);

            $imagePath = null;
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('categories', 'public');
            }

            // Generate unique slug
            $slug = Str::slug($validated['name']);
            $originalSlug = $slug;
            $count = 1;
            while (Category::where('slug', $slug)->exists()) {
                $slug = $originalSlug . '-' . $count;
                $count++;
            }

            $category = Category::create([
                'name' => $validated['name'],
                'slug' => $slug,
                'small_heading' => $validated['small_heading'],
                'location' => $validated['location'],
                'description' => $validated['description'] ?? null,
                'image' => $imagePath,
                'order' => $validated['order'] ?? 0,
                'is_active' => true,
                'is_royalty' => $request->is_royalty ?? false,
                'is_special_selection' => $request->is_special_selection ?? false
            ]);

            return response()->json([
                'success' => true,
                'data' => $category,
                'message' => 'Category created successfully'
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error creating category: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create category: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $category = Category::findOrFail($id);
            return response()->json([
                'success' => true,
                'data' => $category
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Category not found'
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $category = Category::findOrFail($id);

            $validated = $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'small_heading' => 'sometimes|required|string|max:255',
                'location' => 'sometimes|required|string|max:255',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'description' => 'nullable|string',
                'order' => 'nullable|integer',
                'is_active' => 'sometimes|boolean',
                'is_royalty' => 'sometimes|boolean',
                'is_special_selection' => 'sometimes|boolean'
            ]);

            $data = [];
            
            if ($request->has('name')) {
                $data['name'] = $validated['name'];
                
                // Regenerate slug if name changed
                $slug = Str::slug($validated['name']);
                $originalSlug = $slug;
                $count = 1;
                while (Category::where('slug', $slug)->where('id', '!=', $id)->exists()) {
                    $slug = $originalSlug . '-' . $count;
                    $count++;
                }
                $data['slug'] = $slug;
            }
            
            if ($request->has('small_heading')) {
                $data['small_heading'] = $validated['small_heading'];
            }
            
            if ($request->has('location')) {
                $data['location'] = $validated['location'];
            }
            
            if ($request->has('description')) {
                $data['description'] = $validated['description'];
            }
            
            if ($request->has('order')) {
                $data['order'] = $validated['order'];
            }

            if ($request->hasFile('image')) {
                if ($category->image) {
                    Storage::disk('public')->delete($category->image);
                }
                $data['image'] = $request->file('image')->store('categories', 'public');
            }

            if ($request->has('is_active')) {
                $data['is_active'] = $validated['is_active'];
            }
            
            if ($request->has('is_royalty')) {
                $data['is_royalty'] = $validated['is_royalty'];
            }
            
            if ($request->has('is_special_selection')) {
                $data['is_special_selection'] = $validated['is_special_selection'];
            }

            $category->update($data);

            return response()->json([
                'success' => true,
                'data' => $category,
                'message' => 'Category updated successfully'
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error updating category: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update category'
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $category = Category::findOrFail($id);
            
            if ($category->image) {
                Storage::disk('public')->delete($category->image);
            }

            $category->delete();

            return response()->json([
                'success' => true,
                'message' => 'Category deleted successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error deleting category: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete category'
            ], 500);
        }
    }
}