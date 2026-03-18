<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateProductsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->onDelete('cascade'); 
            $table->string('name'); // Tên món
            $table->decimal('price', 15, 2); // Giá tiền
            $table->text('description')->nullable(); // Mô tả
            $table->string('image')->nullable(); // Link ảnh
            $table->boolean('is_available')->default(true); // Còn hàng hay hết
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
        Schema::dropIfExists('products');
    }
}
