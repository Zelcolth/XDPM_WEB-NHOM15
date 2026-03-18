<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * @OA\Get(
     * path="/products",
     * operationId="getProductsList",
     * tags={"Món Ăn (Products)"},
     * summary="Lấy danh sách tất cả món ăn",
     * description="Trả về mảng dữ liệu món ăn, kèm theo thông tin danh mục (category) của món đó.",
     * @OA\Response(
     * response=200,
     * description="Thao tác thành công",
     * ),
     * @OA\Response(
     * response=500,
     * description="Lỗi server",
     * )
     * )
     */
    public function index()
    {
        // Lấy tất cả món ăn và thông tin danh mục đi kèm
        $products = Product::with('category')->get();
        return response()->json([
            'status' => 'success',
            'data' => $products
        ], 200);
    }
}