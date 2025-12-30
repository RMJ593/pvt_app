<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Menu extends Model
{
    protected $fillable = ['name', 'slug', 'location', 'order', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function links()
    {
        return $this->hasMany(MenuLink::class)->orderBy('order');
    }
}