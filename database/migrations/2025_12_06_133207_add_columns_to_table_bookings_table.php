<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('table_bookings', function (Blueprint $table) {
            $table->string('name')->after('id');
            $table->string('email')->after('name');
            $table->string('phone')->after('email');
            $table->integer('guests')->after('phone');
            $table->date('booking_date')->after('guests');
            $table->time('booking_time')->after('booking_date');
            $table->text('special_requests')->nullable()->after('booking_time');
            $table->string('status')->default('pending')->after('special_requests'); // pending, confirmed, cancelled, completed
        });
    }

    public function down(): void
    {
        Schema::table('table_bookings', function (Blueprint $table) {
            $table->dropColumn(['name', 'email', 'phone', 'guests', 'booking_date', 'booking_time', 'special_requests', 'status']);
        });
    }
};