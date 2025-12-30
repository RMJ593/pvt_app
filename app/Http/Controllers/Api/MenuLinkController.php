<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MenuLink;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MenuLinkController extends Controller
{
    /**
     * Display a listing of menu links
     */
    public function index(Request $request)
    {
        $query = MenuLink::with(['menu', 'parent', 'children', 'page']);
        
        // Filter by menu_id if provided
        if ($request->has('menu_id')) {
            $query->where('menu_id', $request->menu_id);
        }
        
        // Filter by link_type if provided
        if ($request->has('link_type')) {
            $query->where('link_type', $request->link_type);
        }
        
        // Get only top-level links (no parent)
        if ($request->has('top_level') && $request->top_level) {
            $query->whereNull('parent_id');
        }
        
        $links = $query->orderBy('order', 'asc')->get();
        
        return response()->json([
            'success' => true,
            'data' => $links
        ]);
    }

    /**
     * Store a newly created menu link
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'menu_id' => 'required|exists:menus,id',
            'parent_id' => 'nullable|exists:menu_links,id',
            'title' => 'required|string|max:255',
            'url' => 'required|string|max:255',
            'link_type' => 'nullable|string|in:nav_link,top_menu,footer_link',
            'page_id' => 'nullable|exists:pages,id',
            'target' => 'nullable|string|in:_self,_blank',
            'order' => 'nullable|integer',
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
            $data = $request->only(['menu_id', 'parent_id', 'title', 'url', 'link_type', 'page_id', 'target', 'order']);
            $data['is_active'] = $request->has('is_active') ? (bool)$request->is_active : true;
            $data['target'] = $data['target'] ?? '_self';
            $data['link_type'] = $data['link_type'] ?? 'top_menu';

            $link = MenuLink::create($data);
            $link->load(['page']);

            return response()->json([
                'success' => true,
                'message' => 'Menu link created successfully',
                'data' => $link
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create menu link',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified menu link
     */
    public function show($id)
    {
        $link = MenuLink::with(['menu', 'parent', 'children', 'page'])->find($id);

        if (!$link) {
            return response()->json([
                'success' => false,
                'message' => 'Menu link not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $link
        ]);
    }

    /**
     * Update the specified menu link
     */
    public function update(Request $request, $id)
    {
        $link = MenuLink::find($id);

        if (!$link) {
            return response()->json([
                'success' => false,
                'message' => 'Menu link not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'menu_id' => 'sometimes|required|exists:menus,id',
            'parent_id' => 'nullable|exists:menu_links,id',
            'title' => 'sometimes|required|string|max:255',
            'url' => 'sometimes|required|string|max:255',
            'link_type' => 'nullable|string|in:nav_link,top_menu,footer_link',
            'page_id' => 'nullable|exists:pages,id',
            'target' => 'nullable|string|in:_self,_blank',
            'order' => 'nullable|integer',
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
            $data = $request->only(['menu_id', 'parent_id', 'title', 'url', 'link_type', 'page_id', 'target', 'order']);
            
            if ($request->has('is_active')) {
                $data['is_active'] = (bool)$request->is_active;
            }

            $link->update($data);
            $link->load(['page']);

            return response()->json([
                'success' => true,
                'message' => 'Menu link updated successfully',
                'data' => $link
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update menu link',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified menu link
     */
    public function destroy($id)
    {
        $link = MenuLink::find($id);

        if (!$link) {
            return response()->json([
                'success' => false,
                'message' => 'Menu link not found'
            ], 404);
        }

        try {
            $link->delete();

            return response()->json([
                'success' => true,
                'message' => 'Menu link deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete menu link',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    public function toggle(Request $request, $id)
    {
        $link = MenuLink::find($id);

        if (!$link) {
            return response()->json([
                'success' => false,
                'message' => 'Menu link not found'
            ], 404);
        }

        try {
            $link->is_active = $request->input('is_active', !$link->is_active);
            $link->save();

            return response()->json([
                'success' => true,
                'message' => 'Status updated successfully',
                'data' => $link
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update status',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}