<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Blog extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'small_description',
        'content',
        'image',
        'banner_image',
        'meta_image',
        'category_id',
        'tags',
        'seo_title',
        'meta_keywords',
        'meta_description',
        'robots',
        'og_type',
        'is_active',
        'status',
        'author'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationship with BlogCategory
    public function category()
    {
        return $this->belongsTo(BlogCategory::class, 'category_id');
    }

    // Accessor for excerpt (if small_description exists)
    public function getExcerptAttribute()
    {
        return $this->small_description;
    }

    // Accessor for blog_category (alternative name)
    public function getBlogCategoryAttribute()
    {
        return $this->category;
    }
}