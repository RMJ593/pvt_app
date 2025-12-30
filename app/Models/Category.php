<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Category extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'small_heading',
        'location',
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
    ];

    // Auto-generate slug before creating
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($category) {
            if (empty($category->slug)) {
                $category->slug = Str::slug($category->name);
                
                // Ensure slug is unique
                $originalSlug = $category->slug;
                $count = 1;
                while (static::where('slug', $category->slug)->exists()) {
                    $category->slug = $originalSlug . '-' . $count;
                    $count++;
                }
            }
        });

        static::updating(function ($category) {
            if ($category->isDirty('name') && empty($category->slug)) {
                $category->slug = Str::slug($category->name);
                
                // Ensure slug is unique (excluding current record)
                $originalSlug = $category->slug;
                $count = 1;
                while (static::where('slug', $category->slug)->where('id', '!=', $category->id)->exists()) {
                    $category->slug = $originalSlug . '-' . $count;
                    $count++;
                }
            }
        });
    }

    public function menuItems()
    {
        return $this->hasMany(MenuItem::class);
    }
}