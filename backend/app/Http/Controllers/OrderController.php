<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use App\Models\Order;
use App\Models\Product;

class OrderController extends Controller
{
    /**
     * @OA\Get(
     *     path="/orders",
     *     tags={"Orders"},
     *     summary="Lấy danh sách đơn hàng",
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Thành công"
     *     ),
     *     @OA\Response(response=401, description="Chưa xác thực")
     * )
     */
    public function index(Request $request)
    {
        $query = Order::with('items.product', 'user');

        if ($request->user()->role !== 'admin') {
            $query->where('user_id', $request->user()->id);
        }

        $orders = $query->latest()->get();

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
 *     security={{"sanctum":{}}},
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"items"},
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
 *     @OA\Response(response=200, description="OK"),
 *     @OA\Response(response=401, description="Chưa xác thực")
 * )
 */
    public function store(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'address' => 'required|string',
            'phone' => 'required|string'
        ]);

        try {
            $productIds = collect($request->items)->pluck('product_id');
            $products = Product::whereIn('id', $productIds)->get()->keyBy('id');

            foreach ($request->items as $item) {
                $product = $products->get($item['product_id']);
                if (! $product || ! (bool) $product->is_available) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Sản phẩm không tồn tại hoặc không khả dụng'
                    ], 422);
                }
            }

            $total = 0;

            foreach ($request->items as $item) {
                $product = $products->get($item['product_id']);
                $total += $product->price * $item['quantity'];
            }

            DB::beginTransaction();

            $order = Order::create([
                'user_id' => $request->user()->id,
                'total_price' => $total,
                'status' => 'pending',
                'address' => $request->address,
                'phone' => $request->phone,
                'note' => $request->note ?? null
            ]);

            foreach ($request->items as $item) {
                $product = $products->get($item['product_id']);

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

        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            if (DB::transactionLevel() > 0) {
                DB::rollBack();
            }
            Log::error('Create order failed', [
                'user_id' => optional($request->user())->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Không thể tạo đơn hàng vào lúc này'
            ], 500);
        }
    }

    /**
 * @OA\Post(
 *     path="/orders/{id}/pay",
 *     tags={"Orders"},
 *     summary="Thanh toán đơn hàng",
 *     security={{"sanctum":{}}},
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\Response(response=200, description="Thanh toán thành công"),
 *     @OA\Response(response=404, description="Không tìm thấy đơn hàng"),
 *     @OA\Response(response=401, description="Chưa xác thực")
 * )
 */
public function pay(Request $request, $id)
{
    $order = Order::find($id);

    if (!$order) {
        return response()->json([
            'status' => 'error',
            'message' => 'Order not found'
        ], 404);
    }

    if ($request->user()->role !== 'admin' && (int) $order->user_id !== (int) $request->user()->id) {
        return response()->json([
            'status' => 'error',
            'message' => 'Forbidden'
        ], 403);
    }

    // ❌ nếu đã thanh toán rồi
    if ($order->status === 'paid') {
        return response()->json([
            'status' => 'error',
            'message' => 'Order already paid'
        ], 400);
    }

    if ($order->status === 'cancelled') {
        return response()->json([
            'status' => 'error',
            'message' => 'Cancelled order cannot be paid'
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
 *     security={{"sanctum":{}}},
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\Response(response=200, description="OK"),
 *     @OA\Response(response=404, description="Not found"),
 *     @OA\Response(response=401, description="Chưa xác thực")
 * )
 */
public function show(Request $request, $id)
{
    $order = Order::with('items.product')->find($id);

    if (!$order) {
        return response()->json([
            'status' => 'error',
            'message' => 'Order not found'
        ], 404);
    }

    if ($request->user()->role !== 'admin' && (int) $order->user_id !== (int) $request->user()->id) {
        return response()->json([
            'status' => 'error',
            'message' => 'Forbidden'
        ], 403);
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
 *     security={{"sanctum":{}}},
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
 *     @OA\Response(response=200, description="OK"),
 *     @OA\Response(response=401, description="Chưa xác thực"),
 *     @OA\Response(response=403, description="Không có quyền truy cập")
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
