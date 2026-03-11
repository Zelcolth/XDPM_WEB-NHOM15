<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;

// Cú pháp gộp toàn bộ 5 API (Thêm, Sửa, Xóa, Lấy danh sách, Lấy 1 user) vào 1 dòng duy nhất!
Route::apiResource('users', UserController::class);
?>