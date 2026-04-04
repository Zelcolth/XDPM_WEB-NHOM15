<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\OrderItem;
use App\Models\Product;


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

    public function store(Request $request)
    {
    DB::beginTransaction();

    try {
        $total = 0;

        // 1. Tính tổng tiền
        foreach ($request->items as $item) {
            $product = Product::findOrFail($item['product_id']);
            $total += $product->price * $item['quantity'];
        }

        // 2. Tạo order
        $order = Order::create([
            'user_id' => $request->user_id,
            'total_price' => $total,
            'status' => 'pending',
            'address' => $request->address,
            'phone' => $request->phone,
        ]);

        // 3. Tạo order_items
        foreach ($request->items as $item) {
            $product = Product::findOrFail($item['product_id']);

            $order->items()->create([
                'product_id' => $product->id,
                'quantity' => $item['quantity'],
                'price' => $product->price
            ]);
        }

        DB::commit();

        return response()->json([
            'status' => 'success',
            'message' => 'Order created',
            'data' => $order->load('items.product')
        ]);

    } catch (\Exception $e) {
        DB::rollBack();

        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage()
        ], 500);
    }
    }
}