<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    // Các cột được phép lưu dữ liệu
    protected $fillable = [
        'user_id', 'total_price', 'status', 'address', 'phone', 'note'
    ];

    // 1 Đơn hàng thì thuộc về 1 Khách hàng (User)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // 1 Đơn hàng thì có NHIỀU Chi tiết đơn hàng (Order Items)
    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}