<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;

// Tự động chuyển hướng từ trang gốc sang trang danh sách
Route::redirect('/', '/users');
// API CRUD cho users
Route::apiResource('users', UserController::class);
?>