<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

/**
 * @OA\Tag(
 *     name="Auth",
 *     description="Các API xác thực"
 * )
 */
class AuthController extends Controller
{
    /**
     * Register a new user
     *
     * @OA\Post(
     *     path="/register",
     *     tags={"Auth"},
    *     summary="Đăng ký người dùng mới",
    *     @OA\RequestBody(
    *         required=true,
    *         @OA\JsonContent(
    *             required={"name","email","password","password_confirmation"},
    *             @OA\Property(property="name", type="string", example="Nguyen Van A"),
    *             @OA\Property(property="email", type="string", format="email", example="user@example.com"),
    *             @OA\Property(property="password", type="string", format="password", example="abc12345"),
    *             @OA\Property(property="password_confirmation", type="string", format="password", example="abc12345")
    *         )
    *     ),
    *     @OA\Response(
    *         response=200,
    *         description="Đăng ký thành công",
    *         @OA\JsonContent(
    *             @OA\Property(property="user", type="object"),
    *             @OA\Property(property="token", type="string", example="1|abcdef...")
    *         )
    *     ),
    *     @OA\Response(response=422, description="Lỗi xác thực dữ liệu")
     * )
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
                'regex:/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/' // at least one letter and one number
            ],
        ],[
            'password.regex' => 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ và số.',
            'password.min' => 'Mật khẩu phải có tối thiểu 8 ký tự.',
            'email.email' => 'Email không đúng định dạng.',
            'email.unique' => 'Email đã tồn tại.'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json(['user' => $user, 'token' => $token]);
    }

    /**
     * Login user
        *
        * @OA\Post(
        *     path="/login",
        *     tags={"Auth"},
        *     summary="Đăng nhập và nhận access token",
        *     @OA\RequestBody(
        *         required=true,
        *         @OA\JsonContent(
        *             required={"email","password"},
        *             @OA\Property(property="email", type="string", format="email", example="user@example.com"),
        *             @OA\Property(property="password", type="string", format="password", example="abc12345")
        *         )
        *     ),
        *     @OA\Response(
        *         response=200,
        *         description="Đăng nhập thành công",
        *         @OA\JsonContent(
        *             @OA\Property(property="user", type="object"),
        *             @OA\Property(property="token", type="string", example="1|abcdef...")
        *         )
        *     ),
        *     @OA\Response(response=401, description="Sai thông tin đăng nhập"),
        *     @OA\Response(response=422, description="Lỗi xác thực dữ liệu")
        * )
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => ['required','string','min:8','regex:/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/'],
        ],[
            'email.email' => 'Email không đúng định dạng.',
            'password.min' => 'Mật khẩu phải có tối thiểu 8 ký tự.',
            'password.regex' => 'Mật khẩu phải bao gồm ít nhất một chữ và một số.'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json(['user' => $user, 'token' => $token]);
    }

    /**
     * Logout (revoke current token)
        *
        * @OA\Post(
        *     path="/logout",
        *     tags={"Auth"},
        *     summary="Đăng xuất người dùng hiện tại",
        *     description="Yêu cầu Sanctum Bearer token",
        *     security={{"sanctum":{}}},
        *     @OA\Response(
        *         response=200,
        *         description="Đăng xuất thành công",
        *         @OA\JsonContent(@OA\Property(property="message", type="string", example="Logged out"))
        *     ),
        *     @OA\Response(response=401, description="Chưa xác thực")
        * )
     */
    public function logout(Request $request)
    {
        $user = $request->user();
        if ($user) {
            $user->currentAccessToken()->delete();
        }

        return response()->json(['message' => 'Logged out']);
    }
}
