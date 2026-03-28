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
     * description="Trả về mảng dữ liệu món ăn kèm category",
     * @OA\Response(
     * response=200,
     * description="Thành công"
     * )
     * )
     */
   public function index()
    {
        $products = Product::with('category')->get();

        return response()->json([
            'status' => 'success',
            'data' => $products
        ], 200, [], JSON_UNESCAPED_UNICODE);
    }
    /**
     * @OA\Post(
     *     path="/products",
     *     operationId="createProduct",
     *     tags={"Món Ăn (Products)"},
     *     summary="Tạo món ăn mới",
     *     description="Thêm món ăn",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name","price","category_id"},
     *             @OA\Property(property="name", type="string", example="Trà sữa"),
     *             @OA\Property(property="price", type="number", example=30000),
     *             @OA\Property(property="category_id", type="integer", example=1),
     *             @OA\Property(property="description", type="string"),
     *             @OA\Property(property="image", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Tạo thành công"
     *     )
     * )
     */

     public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric',
            'category_id' => 'required|exists:categories,id',
            'description' => 'nullable|string',
            'image' => 'nullable|string'
        ]);

        $product = Product::create([
            'name' => $request->name,
            'price' => $request->price,
            'category_id' => $request->category_id,
            'description' => $request->description,
            'image' => $request->image,
            'is_available' => 1
        ]);

        return response()->json([
            'status' => 'success',
            'data' => $product
        ], 201);
    }
    /**
 * @OA\Put(
 *     path="/products/{id}",
 *     summary="Cập nhật món ăn",
 *     tags={"Món Ăn (Products)"},
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             @OA\Property(property="name", type="string"),
 *             @OA\Property(property="price", type="number"),
 *             @OA\Property(property="category_id", type="integer"),
 *             @OA\Property(property="description", type="string"),
 *             @OA\Property(property="image", type="string")
 *         )
 *     ),
 *     @OA\Response(response=200, description="Updated")
 * )
 */
public function update(Request $request, $id)
{
    // 1. Tìm product
    $product = Product::find($id);

    if (!$product) {
        return response()->json([
            'status' => 'error',
            'message' => 'Product not found'
        ], 404);
    }

    // 2. Validate
    $request->validate([
        'name' => 'sometimes|string|max:255',
        'price' => 'sometimes|numeric',
        'category_id' => 'sometimes|exists:categories,id',
        'description' => 'nullable|string',
        'image' => 'nullable|string'
    ]);

    // 3. Update
    $product->update($request->all());

    // 4. Response
    return response()->json([
        'status' => 'success',
        'data' => $product
    ]);
}

    /**
 * @OA\Delete(
 *     path="/products/{id}",
 *     summary="Xóa món ăn",
 *     tags={"Món Ăn (Products)"},
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\Response(response=200, description="Deleted")
 * )
 */
public function destroy($id)
{
    $product = Product::find($id);

    if (!$product) {
        return response()->json([
            'status' => 'error',
            'message' => 'Product not found'
        ], 404);
    }

    $product->delete();

    return response()->json([
        'status' => 'success',
        'message' => 'Deleted successfully'
    ]);
}
}