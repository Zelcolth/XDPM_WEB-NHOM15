<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
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
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'image' => 'nullable|string'
        ]);

        $category = Category::create($request->all());

        return response()->json([
            'status' => 'success',
            'data' => $category
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category)
    {
        $category->load('products');
        return response()->json([
            'status' => 'success',
            'data' => $category
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Category $category)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'image' => 'nullable|string'
        ]);

        $category->update($request->all());

        return response()->json([
            'status' => 'success',
            'data' => $category->fresh()
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        $category->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Category deleted'
        ], 200);
    }
}

