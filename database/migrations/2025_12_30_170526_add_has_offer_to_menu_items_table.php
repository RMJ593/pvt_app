<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('menu_items', function (Blueprint $table) {
            $table->boolean('has_offer')->default(false)->after('is_special_selection');
            $table->decimal('original_price', 10, 2)->nullable()->after('price');
            $table->integer('offer_percentage')->nullable()->after('original_price');
        });
    }

    public function down()
    {
        Schema::table('menu_items', function (Blueprint $table) {
            $table->dropColumn(['has_offer', 'original_price', 'offer_percentage']);
        });
    }
};