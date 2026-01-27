<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MenuLink extends Model
{
    protected $fillable = [
        'menu_id',
        'parent_id',
        'title',
        'link_text',
        'url',
        'link_type',
        'page_id',
        'page_type',
        'target',
        'order',
        'is_active',
        'is_group'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_group' => 'boolean',
        'order' => 'integer'
    ];

    protected $with = ['page'];

    public function menu()
    {
        return $this->belongsTo(Menu::class);
    }

    public function parent()
    {
        return $this->belongsTo(MenuLink::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(MenuLink::class, 'parent_id')->orderBy('order');
    }

    public function page()
    {
        return $this->belongsTo(Page::class);
    }
}