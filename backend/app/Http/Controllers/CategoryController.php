<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * @OA\Tag(
 *     name="Categories",
 *     description="Quản lý danh mục"
 * )
 */
class CategoryController extends Controller
{
    /**
     * List categories
    *
    * @OA\Get(
    *     path="/categories",
    *     tags={"Categories"},
    *     summary="Lấy danh sách danh mục",
    *     @OA\Response(
    *         response=200,
    *         description="Danh sách danh mục",
    *         @OA\JsonContent(type="array", @OA\Items(type="object"))
    *     )
    * )
     */
    public function index()
    {
        $categories = Category::all();
        return response()->json($categories);
    }

    /**
     * Show single category
        *
        * @OA\Get(
        *     path="/categories/{id}",
        *     tags={"Categories"},
        *     summary="Lấy danh mục theo id",
        *     @OA\Parameter(
        *         name="id",
        *         in="path",
        *         required=true,
        *         @OA\Schema(type="integer", example=1)
        *     ),
        *     @OA\Response(
        *         response=200,
        *         description="Tìm thấy danh mục",
        *         @OA\JsonContent(type="object")
        *     ),
        *     @OA\Response(response=404, description="Không tìm thấy danh mục")
        * )
     */
    public function show($id)
    {
        $category = Category::find($id);
        if (! $category) {
            return response()->json(['message' => 'Not found'], 404);
        }
        return response()->json($category);
    }

    /**
     * Create category
        *
        * @OA\Post(
        *     path="/categories",
        *     tags={"Categories"},
        *     summary="Tạo danh mục mới",
        *     description="Yêu cầu xác thực quản trị viên",
        *     security={{"sanctum":{}}},
        *     @OA\RequestBody(
        *         required=true,
        *         @OA\JsonContent(
        *             required={"name"},
        *             @OA\Property(property="name", type="string", example="Pizza"),
        *             @OA\Property(property="image", type="string", format="uri", nullable=true, example="https://example.com/pizza.jpg")
        *         )
        *     ),
        *     @OA\Response(response=201, description="Tạo danh mục thành công", @OA\JsonContent(type="object")),
        *     @OA\Response(response=422, description="Lỗi xác thực dữ liệu"),
        *     @OA\Response(response=401, description="Chưa xác thực"),
        *     @OA\Response(response=403, description="Không có quyền truy cập")
        * )
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'image' => 'nullable|url',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $category = Category::create($request->only(['name','image']));
        return response()->json($category, 201);
    }

    /**
     * Update category
        *
        * @OA\Put(
        *     path="/categories/{id}",
        *     tags={"Categories"},
        *     summary="Cập nhật danh mục",
        *     description="Yêu cầu xác thực quản trị viên",
        *     security={{"sanctum":{}}},
        *     @OA\Parameter(
        *         name="id",
        *         in="path",
        *         required=true,
        *         @OA\Schema(type="integer", example=1)
        *     ),
        *     @OA\RequestBody(
        *         required=true,
        *         @OA\JsonContent(
        *             @OA\Property(property="name", type="string", example="Fast Food"),
        *             @OA\Property(property="image", type="string", format="uri", nullable=true, example="https://example.com/fastfood.jpg")
        *         )
        *     ),
        *     @OA\Response(response=200, description="Cập nhật danh mục thành công", @OA\JsonContent(type="object")),
        *     @OA\Response(response=404, description="Không tìm thấy danh mục"),
        *     @OA\Response(response=422, description="Lỗi xác thực dữ liệu"),
        *     @OA\Response(response=401, description="Chưa xác thực"),
        *     @OA\Response(response=403, description="Không có quyền truy cập")
        * )
     */
    public function update(Request $request, $id)
    {
        $category = Category::find($id);
        if (! $category) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'image' => 'nullable|url',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $category->update($request->only(['name','image']));
        return response()->json($category);
    }

    /**
     * Delete category
        *
        * @OA\Delete(
        *     path="/categories/{id}",
        *     tags={"Categories"},
        *     summary="Xóa danh mục",
        *     description="Yêu cầu xác thực quản trị viên",
        *     security={{"sanctum":{}}},
        *     @OA\Parameter(
        *         name="id",
        *         in="path",
        *         required=true,
        *         @OA\Schema(type="integer", example=1)
        *     ),
        *     @OA\Response(
        *         response=200,
        *         description="Xóa danh mục thành công",
        *         @OA\JsonContent(@OA\Property(property="message", type="string", example="Deleted"))
        *     ),
        *     @OA\Response(response=404, description="Không tìm thấy danh mục"),
        *     @OA\Response(response=401, description="Chưa xác thực"),
        *     @OA\Response(response=403, description="Không có quyền truy cập")
        * )
     */
    public function destroy($id)
    {
        $category = Category::find($id);
        if (! $category) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $category->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
