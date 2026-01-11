<?php

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
use App\Http\Controllers\Api\FooterLinkController;
use App\Http\Controllers\Api\MailTemplateController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Api\DiagnosticController;

// ============================================
// PUBLIC ROUTES (No Authentication Required)
// ============================================

// Auth
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public Data
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);
Route::get('/menu-items', [MenuItemController::class, 'index']);
Route::get('/menu-items/{id}', [MenuItemController::class, 'show']);
Route::get('/blogs', [BlogController::class, 'index']);
Route::get('/blogs/{id}', [BlogController::class, 'show']);
Route::get('/team-members', [TeamMemberController::class, 'index']);
Route::get('/testimonials', [TestimonialController::class, 'index']);
Route::get('/gallery', [GalleryController::class, 'index']);
Route::get('/hero-banners', [HeroBannerController::class, 'index']);
Route::get('/settings', [SettingsController::class, 'index']);
Route::get('/menu-links', [MenuLinkController::class, 'index']);

// Pages (Public can view, but not by slug - need ID)
Route::get('/pages', [PageController::class, 'index']); // Can filter by ?slug=about-us
Route::get('/pages/{id}', [PageController::class, 'show']);

// Public Contact/Booking
Route::post('/user-responses', [UserResponseController::class, 'store']);
Route::post('/table-bookings', [TableBookingController::class, 'store']);

// Diagnostic Routes (Remove in production)
Route::get('/diagnose', [DiagnosticController::class, 'diagnose']);
Route::post('/test-upload', [DiagnosticController::class, 'testUpload']);

// ============================================
// PROTECTED ROUTES (Authentication Required)
// ============================================

Route::middleware('auth:sanctum')->group(function () {
    
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Categories
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{id}', [CategoryController::class, 'update']);
    Route::post('/categories/{id}', [CategoryController::class, 'update']); // FormData support
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

    // Menu Items
    Route::post('/menu-items', [MenuItemController::class, 'store']);
    Route::put('/menu-items/{id}', [MenuItemController::class, 'update']);
    Route::post('/menu-items/{id}', [MenuItemController::class, 'update']); // FormData support
    Route::delete('/menu-items/{id}', [MenuItemController::class, 'destroy']);

    // Blogs
    Route::post('/blogs', [BlogController::class, 'store']);
    Route::put('/blogs/{id}', [BlogController::class, 'update']);
    Route::post('/blogs/{id}', [BlogController::class, 'update']); // FormData support
    Route::delete('/blogs/{id}', [BlogController::class, 'destroy']);

    // Blog Categories
    Route::apiResource('blog-categories', BlogCategoryController::class);

    // Pages
    Route::post('/pages', [PageController::class, 'store']);
    Route::put('/pages/{id}', [PageController::class, 'update']);
    Route::post('/pages/{id}', [PageController::class, 'update']); // FormData support
    Route::delete('/pages/{id}', [PageController::class, 'destroy']);

    // Gallery
    Route::post('/gallery', [GalleryController::class, 'store']);
    Route::get('/gallery/{id}', [GalleryController::class, 'show']);
    Route::put('/gallery/{id}', [GalleryController::class, 'update']);
    Route::post('/gallery/{id}', [GalleryController::class, 'update']); // FormData support
    Route::delete('/gallery/{id}', [GalleryController::class, 'destroy']);

    // Team Members
    Route::post('/team-members', [TeamMemberController::class, 'store']);
    Route::get('/team-members/{id}', [TeamMemberController::class, 'show']);
    Route::put('/team-members/{id}', [TeamMemberController::class, 'update']);
    Route::post('/team-members/{id}', [TeamMemberController::class, 'update']); // FormData support
    Route::patch('/team-members/{id}/toggle', [TeamMemberController::class, 'toggle']);
    Route::delete('/team-members/{id}', [TeamMemberController::class, 'destroy']);

    // Testimonials
    Route::post('/testimonials', [TestimonialController::class, 'store']);
    Route::get('/testimonials/{id}', [TestimonialController::class, 'show']);
    Route::put('/testimonials/{id}', [TestimonialController::class, 'update']);
    Route::post('/testimonials/{id}', [TestimonialController::class, 'update']); // FormData support
    Route::delete('/testimonials/{id}', [TestimonialController::class, 'destroy']);

    // Hero Banners
    Route::post('/hero-banners', [HeroBannerController::class, 'store']);
    Route::get('/hero-banners/{id}', [HeroBannerController::class, 'show']);
    Route::put('/hero-banners/{id}', [HeroBannerController::class, 'update']);
    Route::delete('/hero-banners/{id}', [HeroBannerController::class, 'destroy']);

    // User Responses
    Route::get('/user-responses', [UserResponseController::class, 'index']);
    Route::get('/user-responses/{id}', [UserResponseController::class, 'show']);
    Route::put('/user-responses/{id}', [UserResponseController::class, 'update']);
    Route::delete('/user-responses/{id}', [UserResponseController::class, 'destroy']);

    // Table Bookings
    Route::get('/table-bookings', [TableBookingController::class, 'index']);
    Route::get('/table-bookings/{id}', [TableBookingController::class, 'show']);
    Route::put('/table-bookings/{id}', [TableBookingController::class, 'update']);
    Route::delete('/table-bookings/{id}', [TableBookingController::class, 'destroy']);

    // Settings
    Route::post('/settings', [SettingsController::class, 'update']);
    Route::post('/clear-cache', [SettingsController::class, 'clearCache']);

    // Menus & Links
    Route::apiResource('menus', MenuController::class);
    Route::apiResource('menu-links', MenuLinkController::class);
    Route::patch('/menu-links/{id}/toggle', [MenuLinkController::class, 'toggle']);

    // Footer Links
    Route::get('/footer-links', [FooterLinkController::class, 'index']);
    Route::post('/footer-links', [FooterLinkController::class, 'store']);
    Route::get('/footer-links/{id}', [FooterLinkController::class, 'show']);
    Route::put('/footer-links/{id}', [FooterLinkController::class, 'update']);
    Route::patch('/footer-links/{id}/toggle', [FooterLinkController::class, 'toggle']);
    Route::delete('/footer-links/{id}', [FooterLinkController::class, 'destroy']);

    // Mail Templates
    Route::apiResource('mail-templates', MailTemplateController::class);

    // Roles
    Route::get('/roles', [RoleController::class, 'index']);
    Route::post('/roles', [RoleController::class, 'store']);
    Route::get('/roles/{id}', [RoleController::class, 'show']);
    Route::put('/roles/{id}', [RoleController::class, 'update']);
    Route::delete('/roles/{id}', [RoleController::class, 'destroy']);

    // Users
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::patch('/users/{id}/status', [UserController::class, 'updateStatus']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
});