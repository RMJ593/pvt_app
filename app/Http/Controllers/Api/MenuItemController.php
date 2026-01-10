<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Cloudinary\Cloudinary;

class MenuItemController extends Controller
{
    public function index()
    {
        try {
            $menuItems = MenuItem::with('category')
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
                'message' => 'Failed to fetch menu items'
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
                'is_special_dish' => 'nullable',
                'is_special_offer' => 'nullable',
                'is_chef_selection' => 'nullable',
                'is_active' => 'nullable'
            ]);

            $imageUrl = null;
            if ($request->hasFile('image')) {
                try {
                    Log::info('🔄 Attempting Cloudinary upload for menu item...');
                    
                    // Initialize Cloudinary
                    $cloudinary = new Cloudinary([
                        'cloud' => [
                            'cloud_name' => config('cloudinary.cloud_name'),
                            'api_key' => config('cloudinary.api_key'),
                            'api_secret' => config('cloudinary.api_secret'),
                        ],
                        'url' => ['secure' => true]
                    ]);
                    
                    $result = $cloudinary->uploadApi()->upload(
                        $request->file('image')->getRealPath(),
                        [
                            'folder' => 'resto_int/menu-items',
                            'resource_type' => 'image',
                            'timestamp' => time()
                        ]
                    );
                    
                    $imageUrl = $result['secure_url'];
                    Log::info('✅ SUCCESS! Cloudinary URL: ' . $imageUrl);
                    
                } catch (\Exception $e) {
                    Log::error('❌ Cloudinary failed: ' . $e->getMessage());
                    $imageUrl = $request->file('image')->store('menu-items', 'public');
                    Log::warning('📁 Fallback to local storage: ' . $imageUrl);
                }
            }

            $menuItem = MenuItem::create([
                'name' => $validated['name'],
                'price' => $validated['price'],
                'offer_price' => $validated['offer_price'] ?? null,
                'discount_percentage' => $validated['discount_percentage'] ?? null,
                'description' => $validated['description'],
                'category_id' => $validated['category_id'],
                'image' => $imageUrl,
                'is_special_dish' => $request->is_special_dish === '1' || $request->is_special_dish === 1 || $request->is_special_dish === true,
                'is_special_offer' => $request->is_special_offer === '1' || $request->is_special_offer === 1 || $request->is_special_offer === true,
                'is_chef_selection' => $request->is_chef_selection === '1' || $request->is_chef_selection === 1 || $request->is_chef_selection === true,
                'is_active' => $request->is_active === '1' || $request->is_active === 1 || $request->is_active === true || !$request->has('is_active')
            ]);

            return response()->json([
                'success' => true,
                'data' => $menuItem,
                'message' => 'Menu item created successfully'
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error creating menu item: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create menu item: ' . $e->getMessage()
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
                'message' => 'Menu item not found'
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $menuItem = MenuItem::findOrFail($id);

            $validated = $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'price' => 'sometimes|required|numeric|min:0',
                'offer_price' => 'nullable|numeric|min:0',
                'discount_percentage' => 'nullable|integer|min:0|max:100',
                'description' => 'sometimes|required|string',
                'category_id' => 'sometimes|required|exists:categories,id',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'is_special_dish' => 'sometimes',
                'is_special_offer' => 'sometimes',
                'is_chef_selection' => 'sometimes',
                'is_active' => 'sometimes'
            ]);

            $data = [];
            
            if ($request->has('name')) $data['name'] = $validated['name'];
            if ($request->has('price')) $data['price'] = $validated['price'];
            if ($request->has('offer_price')) $data['offer_price'] = $validated['offer_price'];
            if ($request->has('discount_percentage')) $data['discount_percentage'] = $validated['discount_percentage'];
            if ($request->has('description')) $data['description'] = $validated['description'];
            if ($request->has('category_id')) $data['category_id'] = $validated['category_id'];

            if ($request->hasFile('image')) {
                try {
                    $cloudinary = new Cloudinary([
                        'cloud' => [
                            'cloud_name' => config('cloudinary.cloud_name'),
                            'api_key' => config('cloudinary.api_key'),
                            'api_secret' => config('cloudinary.api_secret'),
                        ],
                    ]);
                    
                    $result = $cloudinary->uploadApi()->upload(
                        $request->file('image')->getRealPath(),
                        [
                            'folder' => 'resto_int/menu-items',
                            'resource_type' => 'image',
                            'timestamp' => time()
                        ]
                    );
                    
                    $data['image'] = $result['secure_url'];
                } catch (\Exception $e) {
                    if ($menuItem->image && !filter_var($menuItem->image, FILTER_VALIDATE_URL)) {
                        Storage::disk('public')->delete($menuItem->image);
                    }
                    $data['image'] = $request->file('image')->store('menu-items', 'public');
                }
            }

            if ($request->has('is_special_dish')) {
                $data['is_special_dish'] = $request->is_special_dish === '1' || $request->is_special_dish === 1 || $request->is_special_dish === true;
            }
            if ($request->has('is_special_offer')) {
                $data['is_special_offer'] = $request->is_special_offer === '1' || $request->is_special_offer === 1 || $request->is_special_offer === true;
            }
            if ($request->has('is_chef_selection')) {
                $data['is_chef_selection'] = $request->is_chef_selection === '1' || $request->is_chef_selection === 1 || $request->is_chef_selection === true;
            }
            if ($request->has('is_active')) {
                $data['is_active'] = $request->is_active === '1' || $request->is_active === 1 || $request->is_active === true;
            }

            $menuItem->update($data);

            return response()->json([
                'success' => true,
                'data' => $menuItem,
                'message' => 'Menu item updated successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error updating menu item: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update menu item'
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $menuItem = MenuItem::findOrFail($id);
            
            if ($menuItem->image && !filter_var($menuItem->image, FILTER_VALIDATE_URL)) {
                Storage::disk('public')->delete($menuItem->image);
            }

            $menuItem->delete();

            return response()->json([
                'success' => true,
                'message' => 'Menu item deleted successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error deleting menu item: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete menu item'
            ], 500);
        }
    }
}