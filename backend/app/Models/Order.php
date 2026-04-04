<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\OrderItem;


class Order extends Model
{
    use HasFactory;

    //Cac cot duoc phep luu du lieu
    protected $fillable = [
        'user_id',
        'total_price',
        'status',
        'address',
        'phone',
        'note'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}