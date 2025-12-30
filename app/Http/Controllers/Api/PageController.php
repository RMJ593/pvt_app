<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class PageController extends Controller
{
    /**
     * Display a listing of pages
     */
    public function index()
    {
        try {
            $pages = Page::orderBy('created_at', 'desc')->get();
            
            return response()->json([
                'success' => true,
                'data' => $pages
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch pages',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created page
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'page_title' => 'required|string|max:255',
            'small_heading' => 'required|string|max:255',
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:pages,slug',
            'location' => 'required|string|max:255',
            'hero_banner_id' => 'nullable|exists:hero_banners,id',
            'banner_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'content' => 'nullable|string',
            'seo_title' => 'nullable|string|max:255',
            'meta_keywords' => 'nullable|string',
            'meta_description' => 'nullable|string',
            'robots' => 'nullable|string',
            'og_type' => 'nullable|string',
            'meta_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $request->except(['banner_image', 'meta_image']);
            $data['is_active'] = 1; // Active by default

            // Handle banner image upload
            if ($request->hasFile('banner_image')) {
                $bannerImage = $request->file('banner_image');
                $bannerPath = $bannerImage->store('pages/banners', 'public');
                $data['banner_image'] = $bannerPath;
            }

            // Handle meta image upload
            if ($request->hasFile('meta_image')) {
                $metaImage = $request->file('meta_image');
                $metaPath = $metaImage->store('pages/meta', 'public');
                $data['meta_image'] = $metaPath;
            }

            $page = Page::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Page created successfully',
                'data' => $page
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create page',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified page
     */
    public function show($id)
    {
        try {
            $page = Page::findOrFail($id);
            
            // Add full URL for images
            if ($page->banner_image) {
                $page->banner_image_url = Storage::url($page->banner_image);
            }
            if ($page->meta_image) {
                $page->meta_image_url = Storage::url($page->meta_image);
            }
            
            return response()->json([
                'success' => true,
                'data' => $page
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Page not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified page
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'page_title' => 'required|string|max:255',
            'small_heading' => 'required|string|max:255',
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:pages,slug,' . $id,
            'location' => 'required|string|max:255',
            'hero_banner_id' => 'nullable|exists:hero_banners,id',
            'banner_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'content' => 'nullable|string',
            'seo_title' => 'nullable|string|max:255',
            'meta_keywords' => 'nullable|string',
            'meta_description' => 'nullable|string',
            'robots' => 'nullable|string',
            'og_type' => 'nullable|string',
            'meta_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'is_active' => 'nullable|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $page = Page::findOrFail($id);
            
            $data = $request->except(['banner_image', 'meta_image', '_method']);

            // Handle banner image upload
            if ($request->hasFile('banner_image')) {
                // Delete old image
                if ($page->banner_image) {
                    Storage::disk('public')->delete($page->banner_image);
                }
                $bannerImage = $request->file('banner_image');
                $bannerPath = $bannerImage->store('pages/banners', 'public');
                $data['banner_image'] = $bannerPath;
            }

            // Handle meta image upload
            if ($request->hasFile('meta_image')) {
                // Delete old image
                if ($page->meta_image) {
                    Storage::disk('public')->delete($page->meta_image);
                }
                $metaImage = $request->file('meta_image');
                $metaPath = $metaImage->store('pages/meta', 'public');
                $data['meta_image'] = $metaPath;
            }

            $page->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Page updated successfully',
                'data' => $page
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update page',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update page status
     */
    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|integer|in:0,1'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $page = Page::findOrFail($id);
            $page->update(['is_active' => $request->status]);

            return response()->json([
                'success' => true,
                'message' => 'Page status updated successfully',
                'data' => $page
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update page status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified page
     */
    public function destroy($id)
    {
        try {
            $page = Page::findOrFail($id);
            
            // Delete images
            if ($page->banner_image) {
                Storage::disk('public')->delete($page->banner_image);
            }
            if ($page->meta_image) {
                Storage::disk('public')->delete($page->meta_image);
            }
            
            $page->delete();

            return response()->json([
                'success' => true,
                'message' => 'Page deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete page',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}