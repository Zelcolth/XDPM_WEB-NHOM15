<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateOrdersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Ai đặt
            $table->decimal('total_price', 15, 2); // Tổng tiền
            $table->string('status')->default('pending'); // Trạng thái: pending, shipping, completed, cancelled
            $table->string('address'); // Địa chỉ giao
            $table->string('phone'); // SĐT người nhận
            $table->string('note')->nullable(); // Ghi chú cho quán
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('orders');
    }
}
