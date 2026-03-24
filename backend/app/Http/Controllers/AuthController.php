<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Authentication\AuthenticationException;

class AuthController extends Controller
{
    /**
     * @OA\Post(
     * path="/api/register",
     * operationId="register",
     * tags={"Authentication"},
     * summary="Đăng ký tài khoản mới",
     * description="Tạo user mới và trả về token",
     *     @OA\RequestBody(
     *         @OA\JsonContent(
     *             required={"name","email","password","role","phone"},
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="email", type="string"),
     *             @OA\Property(property="password", type="string", format="password"),
     *             @OA\Property(property="role", type="string", enum={"customer","admin"}),
     *             @OA\Property(property="phone", type="string"),
     *         ),
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Đăng ký thành công"
     *     )
     * )
     */
    public function register(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:6|confirmed',
                'role' => 'nullable|in:customer,admin',
                'phone' => 'nullable|string|max:15',
                'address' => 'nullable|string',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'phone' => $request->phone,
            'address' => $request->address ?? null,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'data' => [
                'user' => $user,
                'token' => $token
            ]
        ], 201);
    }

    /**
     * @OA\Post(
     * path="/api/login",
     * operationId="login",
     * tags={"Authentication"},
     * summary="Đăng nhập",
     *     @OA\RequestBody(
     *         @OA\JsonContent(
     *             required={"email","password"},
     *             @OA\Property(property="email", type="string"),
     *             @OA\Property(property="password", type="string", format="password"),
     *         ),
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Đăng nhập thành công"
     *     )
     * )
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Email hoặc mật khẩu không đúng!',
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'data' => [
                'user' => $user,
                'token' => $token
            ]
        ]);
    }

    /**
     * @OA\Post(
     * path="/api/logout",
     * operationId="logout",
     * tags={"Authentication"},
     * summary="Đăng xuất",
     * security={ {"sanctum":{}} },
     *     @OA\Response(
     *         response=200,
     *         description="Đăng xuất thành công"
     *     )
     * )
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Logged out successfully'
        ]);
    }
}

