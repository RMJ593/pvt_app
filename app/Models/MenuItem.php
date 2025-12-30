<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class MenuItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'description',
        'image',
        'price',
        'offer_price',
        'discount_percentage',
        'discount_price',
        'is_vegetarian',
        'is_spicy',
        'is_available',
        'is_featured',
        'is_active',
        'is_special_dish',
        'is_special_offer',
        'is_chef_selection',
        'order'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'offer_price' => 'decimal:2',
        'discount_price' => 'decimal:2',
        'discount_percentage' => 'integer',
        'is_vegetarian' => 'boolean',
        'is_spicy' => 'boolean',
        'is_available' => 'boolean',
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
        'is_special_dish' => 'boolean',
        'is_special_offer' => 'boolean',
        'is_chef_selection' => 'boolean',
    ];

    protected $appends = ['final_price', 'has_discount', 'has_offer'];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($item) {
            if (empty($item->slug)) {
                $item->slug = Str::slug($item->name);
            }
        });
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function getFinalPriceAttribute()
    {
        // Prioritize offer_price, then discount_price, then regular price
        if ($this->offer_price !== null && $this->offer_price > 0) {
            return $this->offer_price;
        }
        return $this->discount_price ?? $this->price;
    }

    public function getHasDiscountAttribute()
    {
        return $this->discount_price !== null && $this->discount_price < $this->price;
    }

    public function getHasOfferAttribute()
    {
        return $this->offer_price !== null && $this->offer_price > 0 && $this->offer_price < $this->price;
    }

    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeVegetarian($query)
    {
        return $query->where('is_vegetarian', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order');
    }

    public function scopeSpecialDish($query)
    {
        return $query->where('is_special_dish', true);
    }

    public function scopeSpecialOffer($query)
    {
        return $query->where('is_special_offer', true);
    }

    public function scopeChefSelection($query)
    {
        return $query->where('is_chef_selection', true);
    }
}