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

        // 1. TẠO / CẬP NHẬT TÀI KHOẢN ADMIN & KHÁCH HÀNG
        DB::table('users')->updateOrInsert(
            ['email' => 'admin@veofood.com'],
            [
                'name' => 'Admin VèoFood',
                'password' => Hash::make('Admin1234'),
                'role' => 'admin',
                'phone' => '0988888888',
                'address' => 'Trụ sở chính VèoFood',
                'created_at' => $now,
                'updated_at' => $now,
            ]
        );

        DB::table('users')->updateOrInsert(
            ['email' => 'khachhang@gmail.com'],
            [
                'name' => 'Khách Hàng VIP',
                'password' => Hash::make('123456'),
                'role' => 'customer',
                'phone' => '0912345678',
                'address' => 'Ký túc xá Khu B, ĐHQG',
                'created_at' => $now,
                'updated_at' => $now,
            ]
        );

        // 2. TẠO / CẬP NHẬT 3 DANH MỤC MÓN ĂN
        DB::table('categories')->updateOrInsert(
            ['name' => 'Cơm Văn Phòng'],
            [
                'image' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ]
        );

        DB::table('categories')->updateOrInsert(
            ['name' => 'Trà Sữa & Nước'],
            [
                'image' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ]
        );

        DB::table('categories')->updateOrInsert(
            ['name' => 'Ăn Vặt Xế Chiều'],
            [
                'image' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ]
        );

        $catCom = DB::table('categories')->where('name', 'Cơm Văn Phòng')->value('id');
        $catNuoc = DB::table('categories')->where('name', 'Trà Sữa & Nước')->value('id');
        $catAnVat = DB::table('categories')->where('name', 'Ăn Vặt Xế Chiều')->value('id');

        // 3. TẠO 24 MÓN ĂN (8 món mỗi danh mục)
        $products = [
            // Cơm
            [
                'category_id' => $catCom,
                'name' => 'Cơm Tấm Sườn Bì Chả',
                'price' => 45000,
                'description' => 'Sườn nướng than hoa thơm lừng, chả trứng béo ngậy.',
                'image' => null,
                'is_available' => true,
                'created_at' => $now, 'updated_at' => $now
            ],
            [
                'category_id' => $catCom,
                'name' => 'Cơm Gà Xối Mỡ',
                'price' => 40000,
                'description' => 'Đùi gà giòn rụm, cơm chiên tỏi đẫm vị.',
                'image' => null,
                'is_available' => true,
                'created_at' => $now, 'updated_at' => $now
            ],
            [
                'category_id' => $catCom,
                'name' => 'Cơm Bò Lúc Lắc',
                'price' => 52000,
                'description' => 'Bò lúc lắc mềm, ăn kèm salad và khoai tây.',
                'image' => null,
                'is_available' => true,
                'created_at' => $now, 'updated_at' => $now
            ],
            [
                'category_id' => $catCom,
                'name' => 'Cơm Sườn Non Nướng Mật Ong',
                'price' => 48000,
                'description' => 'Sườn non nướng đậm vị, thơm mùi mật ong.',
                'image' => null,
                'is_available' => true,
                'created_at' => $now, 'updated_at' => $now
            ],
            [
                'category_id' => $catCom,
                'name' => 'Cơm Thịt Kho Trứng',
                'price' => 39000,
                'description' => 'Thịt kho mềm, trứng thấm vị, chuẩn cơm nhà.',
                'image' => null,
                'is_available' => true,
                'created_at' => $now, 'updated_at' => $now
            ],
            [
                'category_id' => $catCom,
                'name' => 'Cơm Cá Kho Tộ',
                'price' => 44000,
                'description' => 'Cá kho tộ đậm đà, ăn cùng rau luộc.',
                'image' => null,
                'is_available' => true,
                'created_at' => $now, 'updated_at' => $now
            ],
            [
                'category_id' => $catCom,
                'name' => 'Cơm Chiên Dương Châu',
                'price' => 42000,
                'description' => 'Cơm chiên tơi hạt, topping tôm thịt trứng.',
                'image' => null,
                'is_available' => true,
                'created_at' => $now, 'updated_at' => $now
            ],
            [
                'category_id' => $catCom,
                'name' => 'Cơm Sườn Trứng Ốp La',
                'price' => 43000,
                'description' => 'Sườn nướng mềm kèm trứng ốp la béo thơm.',
                'image' => null,
                'is_available' => true,
                'created_at' => $now, 'updated_at' => $now
            ],
            // Nước
            [
                'category_id' => $catNuoc,
                'name' => 'Trà Sữa Trân Châu Đường Đen',
                'price' => 35000,
                'description' => 'Trân châu mềm dẻo, sữa tươi thanh mát.',
                'image' => null,
                'is_available' => true,
                'created_at' => $now, 'updated_at' => $now
            ],
            [
                'category_id' => $catNuoc,
                'name' => 'Trà Đào Cam Sả',
                'price' => 30000,
                'description' => 'Giải nhiệt mùa hè cực đã.',
                'image' => null,
                'is_available' => true,
                'created_at' => $now, 'updated_at' => $now
            ],
            [
                'category_id' => $catNuoc,
                'name' => 'Trà Chanh Mật Ong',
                'price' => 25000,
                'description' => 'Vị chanh dịu nhẹ kết hợp mật ong thanh mát.',
                'image' => null,
                'is_available' => true,
                'created_at' => $now, 'updated_at' => $now
            ],
            [
                'category_id' => $catNuoc,
                'name' => 'Hồng Trà Sữa',
                'price' => 32000,
                'description' => 'Hồng trà đậm vị, hòa quyện cùng sữa tươi.',
                'image' => null,
                'is_available' => true,
                'created_at' => $now, 'updated_at' => $now
            ],
            [
                'category_id' => $catNuoc,
                'name' => 'Cà Phê Sữa Đá',
                'price' => 28000,
                'description' => 'Cà phê phin truyền thống, thơm đậm và mạnh.',
                'image' => null,
                'is_available' => true,
                'created_at' => $now, 'updated_at' => $now
            ],
            [
                'category_id' => $catNuoc,
                'name' => 'Nước Cam Ép',
                'price' => 30000,
                'description' => 'Cam tươi nguyên chất, bổ sung vitamin C.',
                'image' => null,
                'is_available' => true,
                'created_at' => $now, 'updated_at' => $now
            ],
            [
                'category_id' => $catNuoc,
                'name' => 'Sinh Tố Bơ',
                'price' => 36000,
                'description' => 'Sinh tố bơ béo mịn, ngọt vừa phải.',
                'image' => null,
                'is_available' => true,
                'created_at' => $now, 'updated_at' => $now
            ],
            [
                'category_id' => $catNuoc,
                'name' => 'Matcha Latte Đá',
                'price' => 39000,
                'description' => 'Matcha thơm nhẹ, sữa tươi mát lạnh.',
                'image' => null,
                'is_available' => true,
                'created_at' => $now, 'updated_at' => $now
            ],
            // Ăn vặt
            [
                'category_id' => $catAnVat,
                'name' => 'Khoai Tây Chiên Phô Mai',
                'price' => 25000,
                'description' => 'Khoai tây giòn rụm lắc phô mai đậm đà.',
                'image' => null,
                'is_available' => true,
                'created_at' => $now, 'updated_at' => $now
            ],
            [
                'category_id' => $catAnVat,
                'name' => 'Bánh Tráng Trộn',
                'price' => 20000,
                'description' => 'Chua cay mặn ngọt đủ vị, topping ngập tràn.',
                'image' => null,
                'is_available' => true,
                'created_at' => $now, 'updated_at' => $now
            ],
            [
                'category_id' => $catAnVat,
                'name' => 'Gà Viên Chiên',
                'price' => 30000,
                'description' => 'Gà viên chiên vàng giòn, chấm sốt cay ngọt.',
                'image' => null,
                'is_available' => true,
                'created_at' => $now, 'updated_at' => $now
            ],
            [
                'category_id' => $catAnVat,
                'name' => 'Xúc Xích Chiên',
                'price' => 22000,
                'description' => 'Xúc xích chiên nóng giòn, ăn kèm tương ớt.',
                'image' => null,
                'is_available' => true,
                'created_at' => $now, 'updated_at' => $now
            ],
            [
                'category_id' => $catAnVat,
                'name' => 'Nem Chua Rán',
                'price' => 35000,
                'description' => 'Nem chua rán giòn rụm, vị chua nhẹ hấp dẫn.',
                'image' => null,
                'is_available' => true,
                'created_at' => $now, 'updated_at' => $now
            ],
            [
                'category_id' => $catAnVat,
                'name' => 'Bánh Gạo Cay',
                'price' => 38000,
                'description' => 'Bánh gạo dai mềm phủ sốt cay kiểu Hàn.',
                'image' => null,
                'is_available' => true,
                'created_at' => $now, 'updated_at' => $now
            ],
            [
                'category_id' => $catAnVat,
                'name' => 'Cá Viên Chiên',
                'price' => 24000,
                'description' => 'Cá viên chiên dai ngon, ăn cùng sốt me.',
                'image' => null,
                'is_available' => true,
                'created_at' => $now, 'updated_at' => $now
            ],
            [
                'category_id' => $catAnVat,
                'name' => 'Bánh Tráng Nướng',
                'price' => 28000,
                'description' => 'Bánh tráng nướng giòn thơm kiểu Đà Lạt.',
                'image' => null,
                'is_available' => true,
                'created_at' => $now, 'updated_at' => $now
            ]
        ];

        foreach ($products as $product) {
            DB::table('products')->updateOrInsert(
                ['name' => $product['name']],
                $product
            );
        }

        // Giữ đúng danh sách món của seed cho 3 danh mục, loại bỏ món dư cũ.
        $seededNames = array_column($products, 'name');
        DB::table('products')
            ->whereIn('category_id', [$catCom, $catNuoc, $catAnVat])
            ->whereNotIn('name', $seededNames)
            ->delete();
    }
}