<?php

use Illuminate\Support\Facades\Route;
use App\Models\User;

// Đường dẫn 1: Trả về danh sách tất cả người dùng (chỉ lấy id và name)
Route::get('/users', function () {
    return response()->json(User::select('id', 'name')->get());
});

// Đường dẫn 2: Trả về 1 người dùng cụ thể dựa vào ID
Route::get('/users/{id}', function ($id) {
    $user = User::select('id', 'name')->find($id);
    
    // Nếu không tìm thấy user, trả về lỗi 404
    if (!$user) {
        return response()->json(['message' => 'Không tìm thấy user'], 404);
    }
    
    return response()->json($user);
});