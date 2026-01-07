<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Check if column doesn't exist before adding it
        if (!Schema::hasColumn('gallery_images', 'cloudinary_public_id')) {
            Schema::table('gallery_images', function (Blueprint $table) {
                $table->string('cloudinary_public_id')->nullable()->after('image');
            });
        }
    }

    public function down()
    {
        if (Schema::hasColumn('gallery_images', 'cloudinary_public_id')) {
            Schema::table('gallery_images', function (Blueprint $table) {
                $table->dropColumn('cloudinary_public_id');
            });
        }
    }
};