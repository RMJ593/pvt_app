<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Page extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'small_heading',
        'page_title',
        'slug',
        'location',
        'hero_banner_id',
        'content',
        'banner_image',
        'meta_image',
        'seo_title',
        'meta_title',
        'meta_keywords',
        'meta_description',
        'robots',
        'og_type',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function heroBanner()
    {
        return $this->belongsTo(HeroBanner::class);
    }
}