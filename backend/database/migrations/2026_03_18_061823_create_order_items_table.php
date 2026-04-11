<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateOrderItemsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete(); // Thuộc đơn nào
            $table->foreignId('product_id')->constrained()->cascadeOnDelete(); // Món gì
            $table->integer('quantity'); // Số lượng
            $table->decimal('price', 12, 2); // Giá lúc mua (Quan trọng: Lưu giá lúc mua lỡ sau này món tăng giá)
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
        Schema::dropIfExists('order_items');
    }
}
