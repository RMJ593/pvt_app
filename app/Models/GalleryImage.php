<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GalleryImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'image',
        'cloudinary_public_id',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}