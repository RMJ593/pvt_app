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

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public data (no auth required)
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);
Route::get('/menu-items', [MenuItemController::class, 'index']);
Route::get('/menu-items/{menuItem}', [MenuItemController::class, 'show']);
Route::get('/pages', [PageController::class, 'index']);
Route::get('/pages/{page}', [PageController::class, 'show']);
Route::get('/blogs', [BlogController::class, 'index']);
Route::get('/blogs/{blog}', [BlogController::class, 'show']);
Route::get('/team-members', [TeamMemberController::class, 'index']);
Route::get('/testimonials', [TestimonialController::class, 'index']);
Route::get('/gallery', [GalleryController::class, 'index']);

// Hero Banners (Public - no auth required)
Route::get('/hero-banners', [HeroBannerController::class, 'index']);
Route::get('/hero-banners/{heroBanner}', [HeroBannerController::class, 'show']);
Route::post('/hero-banners', [HeroBannerController::class, 'store']);
Route::put('/hero-banners/{heroBanner}', [HeroBannerController::class, 'update']);
Route::delete('/hero-banners/{heroBanner}', [HeroBannerController::class, 'destroy']);

// Public contact/booking
Route::post('/user-responses', [UserResponseController::class, 'store']);
Route::post('/table-bookings', [TableBookingController::class, 'store']);

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Categories (Admin)
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::post('/categories/{id}', [CategoryController::class, 'update']); // For FormData
    Route::put('/categories/{category}', [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

    // Products / Menu Items (Admin)
    Route::get('/menu-items/{id}', [MenuItemController::class, 'show']);
    Route::post('/menu-items', [MenuItemController::class, 'store']);
    Route::post('/menu-items/{id}', [MenuItemController::class, 'update']); // For FormData with _method
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

    // Pages (Admin)
    Route::get('/pages', [PageController::class, 'index']);
    Route::post('/pages', [PageController::class, 'store']);
    Route::get('/pages/{id}', [PageController::class, 'show']);
    Route::post('/pages/{id}', [PageController::class, 'update']);
    Route::patch('/pages/{id}/status', [PageController::class, 'updateStatus']);
    Route::delete('/pages/{id}', [PageController::class, 'destroy']);

    // Blogs (Admin)
    Route::post('/blogs', [BlogController::class, 'store']);
    Route::put('/blogs/{blog}', [BlogController::class, 'update']);
    Route::delete('/blogs/{blog}', [BlogController::class, 'destroy']);

    // Blog Categories (Admin) - apiResource handles all CRUD
    Route::apiResource('blog-categories', BlogCategoryController::class);

    // Team Members (Admin)
    Route::get('/team-members/{id}', [TeamMemberController::class, 'show']);
    Route::post('/team-members', [TeamMemberController::class, 'store']);
    Route::post('/team-members/{id}', [TeamMemberController::class, 'update']); // For FormData with _method
    Route::put('/team-members/{id}', [TeamMemberController::class, 'update']);
    Route::patch('/team-members/{id}/toggle', [TeamMemberController::class, 'toggle']);
    Route::delete('/team-members/{id}', [TeamMemberController::class, 'destroy']);

    // Testimonials (Admin)
    Route::post('/testimonials', [TestimonialController::class, 'store']);
    Route::get('/testimonials/{id}', [TestimonialController::class, 'show']);
    Route::post('/testimonials/{id}', [TestimonialController::class, 'update']); // Using POST with _method for file uploads
    Route::put('/testimonials/{id}', [TestimonialController::class, 'update']);
    Route::delete('/testimonials/{id}', [TestimonialController::class, 'destroy']);

    // Gallery (Admin)
    Route::post('/gallery', [GalleryController::class, 'store']);
    Route::get('/gallery/{id}', [GalleryController::class, 'show']);
    Route::post('/gallery/{id}', [GalleryController::class, 'update']); // For FormData
    Route::put('/gallery/{galleryImage}', [GalleryController::class, 'update']);
    Route::delete('/gallery/{galleryImage}', [GalleryController::class, 'destroy']);

    // Menus & Links (Admin)
    Route::apiResource('menus', MenuController::class);
    Route::apiResource('menu-links', MenuLinkController::class);
    Route::patch('/menu-links/{id}/toggle', [MenuLinkController::class, 'toggle']);

    // Settings (Admin)
    Route::get('/settings', [SettingsController::class, 'index']);
    Route::post('/settings', [SettingsController::class, 'update']);
    Route::post('/clear-cache', [SettingsController::class, 'clearCache']);

    // Blogs (Admin) - inside auth:sanctum middleware
    Route::post('/blogs', [BlogController::class, 'store']);
    Route::post('/blogs/{id}', [BlogController::class, 'update']); // For FormData with _method
    Route::put('/blogs/{blog}', [BlogController::class, 'update']);
    Route::delete('/blogs/{blog}', [BlogController::class, 'destroy']);

    // Roles Routes
    Route::get('/roles', [RoleController::class, 'index']);
    Route::post('/roles', [RoleController::class, 'store']);
    Route::get('/roles/{id}', [RoleController::class, 'show']);
    Route::put('/roles/{id}', [RoleController::class, 'update']);
    Route::delete('/roles/{id}', [RoleController::class, 'destroy']);

    // Users Routes
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::patch('/users/{id}/status', [UserController::class, 'updateStatus']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);

    // Footer Links
    Route::get('/footer-links', [FooterLinkController::class, 'index']);
    Route::post('/footer-links', [FooterLinkController::class, 'store']);
    Route::get('/footer-links/{id}', [FooterLinkController::class, 'show']);
    Route::put('/footer-links/{id}', [FooterLinkController::class, 'update']);
    Route::patch('/footer-links/{id}/toggle', [FooterLinkController::class, 'toggle']);
    Route::delete('/footer-links/{id}', [FooterLinkController::class, 'destroy']);
    
    // Inside auth:sanctum middleware
    Route::apiResource('mail-templates', MailTemplateController::class);
});