<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Testimonial extends Model
{
    protected $fillable = [
        'customer_name',
        'review',
        'customer_image',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}