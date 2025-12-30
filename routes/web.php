<?php

use Illuminate\Support\Facades\Route;

// All routes return welcome view (React handles routing)
Route::get('/{any?}', function () {
    return view('welcome');
})->where('any', '.*');