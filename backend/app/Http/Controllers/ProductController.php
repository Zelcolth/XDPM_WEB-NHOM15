<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * @OA\Get(
     * path="/products",
     * operationId="getProductsList",
     * tags={"Món Ăn (Products)"},
     * summary="Lấy danh sách tất cả món ăn",
     * description="Trả về mảng dữ liệu món ăn kèm category",
     * @OA\Parameter(
     *     name="keyword",
     *     in="query",
     *     required=false,
     *     description="Từ khóa tìm kiếm theo tên món ăn",
     *     @OA\Schema(type="string", example="phở")
     * ),
     * @OA\Response(
     * response=200,
     * description="Thành công"
     * )
     * )
     */
   public function index(Request $request)
    {
        $keyword = trim((string) ($request->query('keyword') ?? $request->query('name') ?? ''));

        $query = Product::with('category');

        if ($keyword !== '') {
            $query->where('name', 'like', '%' . $keyword . '%');
        }

        $products = $query->get();

        return response()->json([
            'status' => 'thành công',
            'data' => $products
        ], 200, [], JSON_UNESCAPED_UNICODE);
    }

    /**
     * @OA\Get(
     *     path="/products/{id}",
     *     operationId="getProductById",
     *     tags={"Món Ăn (Products)"},
     *     summary="Lấy chi tiết món ăn theo id",
     *     description="Trả về thông tin một món ăn kèm category",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(response=200, description="Thành công"),
     *     @OA\Response(response=404, description="Không tìm thấy món ăn")
     * )
     */
    public function show($id)
    {
        $product = Product::with('category')->find($id);

        if (! $product) {
            return response()->json([
                'status' => 'thất bại',
                'message' => 'Không tìm thấy món ăn'
            ], 404);
        }

        return response()->json([
            'status' => 'thành công',
            'data' => $product
        ], 200, [], JSON_UNESCAPED_UNICODE);
    }

    /**
     * @OA\Post(
     *     path="/products",
     *     operationId="createProduct",
     *     tags={"Món Ăn (Products)"},
     *     summary="Tạo món ăn mới",
    *     description="Thêm món ăn (yêu cầu tài khoản admin)",
    *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name","price","category_id"},
     *             @OA\Property(property="name", type="string", example="Trà sữa"),
     *             @OA\Property(property="price", type="number", example=30000),
     *             @OA\Property(property="category_id", type="integer", example=1),
     *             @OA\Property(property="description", type="string"),
    *             @OA\Property(property="image", type="string", nullable=true, example=null)
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Tạo thành công"
    *     ),
    *     @OA\Response(response=401, description="Chưa xác thực"),
    *     @OA\Response(response=403, description="Không có quyền truy cập")
     * )
     */

     public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric',
            'category_id' => 'required|exists:categories,id',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'is_available' => 'nullable|boolean',
            'image_file' => 'nullable|file|mimes:jpeg,jpg,png,webp|max:5120'
        ]);

        $imagePath = $request->input('image');
        if ($request->hasFile('image_file')) {
            $stored = $request->file('image_file')->store('products', 'public');
            $imagePath = 'storage/' . $stored;
        }

        $product = Product::create([
            'name' => $request->name,
            'price' => $request->price,
            'category_id' => $request->category_id,
            'description' => $request->description,
            'image' => $imagePath,
            'is_available' => $request->boolean('is_available', true) ? 1 : 0
        ]);

        return response()->json([
            'status' => 'thành công',
            'data' => $product
        ], 201);
    }
    /**
 * @OA\Put(
 *     path="/products/{id}",
 *     summary="Cập nhật món ăn",
 *     tags={"Món Ăn (Products)"},
 *     description="Cập nhật món ăn (yêu cầu tài khoản admin)",
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
 *             @OA\Property(property="name", type="string"),
 *             @OA\Property(property="price", type="number"),
 *             @OA\Property(property="category_id", type="integer"),
 *             @OA\Property(property="description", type="string"),
 *             @OA\Property(property="image", type="string", nullable=true, example=null)
 *         )
 *     ),
 *     @OA\Response(response=200, description="Cập nhật thành công"),
 *     @OA\Response(response=401, description="Chưa xác thực"),
 *     @OA\Response(response=403, description="Không có quyền truy cập")
 * )
 */
public function update(Request $request, $id)
{
    // 1. Tìm product
    $product = Product::find($id);

    if (!$product) {
        return response()->json([
            'status' => 'thất bại',
            'message' => 'Không tìm thấy món ăn'
        ], 404);
    }

    // 2. Validate
    $request->validate([
        'name' => 'sometimes|string|max:255',
        'price' => 'sometimes|numeric',
        'category_id' => 'sometimes|exists:categories,id',
        'description' => 'nullable|string',
        'image' => 'nullable|string',
        'is_available' => 'nullable|boolean',
        'remove_image' => 'nullable|boolean',
        'image_file' => 'nullable|file|mimes:jpeg,jpg,png,webp|max:5120'
    ]);

    $shouldRemoveImage = $request->boolean('remove_image', false);

    if ($shouldRemoveImage && $product->image) {
        if (is_string($product->image) && Str::startsWith($product->image, 'storage/')) {
            $diskPath = substr($product->image, strlen('storage/'));
            Storage::disk('public')->delete($diskPath);
        }
        $product->image = null;
    }

    if ($request->hasFile('image_file')) {
        if ($product->image && is_string($product->image) && Str::startsWith($product->image, 'storage/')) {
            $diskPath = substr($product->image, strlen('storage/'));
            Storage::disk('public')->delete($diskPath);
        }

        $stored = $request->file('image_file')->store('products', 'public');
        $product->image = 'storage/' . $stored;
    } elseif ($request->filled('image')) {
        $product->image = $request->input('image');
    }

    $product->fill($request->only(['name', 'price', 'category_id', 'description']));
    if ($request->has('is_available')) {
        $product->is_available = $request->boolean('is_available') ? 1 : 0;
    }

    $product->save();

    // 4. Response
    return response()->json([
        'status' => 'thành công',
        'data' => $product
    ]);
}

    /**
 * @OA\Delete(
 *     path="/products/{id}",
 *     summary="Xóa món ăn",
 *     tags={"Món Ăn (Products)"},
 *     description="Xóa món ăn (yêu cầu tài khoản admin)",
 *     security={{"sanctum":{}}},
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\Response(response=200, description="Xóa thành công"),
 *     @OA\Response(response=401, description="Chưa xác thực"),
 *     @OA\Response(response=403, description="Không có quyền truy cập")
 * )
 */
public function destroy($id)
{
    $product = Product::find($id);

    if (!$product) {
        return response()->json([
            'status' => 'thất bại',
            'message' => 'Không tìm thấy món ăn'
        ], 404);
    }

    $product->delete();

    return response()->json([
        'status' => 'thành công',
        'message' => 'Xóa món ăn thành công'
    ]);
}
}