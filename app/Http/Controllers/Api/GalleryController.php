<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GalleryImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class GalleryController extends Controller
{
    public function index()
    {
        try {
            $images = GalleryImage::orderBy('created_at', 'desc')->get();
            return response()->json([
                'success' => true,
                'data' => $images
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching gallery images: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch gallery images'
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048'
            ]);

            $imagePath = null;
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('gallery', 'public');
            }

            $image = GalleryImage::create([
                'title' => $validated['title'],
                'image' => $imagePath,
                'is_active' => true
            ]);

            return response()->json([
                'success' => true,
                'data' => $image,
                'message' => 'Gallery image created successfully'
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error creating gallery image: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create gallery image: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $image = GalleryImage::findOrFail($id);
            return response()->json([
                'success' => true,
                'data' => $image
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gallery image not found'
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $image = GalleryImage::findOrFail($id);

            $validated = $request->validate([
                'title' => 'sometimes|required|string|max:255',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
                'is_active' => 'sometimes|boolean'
            ]);

            $data = [];
            
            if ($request->has('title')) {
                $data['title'] = $validated['title'];
            }

            if ($request->hasFile('image')) {
                if ($image->image) {
                    Storage::disk('public')->delete($image->image);
                }
                $data['image'] = $request->file('image')->store('gallery', 'public');
            }

            if ($request->has('is_active')) {
                $data['is_active'] = $validated['is_active'];
            }

            $image->update($data);

            return response()->json([
                'success' => true,
                'data' => $image,
                'message' => 'Gallery image updated successfully'
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error updating gallery image: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update gallery image'
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $image = GalleryImage::findOrFail($id);
            
            if ($image->image) {
                Storage::disk('public')->delete($image->image);
            }

            $image->delete();

            return response()->json([
                'success' => true,
                'message' => 'Gallery image deleted successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error deleting gallery image: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete gallery image'
            ], 500);
        }
    }
}