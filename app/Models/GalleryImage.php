<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GalleryImage extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'gallery';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'title',
        'image',
        'cloudinary_public_id',
        'is_active'
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Default attribute values.
     */
    protected $attributes = [
        'is_active' => true
    ];

    /**
     * Scope a query to only include active images.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}