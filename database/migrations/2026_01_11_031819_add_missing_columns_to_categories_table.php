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
        // Check if table exists and modify it, or create it fresh
        if (Schema::hasTable('categories')) {
            // Table exists, add missing columns
            Schema::table('categories', function (Blueprint $table) {
                if (!Schema::hasColumn('categories', 'small_heading')) {
                    $table->string('small_heading')->nullable()->after('name');
                }
                if (!Schema::hasColumn('categories', 'location')) {
                    $table->string('location')->nullable()->after('small_heading');
                }
                if (!Schema::hasColumn('categories', 'is_royalty')) {
                    $table->boolean('is_royalty')->default(false)->after('is_active');
                }
                if (!Schema::hasColumn('categories', 'is_special_selection')) {
                    $table->boolean('is_special_selection')->default(false)->after('is_royalty');
                }
            });
        } else {
            // Table doesn't exist, create it with all columns
            Schema::create('categories', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('small_heading')->nullable();
                $table->string('location')->nullable();
                $table->string('slug')->nullable();
                $table->text('description')->nullable();
                $table->string('image')->nullable();
                $table->integer('order')->default(0)->nullable();
                $table->boolean('is_active')->default(true);
                $table->boolean('is_royalty')->default(false);
                $table->boolean('is_special_selection')->default(false);
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('categories')) {
            Schema::table('categories', function (Blueprint $table) {
                $columns = ['small_heading', 'location', 'is_royalty', 'is_special_selection'];
                foreach ($columns as $column) {
                    if (Schema::hasColumn('categories', $column)) {
                        $table->dropColumn($column);
                    }
                }
            });
        }
    }
};