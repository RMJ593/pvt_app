<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'small_heading',
        'location',
        'image',
        'is_royalty',
        'is_special_selection',
        'is_active'
    ];

    protected $casts = [
        'is_royalty' => 'boolean',
        'is_special_selection' => 'boolean',
        'is_active' => 'boolean'
    ];
}