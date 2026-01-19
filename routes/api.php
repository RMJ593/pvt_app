<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\MenuItemController;
use App\Http\Controllers\Api\UserResponseController;
use App\Http\Controllers\Api\TableBookingController;
use App\Http\Controllers\Api\PageController;
use App\Http\Controllers\Api\BlogController;
use App\Http\Controllers\Api\BlogCategoryController;
use App\Http\Controllers\Api\TeamMemberController;
use App\Http\Controllers\TestimonialController;
use App\Http\Controllers\Api\GalleryController;
use App\Http\Controllers\Api\HeroBannerController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\MenuLinkController;
use App\Http\Controllers\Api\MailTemplateController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Api\FooterLinkController;
use App\Http\Controllers\Api\DiagnosticController;

// ============================================
// PUBLIC ROUTES (NO AUTH REQUIRED)
// ============================================

// Auth
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Categories (Public)
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);

// Menu Items (Public)
Route::get('/menu-items', [MenuItemController::class, 'index']);
Route::get('/menu-items/{menuItem}', [MenuItemController::class, 'show']);

// Pages (Public)
Route::get('/pages', [PageController::class, 'index']);
Route::get('/pages/{page}', [PageController::class, 'show']);

// Blogs (Public) ✅ KEEP THESE
Route::get('/blogs', [BlogController::class, 'index']);
Route::get('/blogs/{blog}', [BlogController::class, 'show']);

// Blog Categories (Public) ✅ ADD THIS
Route::get('/blog-categories', [BlogCategoryController::class, 'index']);

// Team Members (Public)
Route::get('/team-members', [TeamMemberController::class, 'index']);

// Testimonials (Public)
Route::get('/testimonials', [TestimonialController::class, 'index']);

// Gallery (Public)
Route::get('/gallery', [GalleryController::class, 'index']);

// Hero Banners (Public)
Route::get('/hero-banners', [HeroBannerController::class, 'index']);
Route::get('/hero-banners/{heroBanner}', [HeroBannerController::class, 'show']);

// Settings (Public)
Route::get('/settings', [SettingsController::class, 'index']);

// Menu Links (Public)
Route::get('/menu-links', [MenuLinkController::class, 'index']);

// Footer Links (Public)
Route::get('/footer-links', [FooterLinkController::class, 'index']);

// Public contact/booking
Route::post('/user-responses', [UserResponseController::class, 'store']);
Route::post('/table-bookings', [TableBookingController::class, 'store']);
Route::post('/bookings', [TableBookingController::class, 'store']); // Alias

// Diagnostic routes
Route::get('/diagnose', [DiagnosticController::class, 'diagnose']);
Route::post('/test-upload', [DiagnosticController::class, 'testUpload']);

// ============================================
// PROTECTED ROUTES (AUTH REQUIRED)
// ============================================

Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Categories (Admin)
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::post('/categories/{id}', [CategoryController::class, 'update']);
    Route::put('/categories/{category}', [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

    // Menu Items (Admin)
    Route::post('/menu-items', [MenuItemController::class, 'store']);
    Route::post('/menu-items/{id}', [MenuItemController::class, 'update']);
    Route::put('/menu-items/{id}', [MenuItemController::class, 'update']);
    Route::delete('/menu-items/{id}', [MenuItemController::class, 'destroy']);

    // User Responses (Admin)
    Route::get('/user-responses', [UserResponseController::class, 'index']);
    Route::get('/user-responses/{userResponse}', [UserResponseController::class, 'show']);
    Route::put('/user-responses/{userResponse}', [UserResponseController::class, 'update']);
    Route::delete('/user-responses/{userResponse}', [UserResponseController::class, 'destroy']);

    // Table Bookings (Admin)
    Route::get('/table-bookings', [TableBookingController::class, 'index']);
    Route::get('/table-bookings/{tableBooking}', [TableBookingController::class, 'show']);
    Route::put('/table-bookings/{tableBooking}', [TableBookingController::class, 'update']);
    Route::delete('/table-bookings/{tableBooking}', [TableBookingController::class, 'destroy']);

    // Pages (Admin CRUD)
    Route::post('/pages', [PageController::class, 'store']);
    Route::post('/pages/{id}', [PageController::class, 'update']);
    Route::patch('/pages/{id}/status', [PageController::class, 'updateStatus']);
    Route::delete('/pages/{id}', [PageController::class, 'destroy']);

    // Blogs (Admin CRUD) ✅ FIXED - REMOVED DUPLICATE GET ROUTES
    Route::post('/blogs', [BlogController::class, 'store']);
    Route::put('/blogs/{id}', [BlogController::class, 'update']);
    Route::post('/blogs/{id}', [BlogController::class, 'update']); // For FormData with _method
    Route::delete('/blogs/{id}', [BlogController::class, 'destroy']);
    
    // Blog Categories (Admin) ✅ FIXED - REMOVED DUPLICATE INDEX
    Route::post('/blog-categories', [BlogCategoryController::class, 'store']);
    Route::get('/blog-categories/{id}', [BlogCategoryController::class, 'show']);
    Route::put('/blog-categories/{id}', [BlogCategoryController::class, 'update']);
    Route::post('/blog-categories/{id}', [BlogCategoryController::class, 'update']);
    Route::delete('/blog-categories/{id}', [BlogCategoryController::class, 'destroy']);

    // Team Members (Admin CRUD)
    Route::post('/team-members', [TeamMemberController::class, 'store']);
    Route::get('/team-members/{id}', [TeamMemberController::class, 'show']);
    Route::post('/team-members/{id}', [TeamMemberController::class, 'update']);
    Route::put('/team-members/{id}', [TeamMemberController::class, 'update']);
    Route::patch('/team-members/{id}/toggle', [TeamMemberController::class, 'toggle']);
    Route::delete('/team-members/{id}', [TeamMemberController::class, 'destroy']);

    // Testimonials (Admin CRUD)
    Route::post('/testimonials', [TestimonialController::class, 'store']);
    Route::get('/testimonials/{id}', [TestimonialController::class, 'show']);
    Route::post('/testimonials/{id}', [TestimonialController::class, 'update']);
    Route::put('/testimonials/{id}', [TestimonialController::class, 'update']);
    Route::delete('/testimonials/{id}', [TestimonialController::class, 'destroy']);

    // Gallery (Admin CRUD)
    Route::post('/gallery', [GalleryController::class, 'store']);
    Route::get('/gallery/{id}', [GalleryController::class, 'show']);
    Route::post('/gallery/{id}', [GalleryController::class, 'update']);
    Route::put('/gallery/{galleryImage}', [GalleryController::class, 'update']);
    Route::delete('/gallery/{galleryImage}', [GalleryController::class, 'destroy']);

    // Hero Banners (Admin CRUD)
    Route::post('/hero-banners', [HeroBannerController::class, 'store']);
    Route::put('/hero-banners/{heroBanner}', [HeroBannerController::class, 'update']);
    Route::delete('/hero-banners/{heroBanner}', [HeroBannerController::class, 'destroy']);

    // Menus & Links (Admin)
    Route::apiResource('menus', MenuController::class)->except(['index', 'show']);
    
    // Menu Links (Admin CRUD - except public index)
    Route::post('/menu-links', [MenuLinkController::class, 'store']);
    Route::get('/menu-links/{id}', [MenuLinkController::class, 'show']);
    Route::put('/menu-links/{id}', [MenuLinkController::class, 'update']);
    Route::patch('/menu-links/{id}/toggle', [MenuLinkController::class, 'toggle']);
    Route::delete('/menu-links/{id}', [MenuLinkController::class, 'destroy']);

    // Settings (Admin)
    Route::post('/settings', [SettingsController::class, 'update']);
    Route::post('/clear-cache', [SettingsController::class, 'clearCache']);

    // Roles (Admin)
    Route::get('/roles', [RoleController::class, 'index']);
    Route::post('/roles', [RoleController::class, 'store']);
    Route::get('/roles/{id}', [RoleController::class, 'show']);
    Route::put('/roles/{id}', [RoleController::class, 'update']);
    Route::delete('/roles/{id}', [RoleController::class, 'destroy']);

    // Users (Admin)
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::patch('/users/{id}/status', [UserController::class, 'updateStatus']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);

    // Footer Links (Admin CRUD - except public index)
    Route::post('/footer-links', [FooterLinkController::class, 'store']);
    Route::get('/footer-links/{id}', [FooterLinkController::class, 'show']);
    Route::put('/footer-links/{id}', [FooterLinkController::class, 'update']);
    Route::patch('/footer-links/{id}/toggle', [FooterLinkController::class, 'toggle']);
    Route::delete('/footer-links/{id}', [FooterLinkController::class, 'destroy']);

    // Mail Templates (Admin)
    Route::apiResource('mail-templates', MailTemplateController::class);
});

// ============================================
// DEBUG/TEST ROUTES
// ============================================

Route::get('/test-storage', function () {
    return response()->json([
        'storage_path' => storage_path('app/public'),
        'public_path' => public_path('storage'),
        'symlink_exists' => is_link(public_path('storage')),
        'symlink_target' => is_link(public_path('storage')) ? readlink(public_path('storage')) : null,
        'public_storage_exists' => file_exists(public_path('storage')),
        'files_in_hero_banners' => \Illuminate\Support\Facades\Storage::disk('public')->allFiles('hero-banners'),
        'app_url' => config('app.url'),
        'filesystem_disk' => config('filesystems.default'),
        'storage_url' => config('filesystems.disks.public.url'),
    ]);
});

Route::get('/test-cloudinary', function() {
    try {
        $configured = config('cloudinary.cloud_name') !== null;
        return response()->json([
            'cloudinary_configured' => $configured,
            'cloud_name' => config('cloudinary.cloud_name'),
            'has_api_key' => !empty(config('cloudinary.api_key')),
            'package_installed' => class_exists('CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary')
        ]);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});

Route::get('/debug-logs', function() {
    $logFile = storage_path('logs/laravel.log');
    if (file_exists($logFile)) {
        $logs = file_get_contents($logFile);
        $lastError = substr($logs, -5000);
        return response('<pre>' . htmlspecialchars($lastError) . '</pre>');
    }
    return 'No logs found';
});

Route::get('/test-gallery', function() {
    $gallery = \App\Models\Gallery::all();
    return response()->json([
        'total_images' => $gallery->count(),
        'images' => $gallery->map(function($img) {
            return [
                'id' => $img->id,
                'title' => $img->title,
                'image_url' => $img->image,
                'is_active' => $img->is_active,
                'is_cloudinary' => str_starts_with($img->image ?? '', 'https://res.cloudinary.com')
            ];
        })
    ]);
});