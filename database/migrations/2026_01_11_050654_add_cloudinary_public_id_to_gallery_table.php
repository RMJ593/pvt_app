<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Check if table exists and add missing column
        if (Schema::hasTable('gallery')) {
            Schema::table('gallery', function (Blueprint $table) {
                if (!Schema::hasColumn('gallery', 'cloudinary_public_id')) {
                    $table->string('cloudinary_public_id')->nullable()->after('image');
                }
            });
        } else {
            // Create the table if it doesn't exist
            Schema::create('gallery', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->string('image');
                $table->string('cloudinary_public_id')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('gallery')) {
            Schema::table('gallery', function (Blueprint $table) {
                if (Schema::hasColumn('gallery', 'cloudinary_public_id')) {
                    $table->dropColumn('cloudinary_public_id');
                }
            });
        }
    }
};