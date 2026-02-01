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
        if (!Schema::hasTable('menu_links')) {
            Schema::create('menu_links', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('menu_id')->nullable();
                $table->unsignedBigInteger('parent_id')->nullable();
                $table->string('title');
                $table->string('link_text')->nullable();
                $table->string('url');
                $table->string('link_type')->default('top_menu');
                $table->unsignedBigInteger('page_id')->nullable();
                $table->string('page_type')->nullable();
                $table->string('target')->default('_self');
                $table->integer('order')->default(0);
                $table->boolean('is_active')->default(true);
                $table->boolean('is_group')->default(false);
                $table->timestamps();

                $table->foreign('menu_id')->references('id')->on('menus')->onDelete('cascade');
                $table->foreign('parent_id')->references('id')->on('menu_links')->onDelete('cascade');
                $table->foreign('page_id')->references('id')->on('pages')->onDelete('set null');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menu_links');
    }
};