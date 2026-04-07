<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\OrderController;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/



// Auth routes
Route::post('/register', [App\Http\Controllers\AuthController::class, 'register'])->middleware('throttle:10,1');
Route::post('/login', [App\Http\Controllers\AuthController::class, 'login'])->middleware('throttle:10,1');
Route::middleware('auth:sanctum')->post('/logout', [App\Http\Controllers\AuthController::class, 'logout']);

Route::middleware('auth:sanctum')->put('/user', [App\Http\Controllers\AuthController::class, 'update']);
Route::middleware('auth:sanctum')->get('/user', [App\Http\Controllers\AuthController::class, 'getMe']);

// Categories
Route::get('/categories', [App\Http\Controllers\CategoryController::class, 'index']);
Route::get('/categories/{id}', [App\Http\Controllers\CategoryController::class, 'show']);
Route::middleware(['auth:sanctum','admin'])->group(function () {
    Route::post('/categories', [App\Http\Controllers\CategoryController::class, 'store']);
    Route::put('/categories/{id}', [App\Http\Controllers\CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [App\Http\Controllers\CategoryController::class, 'destroy']);
});
// Products  
Route::get('/products', [App\Http\Controllers\ProductController::class, 'index']);
Route::get('/products/{id}', [App\Http\Controllers\ProductController::class, 'show']);
Route::middleware(['auth:sanctum','admin'])->group(function () {
    Route::post('/products', [App\Http\Controllers\ProductController::class, 'store']);
    Route::put('/products/{id}', [App\Http\Controllers\ProductController::class, 'update']);
    Route::delete('/products/{id}', [App\Http\Controllers\ProductController::class, 'destroy']);
});
//Order 
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/my-orders', [OrderController::class, 'myOrders']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::post('/orders/{id}/pay', [OrderController::class, 'pay']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
});

Route::middleware(['auth:sanctum', 'admin'])->put('/orders/{id}/status', [OrderController::class, 'updateStatus']);
