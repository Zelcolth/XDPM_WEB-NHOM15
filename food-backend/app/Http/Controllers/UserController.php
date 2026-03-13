<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

/**
 * @OA\Info(
 * title="API Project",
 * version="1.0.0",
 * description="Tài liệu API cho đồ án nhóm 15"
 * )
 */
class UserController extends Controller
{
    /**
     * @OA\Get(
     * path="/users",
     * tags={"Users"},
     * summary="Lấy danh sách tất cả người dùng",
     * @OA\Response(response="200", description="Thành công")
     * )
     */
    public function index()
    {
        return response()->json(User::select('id', 'name')->get());
    }

    /**
     * @OA\Post(
     * path="/users",
     * tags={"Users"},
     * summary="Thêm một người dùng mới",
     * @OA\RequestBody(
     * required=true,
     * @OA\JsonContent(
     * @OA\Property(property="name", type="string", example="Nguyen Van C")
     * )
     * ),
     * @OA\Response(response="201", description="Đã thêm thành công")
     * )
     */
    public function store(Request $request)
    {
        $user = User::create([
            'name' => $request->name,
            'email' => time() . '@gmail.com', // Tạo email tự động
            'password' => bcrypt('123456')    // Tạo pass tự động
        ]);
        return response()->json($user, 201);
    }

    /**
     * @OA\Get(
     * path="/users/{id}",
     * tags={"Users"},
     * summary="Lấy thông tin 1 người dùng theo ID",
     * @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     * @OA\Response(response="200", description="Thành công"),
     * @OA\Response(response="404", description="Không tìm thấy")
     * )
     */
    public function show($id)
    {
        $user = User::select('id', 'name')->find($id);
        if ($user) return response()->json($user);
        return response()->json(['message' => 'Không tìm thấy người dùng'], 404);
    }

    /**
     * @OA\Put(
     * path="/users/{id}",
     * tags={"Users"},
     * summary="Sửa tên người dùng theo ID",
     * @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     * @OA\RequestBody(
     * required=true,
     * @OA\JsonContent(
     * @OA\Property(property="name", type="string", example="Tên mới đã sửa")
     * )
     * ),
     * @OA\Response(response="200", description="Đã sửa thành công")
     * )
     */
    public function update(Request $request, $id)
    {
        $user = User::find($id);
        if ($user) {
            $user->update(['name' => $request->name]);
            return response()->json($user);
        }
        return response()->json(['message' => 'Không tìm thấy'], 404);
    }

    /**
     * @OA\Delete(
     * path="/users/{id}",
     * tags={"Users"},
     * summary="Xóa người dùng theo ID",
     * @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     * @OA\Response(response="200", description="Đã xóa thành công")
     * )
     */
    public function destroy($id)
    {
        $user = User::find($id);
        if ($user) {
            $user->delete();
            return response()->json(['message' => 'Đã xóa']);
        }
        return response()->json(['message' => 'Không tìm thấy'], 404);
    }
}