<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FooterLink;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FooterLinkController extends Controller
{
    /**
     * Display a listing of footer links
     */
    public function index()
    {
        try {
            $footerLinks = FooterLink::orderBy('order', 'asc')->get();
            
            return response()->json([
                'success' => true,
                'data' => $footerLinks
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch footer links',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created footer link
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'url' => 'required|string|max:255',
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
            $data = $request->all();
            
            // Set defaults
            if (!isset($data['is_active'])) {
                $data['is_active'] = true;
            }
            if (!isset($data['order'])) {
                $data['order'] = 0;
            }
            
            $footerLink = FooterLink::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Footer link created successfully',
                'data' => $footerLink
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create footer link',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified footer link
     */
    public function show($id)
    {
        try {
            $footerLink = FooterLink::findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $footerLink
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Footer link not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified footer link
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'url' => 'required|string|max:255',
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
            $footerLink = FooterLink::findOrFail($id);
            $footerLink->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Footer link updated successfully',
                'data' => $footerLink
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update footer link',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle footer link status
     */
    public function toggle(Request $request, $id)
    {
        try {
            $footerLink = FooterLink::findOrFail($id);
            
            $newStatus = $request->has('is_active') 
                ? $request->is_active 
                : !$footerLink->is_active;
            
            $footerLink->update(['is_active' => $newStatus]);

            return response()->json([
                'success' => true,
                'message' => 'Footer link status toggled successfully',
                'data' => $footerLink
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to toggle footer link status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified footer link
     */
    public function destroy($id)
    {
        try {
            $footerLink = FooterLink::findOrFail($id);
            $footerLink->delete();

            return response()->json([
                'success' => true,
                'message' => 'Footer link deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete footer link',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}