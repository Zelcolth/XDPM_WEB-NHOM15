<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Order;
use App\Models\Product;

class OrderController extends Controller
{
    /**
     * @OA\Get(
     *     path="/orders",
     *     tags={"Orders"},
     *     summary="Lấy danh sách đơn hàng",
     *     @OA\Response(
     *         response=200,
     *         description="Thành công"
     *     )
     * )
     */
    public function index()
    {
        $orders = Order::with('items.product')->get();

        return response()->json([
            'status' => 'success',
            'data' => $orders
        ]);
    }

  /**
 * @OA\Post(
 *     path="/orders",
 *     tags={"Orders"},
 *     summary="Tạo đơn hàng",
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"user_id","items"},
 *             
 *             @OA\Property(
 *                 property="user_id",
 *                 type="integer",
 *                 example=1
 *             ),
 *             
 *             @OA\Property(
 *                 property="items",
 *                 type="array",
 *                 @OA\Items(
 *                     @OA\Property(
 *                         property="product_id",
 *                         type="integer",
 *                         example=1
 *                     ),
 *                     @OA\Property(
 *                         property="quantity",
 *                         type="integer",
 *                         example=2
 *                     )
 *                 )
 *             ),
 *             
 *             @OA\Property(
 *                 property="address",
 *                 type="string",
 *                 example="HCM"
 *             ),
 *             
 *             @OA\Property(
 *                 property="phone",
 *                 type="string",
 *                 example="0123456789"
 *             ),
 *             
 *             @OA\Property(
 *                 property="note",
 *                 type="string",
 *                 example="Giao giờ hành chính"
 *             )
 *         )
 *     ),
 *     @OA\Response(response=200, description="OK")
 * )
 */
    public function store(Request $request)
    {
        DB::beginTransaction();

        try {
            $request->validate([
                'user_id' => 'required|exists:users,id',
                'items' => 'required|array|min:1',
                'items.*.product_id' => 'required|exists:products,id',
                'items.*.quantity' => 'required|integer|min:1',
                'address' => 'required|string',
                'phone' => 'required|string'
            ]);

            $productIds = collect($request->items)->pluck('product_id');
            $products = Product::whereIn('id', $productIds)->get()->keyBy('id');

            $total = 0;

            foreach ($request->items as $item) {
                $product = $products[$item['product_id']];
                $total += $product->price * $item['quantity'];
            }

            $order = Order::create([
                'user_id' => $request->user_id,
                'total_price' => $total,
                'status' => 'pending',
                'address' => $request->address,
                'phone' => $request->phone,
                'note' => $request->note ?? null
            ]);

            foreach ($request->items as $item) {
                $product = $products[$item['product_id']];

                $order->items()->create([
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'price' => $product->price
                ]);
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
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

    /**
 * @OA\Post(
 *     path="/orders/{id}/pay",
 *     tags={"Orders"},
 *     summary="Thanh toán đơn hàng",
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\Response(response=200, description="Thanh toán thành công"),
 *     @OA\Response(response=404, description="Không tìm thấy đơn hàng")
 * )
 */
public function pay($id)
{
    $order = Order::find($id);

    if (!$order) {
        return response()->json([
            'status' => 'error',
            'message' => 'Order not found'
        ], 404);
    }

    // ❌ nếu đã thanh toán rồi
    if ($order->status === 'paid') {
        return response()->json([
            'status' => 'error',
            'message' => 'Order already paid'
        ], 400);
    }

    // ✅ update trạng thái
    $order->update([
        'status' => 'paid'
    ]);

    return response()->json([
        'status' => 'success',
        'message' => 'Thanh toán thành công',
        'data' => $order
    ]);
}

/**
 * @OA\Get(
 *     path="/orders/{id}",
 *     tags={"Orders"},
 *     summary="Chi tiết đơn hàng",
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\Response(response=200, description="OK"),
 *     @OA\Response(response=404, description="Not found")
 * )
 */
public function show($id)
{
    $order = Order::with('items.product')->find($id);

    if (!$order) {
        return response()->json([
            'status' => 'error',
            'message' => 'Order not found'
        ], 404);
    }

    return response()->json([
        'status' => 'success',
        'data' => $order
    ]);
}

/**
 * @OA\Put(
 *     path="/orders/{id}/status",
 *     tags={"Orders"},
 *     summary="Cập nhật trạng thái đơn hàng",
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"status"},
 *             @OA\Property(property="status", type="string", example="shipping")
 *         )
 *     ),
 *     @OA\Response(response=200, description="OK")
 * )
 */
public function updateStatus(Request $request, $id)
{
    $order = Order::find($id);

    if (!$order) {
        return response()->json([
            'status' => 'error',
            'message' => 'Order not found'
        ], 404);
    }

    $request->validate([
        'status' => 'required|in:pending,paid,shipping,completed,cancelled'
    ]);

    $order->update([
        'status' => $request->status
    ]);

    return response()->json([
        'status' => 'success',
        'message' => 'Cập nhật trạng thái thành công',
        'data' => $order
    ]);
}
}