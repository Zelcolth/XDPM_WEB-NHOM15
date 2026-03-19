<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        // 1. TẠO TÀI KHOẢN ADMIN & KHÁCH HÀNG
        DB::table('users')->insert([
            [
                'name' => 'Admin VèoFood',
                'email' => 'admin@veofood.com',
                'password' => Hash::make('123456'),
                'role' => 'admin',
                'phone' => '0988888888',
                'address' => 'Trụ sở chính VèoFood',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Khách Hàng VIP',
                'email' => 'khachhang@gmail.com',
                'password' => Hash::make('123456'),
                'role' => 'customer',
                'phone' => '0912345678',
                'address' => 'Ký túc xá Khu B, ĐHQG',
                'created_at' => $now,
                'updated_at' => $now,
            ]
        ]);

        // 2. TẠO 3 DANH MỤC MÓN ĂN
        $catCom = DB::table('categories')->insertGetId([
            'name' => 'Cơm Văn Phòng', 
            'image' => 'https://images.unsplash.com/photo-1626804475297-41609ea004eb?w=500&q=80',
            'created_at' => $now, 'updated_at' => $now
        ]);
        
        $catNuoc = DB::table('categories')->insertGetId([
            'name' => 'Trà Sữa & Nước', 
            'image' => 'https://images.unsplash.com/photo-1558857563-b37103fac9eb?w=500&q=80',
            'created_at' => $now, 'updated_at' => $now
        ]);

        $catAnVat = DB::table('categories')->insertGetId([
            'name' => 'Ăn Vặt Xế Chiều', 
            'image' => 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=500&q=80',
            'created_at' => $now, 'updated_at' => $now
        ]);

        // 3. TẠO 6 MÓN ĂN (Gắn vào các danh mục trên)
        DB::table('products')->insert([
            // Cơm
            [
                'category_id' => $catCom,
                'name' => 'Cơm Tấm Sườn Bì Chả',
                'price' => 45000,
                'description' => 'Sườn nướng than hoa thơm lừng, chả trứng béo ngậy.',
                'image' => 'https://images.unsplash.com/photo-1655070265691-1ec85116bb89?w=500&q=80',
                'is_available' => true,
                'created_at' => $now, 'updated_at' => $now
            ],
            [
                'category_id' => $catCom,
                'name' => 'Cơm Gà Xối Mỡ',
                'price' => 40000,
                'description' => 'Đùi gà giòn rụm, cơm chiên tỏi đẫm vị.',
                'image' => 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500&q=80',
                'is_available' => true,
                'created_at' => $now, 'updated_at' => $now
            ],
            // Nước
            [
                'category_id' => $catNuoc,
                'name' => 'Trà Sữa Trân Châu Đường Đen',
                'price' => 35000,
                'description' => 'Trân châu mềm dẻo, sữa tươi thanh mát.',
                'image' => 'https://images.unsplash.com/photo-1595981267035-7b04d84b4e1a?w=500&q=80',
                'is_available' => true,
                'created_at' => $now, 'updated_at' => $now
            ],
            [
                'category_id' => $catNuoc,
                'name' => 'Trà Đào Cam Sả',
                'price' => 30000,
                'description' => 'Giải nhiệt mùa hè cực đã.',
                'image' => 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&q=80',
                'is_available' => true,
                'created_at' => $now, 'updated_at' => $now
            ],
            // Ăn vặt
            [
                'category_id' => $catAnVat,
                'name' => 'Khoai Tây Chiên Phô Mai',
                'price' => 25000,
                'description' => 'Khoai tây giòn rụm lắc phô mai đậm đà.',
                'image' => 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500&q=80',
                'is_available' => true,
                'created_at' => $now, 'updated_at' => $now
            ],
            [
                'category_id' => $catAnVat,
                'name' => 'Bánh Tráng Trộn',
                'price' => 20000,
                'description' => 'Chua cay mặn ngọt đủ vị, composer require darkaonline/l5-swaggertopping ngập tràn.',
                'image' => 'https://images.unsplash.com/photo-1649313271168-52ba71ab669a?w=500&q=80',
                'is_available' => true,
                'created_at' => $now, 'updated_at' => $now
            ]
        ]);
    }
}