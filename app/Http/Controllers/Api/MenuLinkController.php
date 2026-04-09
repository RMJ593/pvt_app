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

        if ($request->has('menu_id')) {
            $query->where('menu_id', $request->menu_id);
        }

        if ($request->has('link_type')) {
            $query->where('link_type', $request->link_type);
        }

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
     *
     * FIX 1: Removed forced `menu_id = 1` default — menu_id is now truly nullable.
     *         The foreign key on menu_links.menu_id is nullable in the migration,
     *         so null is perfectly valid and won't crash with a FK constraint error.
     *
     * FIX 2: `title` is now populated from `link_text` with a fallback to `title`
     *         so the frontend only needs to send `link_text`.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'menu_id'   => 'nullable|exists:menus,id',
            'parent_id' => 'nullable|exists:menu_links,id',
            // Accept title OR link_text — at least one must be present
            'title'     => 'nullable|string|max:255',
            'link_text' => 'nullable|string|max:255',
            'url'       => 'required|string|max:255',
            'link_type' => 'nullable|string|in:nav_link,top_menu,footer_link',
            'page_id'   => 'nullable|exists:pages,id',
            'page_type' => 'nullable|string|max:255',
            'target'    => 'nullable|string|in:_self,_blank',
            'order'     => 'nullable|integer',
            'is_active' => 'nullable',
            'is_group'  => 'nullable',
        ]);

        // Custom rule: title or link_text must be present
        if (!$request->filled('title') && !$request->filled('link_text')) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors'  => ['title' => ['Either title or link_text is required.']]
            ], 422);
        }

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors'  => $validator->errors()
            ], 422);
        }

        try {
            // Resolve title: prefer link_text, fall back to title field
            $resolvedTitle = $request->filled('link_text')
                ? $request->input('link_text')
                : $request->input('title');

            $data = [
                // FIX 1: null stays null — do NOT default to 1
                'menu_id'   => $request->input('menu_id'),
                'parent_id' => $request->input('parent_id'),
                // FIX 2: title always has a value
                'title'     => $resolvedTitle,
                'link_text' => $resolvedTitle,
                'url'       => $request->input('url', '#'),
                'link_type' => $request->input('link_type', 'top_menu'),
                'page_id'   => $request->input('page_id'),
                'page_type' => $request->input('page_type'),
                'target'    => $request->input('target', '_self'),
                'order'     => (int) $request->input('order', 0),
                // FIX 3: cast booleans safely regardless of int/bool/string sent
                'is_active' => filter_var($request->input('is_active', true), FILTER_VALIDATE_BOOLEAN),
                'is_group'  => filter_var($request->input('is_group', false), FILTER_VALIDATE_BOOLEAN),
            ];

            $link = MenuLink::create($data);
            $link->load(['page']);

            return response()->json([
                'success' => true,
                'message' => 'Menu link created successfully',
                'data'    => $link
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create menu link',
                // FIX 4: expose the real error message so frontend can show it
                'error'   => $e->getMessage()
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
            'data'    => $link
        ]);
    }

    /**
     * Update the specified menu link
     *
     * Same fixes applied as store().
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
            'menu_id'   => 'nullable|exists:menus,id',
            'parent_id' => 'nullable|exists:menu_links,id',
            'title'     => 'nullable|string|max:255',
            'link_text' => 'nullable|string|max:255',
            'url'       => 'sometimes|required|string|max:255',
            'link_type' => 'nullable|string|in:nav_link,top_menu,footer_link',
            'page_id'   => 'nullable|exists:pages,id',
            'page_type' => 'nullable|string|max:255',
            'target'    => 'nullable|string|in:_self,_blank',
            'order'     => 'nullable|integer',
            'is_active' => 'nullable',
            'is_group'  => 'nullable',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors'  => $validator->errors()
            ], 422);
        }

        try {
            $data = [];

            // Only update fields that were actually sent
            if ($request->has('menu_id')) {
                $data['menu_id'] = $request->input('menu_id'); // null is valid
            }

            if ($request->has('parent_id')) {
                $data['parent_id'] = $request->input('parent_id');
            }

            // Resolve title/link_text
            if ($request->filled('link_text') || $request->filled('title')) {
                $resolvedTitle = $request->filled('link_text')
                    ? $request->input('link_text')
                    : $request->input('title');
                $data['title']     = $resolvedTitle;
                $data['link_text'] = $resolvedTitle;
            }

            foreach (['url', 'link_type', 'page_id', 'page_type', 'target'] as $field) {
                if ($request->has($field)) {
                    $data[$field] = $request->input($field);
                }
            }

            if ($request->has('order')) {
                $data['order'] = (int) $request->input('order');
            }

            if ($request->has('is_active')) {
                $data['is_active'] = filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN);
            }

            if ($request->has('is_group')) {
                $data['is_group'] = filter_var($request->input('is_group'), FILTER_VALIDATE_BOOLEAN);
            }

            $link->update($data);
            $link->load(['page']);

            return response()->json([
                'success' => true,
                'message' => 'Menu link updated successfully',
                'data'    => $link
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update menu link',
                'error'   => $e->getMessage()
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
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle active status
     */
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
            $link->is_active = $request->has('is_active')
                ? filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN)
                : !$link->is_active;
            $link->save();

            return response()->json([
                'success' => true,
                'message' => 'Status updated successfully',
                'data'    => $link
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update status',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
}