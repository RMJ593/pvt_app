<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Cloudinary\Cloudinary;

class CategoryController extends Controller
{
    /**
     * Display a listing of categories
     */
    public function index()
    {
        try {
            $categories = Category::orderBy('name', 'asc')->get();
            
            return response()->json([
                'success' => true,
                'data' => $categories
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to fetch categories:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch categories',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created category
     */
    public function store(Request $request)
    {
        \Log::info('=== CATEGORY STORE REQUEST ===');
        \Log::info('Request Data:', $request->all());
        \Log::info('Has File:', $request->hasFile('image'));
        
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'small_heading' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'image' => 'required|image|mimes:jpeg,jpg,png,gif,webp|max:2048',
            'is_royalty' => 'nullable',
            'is_special_selection' => 'nullable',
            'is_active' => 'nullable'
        ]);

        if ($validator->fails()) {
            \Log::error('Validation failed:', $validator->errors()->toArray());
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = [
                'name' => $request->name,
                'small_heading' => $request->small_heading,
                'location' => $request->location,
                'is_royalty' => $request->is_royalty == '1' || $request->is_royalty === true,
                'is_special_selection' => $request->is_special_selection == '1' || $request->is_special_selection === true,
                'is_active' => $request->is_active == '1' || $request->is_active === true || !$request->has('is_active')
            ];

            \Log::info('Parsed data:', $data);

            // Handle image upload to Cloudinary
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                
                \Log::info('Uploading category image to Cloudinary...', [
                    'filename' => $file->getClientOriginalName(),
                    'size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                ]);

                if (!$file->isValid()) {
                    throw new \Exception('Uploaded file is not valid');
                }

                // Initialize Cloudinary
                $cloudinary = new Cloudinary([
                    'cloud' => [
                        'cloud_name' => config('cloudinary.cloud_name'),
                        'api_key' => config('cloudinary.api_key'),
                        'api_secret' => config('cloudinary.api_secret'),
                    ],
                    'url' => [
                        'secure' => true
                    ]
                ]);
                
                // Upload image to Cloudinary
                $result = $cloudinary->uploadApi()->upload(
                    $file->getRealPath(),
                    [
                        'folder' => 'categories',
                        'resource_type' => 'image',
                        'transformation' => [
                            ['width' => 285, 'height' => 336, 'crop' => 'fill', 'quality' => 'auto']
                        ]
                    ]
                );
                
                if (!isset($result['secure_url'])) {
                    throw new \Exception('Cloudinary upload failed - no URL returned');
                }
                
                $data['image'] = $result['secure_url'];
                
                \Log::info('Category image uploaded to Cloudinary successfully:', [
                    'url' => $result['secure_url'],
                    'public_id' => $result['public_id']
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'No image file uploaded'
                ], 422);
            }

            $category = Category::create($data);
            
            \Log::info('Category created successfully:', ['id' => $category->id]);

            return response()->json([
                'success' => true,
                'message' => 'Category created successfully',
                'data' => $category
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Category creation failed:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create category',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified category
     */
    public function show($id)
    {
        try {
            $category = Category::find($id);

            if (!$category) {
                return response()->json([
                    'success' => false,
                    'message' => 'Category not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $category
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to fetch category:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch category'
            ], 500);
        }
    }

    /**
     * Update the specified category
     */
    public function update(Request $request, $id)
    {
        \Log::info('=== CATEGORY UPDATE REQUEST ===');
        \Log::info('ID:', [$id]);
        \Log::info('Request Data:', $request->all());
        
        $category = Category::find($id);

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Category not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'small_heading' => 'sometimes|required|string|max:255',
            'location' => 'sometimes|required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,jpg,png,gif,webp|max:2048',
            'is_royalty' => 'nullable',
            'is_special_selection' => 'nullable',
            'is_active' => 'nullable'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = [];
            
            if ($request->has('name')) $data['name'] = $request->name;
            if ($request->has('small_heading')) $data['small_heading'] = $request->small_heading;
            if ($request->has('location')) $data['location'] = $request->location;
            
            if ($request->has('is_royalty')) {
                $data['is_royalty'] = $request->is_royalty == '1' || $request->is_royalty === true;
            }
            if ($request->has('is_special_selection')) {
                $data['is_special_selection'] = $request->is_special_selection == '1' || $request->is_special_selection === true;
            }
            if ($request->has('is_active')) {
                $data['is_active'] = $request->is_active == '1' || $request->is_active === true;
            }

            // Handle image upload if new image provided
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                
                \Log::info('Updating category image on Cloudinary...');

                $cloudinary = new Cloudinary([
                    'cloud' => [
                        'cloud_name' => config('cloudinary.cloud_name'),
                        'api_key' => config('cloudinary.api_key'),
                        'api_secret' => config('cloudinary.api_secret'),
                    ],
                ]);
                
                // Delete old image from Cloudinary if exists
                if ($category->image && strpos($category->image, 'cloudinary.com') !== false) {
                    $this->deleteFromCloudinary($category->image, $cloudinary);
                }

                // Upload new image
                $result = $cloudinary->uploadApi()->upload(
                    $file->getRealPath(),
                    [
                        'folder' => 'categories',
                        'resource_type' => 'image',
                        'transformation' => [
                            ['width' => 285, 'height' => 336, 'crop' => 'fill', 'quality' => 'auto']
                        ]
                    ]
                );
                
                $data['image'] = $result['secure_url'];
                
                \Log::info('Category image updated on Cloudinary:', [
                    'url' => $result['secure_url']
                ]);
            }

            $category->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Category updated successfully',
                'data' => $category
            ]);

        } catch (\Exception $e) {
            \Log::error('Category update failed:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update category',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified category
     */
    public function destroy($id)
    {
        $category = Category::find($id);

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Category not found'
            ], 404);
        }

        try {
            $cloudinary = new Cloudinary([
                'cloud' => [
                    'cloud_name' => config('cloudinary.cloud_name'),
                    'api_key' => config('cloudinary.api_key'),
                    'api_secret' => config('cloudinary.api_secret'),
                ],
            ]);
            
            if ($category->image && strpos($category->image, 'cloudinary.com') !== false) {
                $this->deleteFromCloudinary($category->image, $cloudinary);
            }

            $category->delete();

            return response()->json([
                'success' => true,
                'message' => 'Category deleted successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('Category deletion failed:', [
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete category',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete image from Cloudinary
     */
    private function deleteFromCloudinary($imageUrl, $cloudinary)
    {
        try {
            if (preg_match('/\/v\d+\/(.+)\.\w+$/', $imageUrl, $matches)) {
                $publicId = $matches[1];
                $cloudinary->uploadApi()->destroy($publicId, ['resource_type' => 'image']);
                \Log::info('Deleted image from Cloudinary:', ['public_id' => $publicId]);
            }
        } catch (\Exception $e) {
            \Log::warning('Failed to delete from Cloudinary:', ['error' => $e->getMessage()]);
        }
    }
}