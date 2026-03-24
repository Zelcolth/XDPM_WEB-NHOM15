<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CategoryController extends Controller
{
    /**
     * @OA\Get(
     * path="/categories",
     * operationId="getCategoriesList",
     * tags={"Danh mục (Categories)"},
     * summary="Lấy danh sách tất cả danh mục",
     * description="Trả về danh sách categories với số lượng products",
     * @OA\Response(
     * response=200,
     * description="Thành công",
     * )
     * )
     */
    public function index()
    {
        $categories = Category::withCount('products')->get();
        return response()->json([
            'status' => 'success',
            'data' => $categories
        ], 200);
    }

    /**
     * @OA\Get(
     * path="/categories/{id}",
     * operationId="getCategory",
     * tags={"Danh mục (Categories)"},
     * summary="Lấy chi tiết danh mục",
     * @OA\Parameter(
     *     name="id",
     *     in="path",
     *     required=true,
     *     @OA\Schema(type="integer")
     * ),
     * @OA\Response(
     * response=200,
     * description="Thành công"
     * )
     * )
     */
    public function show($id)
    {
        $category = Category::with('products')->findOrFail($id);
        return response()->json([
            'status' => 'success',
            'data' => $category
        ], 200);
    }

    /**
     * @OA\Post(
     * path="/categories",
     * operationId="storeCategory",
     * tags={"Danh mục (Categories)"},
     * summary="Tạo danh mục mới",
     * security={{"sanctum":{}}},
     * @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *         @OA\Property(property="name", type="string", example="Cơm"),
     *         @OA\Property(property="image", type="string", example="category1.jpg", nullable=true)
     *     )
     * ),
     * @OA\Response(response=201, description="Tạo thành công")
     * )
     */
    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized: Admin only'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'image' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()
            ], 422);
        }

        $category = Category::create($request->all());

        return response()->json([
            'status' => 'success',
            'data' => $category
        ], 201);
    }

    /**
     * @OA\Put(
     * path="/categories/{id}",
     * operationId="updateCategory",
     * tags={"Danh mục (Categories)"},
     * summary="Cập nhật danh mục",
     * security={{"sanctum":{}}},
     * @OA\Parameter(
     *     name="id",
     *     in="path",
     *     @OA\Schema(type="integer")
     * ),
     * @OA\Response(response=200, description="Cập nhật thành công")
     * )
     */
    public function update(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized: Admin only'], 403);
        }

        $category = Category::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'string|max:255',
            'image' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()
            ], 422);
        }

        $category->update($request->all());

        return response()->json([
            'status' => 'success',
            'data' => $category
        ], 200);
    }

    /**
     * @OA\Delete(
     * path="/categories/{id}",
     * operationId="deleteCategory",
     * tags={"Danh mục (Categories)"},
     * summary="Xóa danh mục",
     * security={{"sanctum":{}}},
     * @OA\Parameter(
     *     name="id",
     *     in="path",
     *     @OA\Schema(type="integer")
     * ),
     * @OA\Response(response=200, description="Xóa thành công")
     * )
     */
    public function destroy(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized: Admin only'], 403);
        }

        $category = Category::findOrFail($id);
        $category->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Category deleted successfully'
        ], 200);
    }
}

