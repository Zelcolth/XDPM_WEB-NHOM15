# VèoFood - Đồ án đặt món trực tuyến

## 1. Thông tin đồ án

- Tên đề tài: Hệ thống đặt món và quản lý đơn hàng VèoFood
- Nhóm: Nhóm 15
- Mô tả ngắn: Ứng dụng web gồm 2 phân hệ khách hàng và hệ thống quản trị, cho phép đặt món, theo dõi đơn hàng, thanh toán COD/QR mock và quản lý vận hành đơn hàng.

## 2. Thành viên nhóm (6 người)

| STT | MSSV | Họ tên | Lớp |
| --- | --- | --- | --- |
| 1 | DH52200314 | Trần Huy An | D22_TH15 |
| 2 | DH52200449 | Đỗ Tô Thanh Danh | D22_TH15 |
| 3 | DH52200486 | Nguyễn Tiến Đạt | D22_TH15 |
| 4 | DH52201232 | Lê Đỗ Duy Phúc | D22_TH15 |
| 5 | DH52110819 | Lý Tuấn Đức | D21_TH06 |
| 6 | DH52200834 | Hồ Bảo Khang | D22_TH05 |

## 3. Chức năng chính

### 3.1. Phía khách hàng

- Đăng ký, đăng nhập tài khoản.
- Xem danh mục, xem món ăn, thêm vào giỏ hàng.
- Checkout và tạo đơn hàng.
- Chọn phương thức thanh toán:
	- Tiền mặt khi nhận hàng (COD).
	- Chuyển khoản QR mock.
- Theo dõi trạng thái đơn hàng.

### 3.2. Phía admin

- Quản lý danh mục món ăn.
- Quản lý sản phẩm.
- Quản lý đơn hàng và cập nhật trạng thái nhanh.
- Theo dõi dashboard:
	- Đơn chờ xử lý.
	- Đơn đã giao theo ngày.
	- Doanh thu theo ngày.

## 4. Công nghệ sử dụng

- Frontend: React + Vite + TailwindCSS + Axios
- Backend: Laravel 8 + Sanctum + L5 Swagger
- Database: MySQL/MariaDB

## 5. Cấu trúc thư mục

- backend: API Laravel, migration, seeder, swagger
- frontend: giao dien React cho khach hang va admin

## 6. Hướng dẫn cài đặt và chạy chi tiết

## 6.1. Yêu cầu môi trường

- PHP 8.x
- Composer
- Node.js 18+ va npm
- MySQL/MariaDB

## 6.2. Cài đặt backend

Mở terminal tại thư mục backend và chạy:

```bash
composer install
```

Tạo file .env (nếu máy mới chưa có), sau đó cấu hình kết nối DB.

Ví dụ thông số cần chỉnh trong .env:

```env
APP_NAME=VeoFood
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=veofood
DB_USERNAME=root
DB_PASSWORD=
```

Khởi tạo key, migration, seeder và swagger:

```bash
php artisan key:generate
php artisan migrate --seed
php artisan l5-swagger:generate
```

Chạy backend:

```bash
php artisan serve --host=127.0.0.1 --port=8000
```

## 6.3. Cài đặt frontend

Mở terminal tại thư mục frontend và chạy:

```bash
npm install
npm run dev -- --host 127.0.0.1 --port 3000
```

## 6.4. Link truy cập local

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api
- Swagger UI: http://localhost:8000/api/documentation

## 6.5. Tài khoản demo

Tài khoản được tạo từ seeder:

- Admin:
	- Email: admin@veofood.com
	- Password: Admin1234
- Khach hang:
	- Email: khachhang@gmail.com
	- Password: 123456

## 7. Nghiệp vụ thanh toán đang áp dụng

- QR mock:
	- Khách tạo đơn và quét QR.
	- Link QR gọi endpoint xác nhận mock.
	- Đơn được cập nhật thanh toán thành công theo luồng mock.

- COD:
	- Khi admin cập nhật đến Hoàn thành, trạng thái thanh toán hiển thị Đã thanh toán theo nghiệp vụ đồ án.

## 8. API tiêu biểu

- Auth: /api/register, /api/login, /api/logout

- Đơn hàng:
	- GET /api/orders
	- POST /api/orders
	- GET /api/orders/{id}
	- PATCH /api/orders/{id}/status
- QR mock:
	- POST /api/orders/{id}/payment/qr-session
	- GET /api/mock-payments/qr/confirm/{sessionId}

## 9. Dashboard admin

- Đơn chờ xử lý: tính theo trạng thái pending/paid theo quy ước vận hành hiện tại.
- Đơn đã giao và doanh thu theo ngày: tính theo mốc thời gian xử lý đơn (ưu tiên updated_at).

## 10. Build và kiểm tra nhanh

Trong frontend:

```bash
npm run build
```

Trong backend (nếu cập nhật annotation):

```bash
php artisan l5-swagger:generate
```

## 11. Giới hạn scope hiện tại

- Thanh toán QR là mock demo, chưa tích hợp cổng thanh toán thật.
- Chưa tách bảng payment riêng, dữ liệu thanh toán đang theo quy ước nghiệp vụ của đồ án.
