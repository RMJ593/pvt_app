<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TeamMember extends Model
{
    protected $fillable = [
        'company_id',
        'name',
        'designation',
        'description',
        'image',
        'facebook',
        'twitter',
        'instagram',
        'is_active'
    ];

    public function scopeOrdered($query)
    {
        return $query->orderBy('order');
    }
}
