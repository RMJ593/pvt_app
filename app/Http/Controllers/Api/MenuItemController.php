<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class MenuItemController extends Controller
{
    public function index()
    {
        try {
            $menuItems = MenuItem::with('category')
                ->orderBy('order', 'asc')
                ->orderBy('created_at', 'desc')
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => $menuItems
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching menu items: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch products'
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'price' => 'required|numeric|min:0',
                'offer_price' => 'nullable|numeric|min:0',
                'discount_percentage' => 'nullable|integer|min:0|max:100',
                'description' => 'required|string',
                'category_id' => 'required|exists:categories,id',
                'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
                'discount_price' => 'nullable|numeric|min:0',
                'is_vegetarian' => 'nullable|boolean',
                'is_spicy' => 'nullable|boolean',
                'is_available' => 'nullable|boolean',
                'is_featured' => 'nullable|boolean',
                'is_special_dish' => 'nullable|boolean',
                'is_special_offer' => 'nullable|boolean',
                'is_chef_selection' => 'nullable|boolean',
                'order' => 'nullable|integer'
            ]);

            $validated['slug'] = Str::slug($validated['name']);
            
            // Ensure slug is unique
            $originalSlug = $validated['slug'];
            $count = 1;
            while (MenuItem::where('slug', $validated['slug'])->exists()) {
                $validated['slug'] = $originalSlug . '-' . $count;
                $count++;
            }

            if ($request->hasFile('image')) {
                $validated['image'] = $request->file('image')->store('menu-items', 'public');
            }

            // Set defaults for boolean fields
            $validated['is_available'] = $validated['is_available'] ?? true;
            $validated['is_active'] = true;
            $validated['is_special_dish'] = $request->is_special_dish == '1' || $request->is_special_dish === true;
            $validated['is_special_offer'] = $request->is_special_offer == '1' || $request->is_special_offer === true;
            $validated['is_chef_selection'] = $request->is_chef_selection == '1' || $request->is_chef_selection === true;
            $validated['order'] = $validated['order'] ?? 0;

            $menuItem = MenuItem::create($validated);
            $menuItem->load('category');

            return response()->json([
                'success' => true,
                'message' => 'Product created successfully',
                'data' => $menuItem
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error creating menu item: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create product: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $menuItem = MenuItem::with('category')->findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $menuItem
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $menuItem = MenuItem::findOrFail($id);

            // Make all fields optional with 'sometimes' - only validate what's being updated
            $validated = $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'price' => 'sometimes|required|numeric|min:0',
                'offer_price' => 'nullable|numeric|min:0',
                'discount_percentage' => 'nullable|integer|min:0|max:100',
                'description' => 'sometimes|required|string',
                'category_id' => 'sometimes|required|exists:categories,id',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'discount_price' => 'nullable|numeric|min:0',
                'is_vegetarian' => 'sometimes|boolean',
                'is_spicy' => 'sometimes|boolean',
                'is_available' => 'sometimes|boolean',
                'is_featured' => 'sometimes|boolean',
                'is_active' => 'sometimes|boolean',
                'is_special_dish' => 'sometimes|boolean',
                'is_special_offer' => 'sometimes|boolean',
                'is_chef_selection' => 'sometimes|boolean',
                'order' => 'nullable|integer'
            ]);

            $data = [];
            
            if ($request->has('name')) {
                $data['name'] = $validated['name'];
                
                // Regenerate slug if name changed
                $slug = Str::slug($validated['name']);
                $originalSlug = $slug;
                $count = 1;
                while (MenuItem::where('slug', $slug)->where('id', '!=', $id)->exists()) {
                    $slug = $originalSlug . '-' . $count;
                    $count++;
                }
                $data['slug'] = $slug;
            }
            
            if ($request->has('price')) {
                $data['price'] = $validated['price'];
            }

            if ($request->has('offer_price')) {
                $data['offer_price'] = $validated['offer_price'];
            }

            if ($request->has('discount_percentage')) {
                $data['discount_percentage'] = $validated['discount_percentage'];
            }
            
            if ($request->has('description')) {
                $data['description'] = $validated['description'];
            }
            
            if ($request->has('category_id')) {
                $data['category_id'] = $validated['category_id'];
            }

            if ($request->has('discount_price')) {
                $data['discount_price'] = $validated['discount_price'];
            }

            if ($request->has('order')) {
                $data['order'] = $validated['order'];
            }

            if ($request->hasFile('image')) {
                if ($menuItem->image) {
                    Storage::disk('public')->delete($menuItem->image);
                }
                $data['image'] = $request->file('image')->store('menu-items', 'public');
            }

            // Handle boolean fields - convert '1'/'0' strings to booleans
            if ($request->has('is_active')) {
                $data['is_active'] = $request->is_active == '1' || $request->is_active === true || $request->is_active === 1;
            }
            
            if ($request->has('is_available')) {
                $data['is_available'] = $request->is_available == '1' || $request->is_available === true || $request->is_available === 1;
            }
            
            if ($request->has('is_vegetarian')) {
                $data['is_vegetarian'] = $request->is_vegetarian == '1' || $request->is_vegetarian === true || $request->is_vegetarian === 1;
            }
            
            if ($request->has('is_spicy')) {
                $data['is_spicy'] = $request->is_spicy == '1' || $request->is_spicy === true || $request->is_spicy === 1;
            }
            
            if ($request->has('is_featured')) {
                $data['is_featured'] = $request->is_featured == '1' || $request->is_featured === true || $request->is_featured === 1;
            }
            
            if ($request->has('is_special_dish')) {
                $data['is_special_dish'] = $request->is_special_dish == '1' || $request->is_special_dish === true || $request->is_special_dish === 1;
            }
            
            if ($request->has('is_special_offer')) {
                $data['is_special_offer'] = $request->is_special_offer == '1' || $request->is_special_offer === true || $request->is_special_offer === 1;
            }
            
            if ($request->has('is_chef_selection')) {
                $data['is_chef_selection'] = $request->is_chef_selection == '1' || $request->is_chef_selection === true || $request->is_chef_selection === 1;
            }

            $menuItem->update($data);
            $menuItem->load('category');

            return response()->json([
                'success' => true,
                'message' => 'Product updated successfully',
                'data' => $menuItem
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error updating menu item: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update product'
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $menuItem = MenuItem::findOrFail($id);
            
            if ($menuItem->image) {
                Storage::disk('public')->delete($menuItem->image);
            }

            $menuItem->delete();

            return response()->json([
                'success' => true,
                'message' => 'Product deleted successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error deleting menu item: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete product'
            ], 500);
        }
    }
}