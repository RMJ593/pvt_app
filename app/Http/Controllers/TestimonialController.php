<?php

namespace App\Http\Controllers;

use App\Models\Testimonial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class TestimonialController extends Controller
{
    public function index()
    {
        try {
            $testimonials = Testimonial::orderBy('created_at', 'desc')->get();
            return response()->json([
                'success' => true,
                'data' => $testimonials
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching testimonials: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch testimonials'
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'customer_name' => 'required|string|max:255',
                'review' => 'required|string',
                'customer_image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
            ]);

            $imagePath = null;
            if ($request->hasFile('customer_image')) {
                $imagePath = $request->file('customer_image')->store('testimonials', 'public');
            }

            $testimonial = Testimonial::create([
                'customer_name' => $validated['customer_name'],
                'review' => $validated['review'],
                'customer_image' => $imagePath,
                'is_active' => true
            ]);

            return response()->json([
                'success' => true,
                'data' => $testimonial,
                'message' => 'Testimonial created successfully'
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error creating testimonial: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create testimonial: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $testimonial = Testimonial::findOrFail($id);
            return response()->json([
                'success' => true,
                'data' => $testimonial
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Testimonial not found'
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $testimonial = Testimonial::findOrFail($id);

            $validated = $request->validate([
                'customer_name' => 'sometimes|required|string|max:255',
                'review' => 'sometimes|required|string',
                'customer_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'is_active' => 'sometimes|boolean'
            ]);

            $data = [];
            
            if ($request->has('customer_name')) {
                $data['customer_name'] = $validated['customer_name'];
            }
            
            if ($request->has('review')) {
                $data['review'] = $validated['review'];
            }

            if ($request->hasFile('customer_image')) {
                if ($testimonial->customer_image) {
                    Storage::disk('public')->delete($testimonial->customer_image);
                }
                $data['customer_image'] = $request->file('customer_image')->store('testimonials', 'public');
            }

            if ($request->has('is_active')) {
                $data['is_active'] = $validated['is_active'];
            }

            $testimonial->update($data);

            return response()->json([
                'success' => true,
                'data' => $testimonial,
                'message' => 'Testimonial updated successfully'
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error updating testimonial: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update testimonial'
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $testimonial = Testimonial::findOrFail($id);
            
            if ($testimonial->customer_image) {
                Storage::disk('public')->delete($testimonial->customer_image);
            }

            $testimonial->delete();

            return response()->json([
                'success' => true,
                'message' => 'Testimonial deleted successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error deleting testimonial: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete testimonial'
            ], 500);
        }
    }
}