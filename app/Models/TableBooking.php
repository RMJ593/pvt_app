<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TableBooking extends Model
{
    protected $fillable = [
        'name', 'email', 'phone', 'guests', 'booking_date',
        'booking_time', 'special_requests', 'status'
    ];

    protected $casts = [
        'booking_date' => 'date',
        'guests' => 'integer'
    ];
}