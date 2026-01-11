<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'small_heading',
        'location',
        'slug',
        'description',
        'image',
        'order',
        'is_active',
        'is_royalty',
        'is_special_selection'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_royalty' => 'boolean',
        'is_special_selection' => 'boolean',
        'order' => 'integer'
    ];

    protected $attributes = [
        'is_active' => true,
        'is_royalty' => false,
        'is_special_selection' => false,
        'order' => 0
    ];

    /**
     * Boot method to auto-generate slug
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($category) {
            if (empty($category->slug)) {
                $category->slug = Str::slug($category->name);
                
                // Ensure unique slug
                $count = 1;
                $originalSlug = $category->slug;
                while (static::where('slug', $category->slug)->exists()) {
                    $category->slug = $originalSlug . '-' . $count++;
                }
            }
        });

        static::updating(function ($category) {
            if ($category->isDirty('name') && empty($category->slug)) {
                $category->slug = Str::slug($category->name);
            }
        });
    }

    /**
     * Scope for active categories
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for royalty categories
     */
    public function scopeRoyalty($query)
    {
        return $query->where('is_royalty', true);
    }

    /**
     * Scope for special selection categories
     */
    public function scopeSpecialSelection($query)
    {
        return $query->where('is_special_selection', true);
    }

    /**
     * Get products in this category
     */
    public function products()
    {
        return $this->hasMany(Product::class);
    }
}