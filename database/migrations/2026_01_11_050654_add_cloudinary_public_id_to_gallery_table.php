<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('gallery', function (Blueprint $table) {
            if (!Schema::hasColumn('gallery', 'cloudinary_public_id')) {
                $table->string('cloudinary_public_id')->nullable()->after('image');
            }
        });
    }

    public function down(): void
    {
        Schema::table('gallery', function (Blueprint $table) {
            if (Schema::hasColumn('gallery', 'cloudinary_public_id')) {
                $table->dropColumn('cloudinary_public_id');
            }
        });
    }
};