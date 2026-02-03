<?php

namespace Database\Seeders;

use App\Models\Menu;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class MenuSeeder extends Seeder
{
    public function run(): void
    {
        Menu::firstOrCreate(
            ['slug' => 'main-menu'],
            [
                'name' => 'Main Menu',
                'location' => 'header',
                'is_active' => true,
                'order' => 1,
            ]
        );

        Menu::firstOrCreate(
            ['slug' => 'footer-menu'],
            [
                'name' => 'Footer Menu',
                'location' => 'footer',
                'is_active' => true,
                'order' => 2,
            ]
        );
    }
}