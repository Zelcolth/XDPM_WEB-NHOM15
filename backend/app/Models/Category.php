<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'image'];

    // Khai báo mối quan hệ: 1 Danh mục có nhiều Món ăn
    public function products()
    {
        return $this->hasMany(Product::class);
    }
}