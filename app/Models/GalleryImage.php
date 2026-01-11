<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Gallery extends Model
{
    use HasFactory;

    protected $table = 'gallery';

    protected $fillable = [
        'title',
        'image',
        'cloudinary_public_id',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];

    protected $attributes = [
        'is_active' => true
    ];

    /**
     * Boot method with auto-cleanup
     */
    protected static function boot()
    {
        parent::boot();

        // Clean up old image when updating with new image
        static::updating(function ($gallery) {
            if ($gallery->isDirty('image') && $gallery->getOriginal('cloudinary_public_id')) {
                $gallery->deleteImageFromCloudinary($gallery->getOriginal('cloudinary_public_id'));
            }
        });

        // Clean up image when deleting
        static::deleting(function ($gallery) {
            if ($gallery->cloudinary_public_id) {
                $gallery->deleteImageFromCloudinary($gallery->cloudinary_public_id);
            }
        });
    }

    /**
     * Delete image from Cloudinary
     */
    public function deleteImageFromCloudinary($publicId)
    {
        try {
            $cloudinary = new \Cloudinary\Cloudinary([
                'cloud' => [
                    'cloud_name' => config('cloudinary.cloud_name'),
                    'api_key' => config('cloudinary.api_key'),
                    'api_secret' => config('cloudinary.api_secret'),
                ],
            ]);

            $result = $cloudinary->uploadApi()->destroy($publicId, ['resource_type' => 'image']);
            
            \Log::info('Deleted gallery image from Cloudinary', [
                'public_id' => $publicId,
                'result' => $result
            ]);
            
            return true;
        } catch (\Exception $e) {
            \Log::error('Failed to delete gallery image from Cloudinary', [
                'public_id' => $publicId,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Scope for active images
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}