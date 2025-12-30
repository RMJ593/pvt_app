<?php

// TableBookingController.php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TableBooking;
use Illuminate\Http\Request;

class TableBookingController extends Controller
{
    public function index()
    {
        $bookings = TableBooking::latest()->get();
        return response()->json(['success' => true, 'data' => $bookings]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'phone' => 'required|string',
            'guests' => 'required|integer|min:1',
            'booking_date' => 'required|date',
            'booking_time' => 'required',
            'special_requests' => 'nullable|string'
        ]);

        $booking = TableBooking::create($validated);
        return response()->json([
            'success' => true,
            'message' => 'Booking created successfully',
            'data' => $booking
        ], 201);
    }

    public function show(TableBooking $tableBooking)
    {
        return response()->json(['success' => true, 'data' => $tableBooking]);
    }

    public function update(Request $request, TableBooking $tableBooking)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,cancelled,completed'
        ]);

        $tableBooking->update($validated);
        return response()->json([
            'success' => true,
            'message' => 'Booking updated successfully',
            'data' => $tableBooking
        ]);
    }

    public function destroy(TableBooking $tableBooking)
    {
        $tableBooking->delete();
        return response()->json([
            'success' => true,
            'message' => 'Booking deleted successfully'
        ]);
    }
}