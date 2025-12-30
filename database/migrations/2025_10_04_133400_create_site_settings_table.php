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
        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('type')->default('text'); // text, color, image, textarea
            $table->string('group')->default('general'); // general, theme, contact
            $table->timestamps();
        });
        //Default setting insertion
        DB::table('site_settings')->insert([
            ['key' => 'site_name', 'value' => 'My Restaurant', 'type' => 'text', 'group' => 'general'],
            ['key' => 'site_logo', 'value' => null, 'type' => 'image', 'group' => 'general'],
            ['key' => 'primary_color', 'value' => '#dc2626', 'type' => 'color', 'group' => 'theme'],
            ['key' => 'secondary_color', 'value' => '#1f2937', 'type' => 'color', 'group' => 'theme'],
            ['key' => 'font_family', 'value' => 'Inter', 'type' => 'text', 'group' => 'theme'],
            ['key' => 'contact_email', 'value' => 'info@restaurant.com', 'type' => 'text', 'group' => 'contact'],
            ['key' => 'contact_phone', 'value' => '+1234567890', 'type' => 'text', 'group' => 'contact'],
            ['key' => 'address', 'value' => '123 Restaurant St', 'type' => 'textarea', 'group' => 'contact'],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('site_settings');
    }
};
