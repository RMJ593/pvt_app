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
                'is_royalty' => 'nullable',
                'is_special_selection' => 'nullable',
                'is_active' => 'nullable'
            ]);

            $imageUrl = null;
            
            // Try Cloudinary first, fallback to local storage
            if ($request->hasFile('image')) {
                try {
                    // Check if Cloudinary is configured
                    if (class_exists(\CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary::class) && 
                        config('cloudinary.cloud_name')) {
                        
                        $uploadedFileUrl = \CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary::upload(
                            $request->file('image')->getRealPath(), 
                            [
                                'folder' => 'resto_int/categories',
                                'resource_type' => 'image'
                            ]
                        )->getSecurePath();
                        
                        $imageUrl = $uploadedFileUrl;
                        Log::info('Image uploaded to Cloudinary: ' . $imageUrl);
                    } else {
                        throw new \Exception('Cloudinary not configured');
                    }
                } catch (\Exception $e) {
                    // Fallback to local storage
                    Log::warning('Cloudinary upload failed, using local storage: ' . $e->getMessage());
                    $imageUrl = $request->file('image')->store('categories', 'public');
                    Log::info('Image uploaded to local storage: ' . $imageUrl);
                }
            }

            // Generate unique slug
            $slug = Str::slug($validated['name']);
            $originalSlug = $slug;
            $count = 1;
            while (Category::where('slug', $slug)->exists()) {
                $slug = $originalSlug . '-' . $count;
                $count++;
            }

            // Convert string "1"/"0" to boolean
            $isRoyalty = $request->is_royalty === '1' || $request->is_royalty === 1 || $request->is_royalty === true;
            $isSpecialSelection = $request->is_special_selection === '1' || $request->is_special_selection === 1 || $request->is_special_selection === true;
            $isActive = $request->is_active === '1' || $request->is_active === 1 || $request->is_active === true || !$request->has('is_active');

            $category = Category::create([
                'name' => $validated['name'],
                'slug' => $slug,
                'small_heading' => $validated['small_heading'],
                'location' => $validated['location'],
                'description' => $validated['description'] ?? null,
                'image' => $imageUrl,
                'order' => $validated['order'] ?? 0,
                'is_active' => $isActive,
                'is_royalty' => $isRoyalty,
                'is_special_selection' => $isSpecialSelection
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
            Log::error('Stack trace: ' . $e->getTraceAsString());
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
                'is_active' => 'sometimes',
                'is_royalty' => 'sometimes',
                'is_special_selection' => 'sometimes'
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

            // Handle image upload
            if ($request->hasFile('image')) {
                try {
                    // Try Cloudinary first
                    if (class_exists(\CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary::class) && 
                        config('cloudinary.cloud_name')) {
                        
                        $uploadedFileUrl = \CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary::upload(
                            $request->file('image')->getRealPath(),
                            [
                                'folder' => 'resto_int/categories',
                                'transformation' => [
                                    'width' => 285,
                                    'height' => 336,
                                    'crop' => 'fill',
                                    'quality' => 'auto'
                                ]
                            ]
                        )->getSecurePath();
                        
                        $data['image'] = $uploadedFileUrl;
                    } else {
                        throw new \Exception('Cloudinary not configured');
                    }
                } catch (\Exception $e) {
                    // Fallback to local storage
                    Log::warning('Cloudinary upload failed, using local storage: ' . $e->getMessage());
                    if ($category->image && !filter_var($category->image, FILTER_VALIDATE_URL)) {
                        Storage::disk('public')->delete($category->image);
                    }
                    $data['image'] = $request->file('image')->store('categories', 'public');
                }
            }

            if ($request->has('is_active')) {
                $data['is_active'] = $request->is_active === '1' || $request->is_active === 1 || $request->is_active === true;
            }
            
            if ($request->has('is_royalty')) {
                $data['is_royalty'] = $request->is_royalty === '1' || $request->is_royalty === 1 || $request->is_royalty === true;
            }
            
            if ($request->has('is_special_selection')) {
                $data['is_special_selection'] = $request->is_special_selection === '1' || $request->is_special_selection === 1 || $request->is_special_selection === true;
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
            
            // Delete local storage image if exists
            if ($category->image && !filter_var($category->image, FILTER_VALIDATE_URL)) {
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