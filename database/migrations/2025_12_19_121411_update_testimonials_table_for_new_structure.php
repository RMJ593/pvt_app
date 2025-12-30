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
        Schema::table('testimonials', function (Blueprint $table) {
            // Drop old columns
            $table->dropColumn(['rating', 'is_featured']);
            
            // Add new column
            $table->boolean('is_active')->default(true)->after('customer_image');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('testimonials', function (Blueprint $table) {
            // Restore old columns
            $table->integer('rating')->default(5);
            $table->boolean('is_featured')->default(false);
            
            // Remove new column
            $table->dropColumn('is_active');
        });
    }
};