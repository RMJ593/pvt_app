<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserResponse;
use Illuminate\Http\Request;

class UserResponseController extends Controller
{
    public function index()
    {
        $responses = UserResponse::latest()->get();
        return response()->json(['success' => true, 'data' => $responses]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'phone' => 'nullable|string',
            'subject' => 'nullable|string',
            'message' => 'required|string'
        ]);

        $response = UserResponse::create($validated);
        return response()->json([
            'success' => true,
            'message' => 'Message sent successfully',
            'data' => $response
        ], 201);
    }

    public function show(UserResponse $userResponse)
    {
        return response()->json(['success' => true, 'data' => $userResponse]);
    }

    public function update(Request $request, UserResponse $userResponse)
    {
        $validated = $request->validate([
            'status' => 'required|in:new,read,replied'
        ]);

        $userResponse->update($validated);
        return response()->json([
            'success' => true,
            'message' => 'Status updated successfully',
            'data' => $userResponse
        ]);
    }

    public function destroy(UserResponse $userResponse)
    {
        $userResponse->delete();
        return response()->json([
            'success' => true,
            'message' => 'Message deleted successfully'
        ]);
    }
}
