<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id', 'product_id', 'quantity', 'price'
    ];

    // 1 Chi tiết này nằm trong 1 Đơn hàng cụ thể
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    // 1 Chi tiết này đại diện cho 1 Món ăn cụ thể
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}