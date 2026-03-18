<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    // Cho phép thêm dữ liệu vào các cột này
    protected $fillable = ['category_id', 'name', 'price', 'description', 'image', 'is_available'];

    // Khai báo mối quan hệ: 1 Món ăn thuộc về 1 Danh mục
    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}