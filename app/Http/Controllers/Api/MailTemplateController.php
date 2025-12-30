<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MailTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MailTemplateController extends Controller
{
    public function index()
    {
        try {
            $templates = MailTemplate::orderBy('created_at', 'desc')->get();
            return response()->json($templates);
        } catch (\Exception $e) {
            Log::error('Error fetching mail templates: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to fetch mail templates'], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'subject' => 'required|string|max:255',
                'body' => 'required|string'
            ]);

            $template = MailTemplate::create([
                'name' => $validated['name'],
                'subject' => $validated['subject'],
                'body' => $validated['body'],
                'is_active' => true
            ]);

            return response()->json($template, 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error creating mail template: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to create mail template'], 500);
        }
    }

    public function show($id)
    {
        try {
            $template = MailTemplate::findOrFail($id);
            return response()->json($template);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Mail template not found'], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $template = MailTemplate::findOrFail($id);

            $validated = $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'subject' => 'sometimes|required|string|max:255',
                'body' => 'sometimes|required|string',
                'is_active' => 'sometimes|boolean'
            ]);

            $template->update(array_filter($validated, function($value) {
                return $value !== null;
            }));

            return response()->json($template);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error updating mail template: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to update mail template'], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $template = MailTemplate::findOrFail($id);
            $template->delete();
            return response()->json(null, 204);
        } catch (\Exception $e) {
            Log::error('Error deleting mail template: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to delete mail template'], 500);
        }
    }
}