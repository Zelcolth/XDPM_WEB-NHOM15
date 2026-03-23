import React, { useState } from 'react';
import phoImg from '../assets/Phol.png';
import banhmiImg from '../assets/banhmi.png';
import sushiImg from '../assets/sushi.png';

export default function Checkout() {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
  });

  const cartItems = [
    { id: 1, name: 'Phở Bò Kobe', price: 24.00, qty: 1, img: phoImg },
    { id: 2, name: 'Bánh Mì Đặc Biệt', price: 12.50, qty: 2, img: banhmiImg },
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = 2.50;
  const tax = (subtotal * 0.1).toFixed(2);
  const total = (parseFloat(subtotal) + shipping + parseFloat(tax)).toFixed(2);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="bg-[#FDF7F2] min-h-screen font-sans text-gray-800">
      {/* Header */}
      <header className="flex justify-between items-center py-6 px-10 bg-white shadow-sm">
        <div className="text-2xl font-bold text-orange-500 italic">VèoFood</div>
        <nav className="hidden md:flex space-x-8 font-medium text-sm">
          <a href="/" className="text-gray-500 hover:text-orange-500">Trang chủ</a>
          <a href="#" className="text-gray-500 hover:text-orange-500">Khám phá</a>
          <a href="#" className="text-orange-500 border-b-2 border-orange-500 pb-1">Thanh toán</a>
          <a href="#" className="text-gray-500 hover:text-orange-500">Tài khoản</a>
        </nav>
        <div className="flex space-x-4 text-orange-500">
          <button><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg></button>
          <button><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* Form Thanh Toán */}
        <div className="lg:w-2/3">
          <h1 className="text-3xl font-bold mb-2">Thanh toán</h1>
          <p className="text-gray-500 mb-8">Kiểm tra lại đơn hàng của bạn trước khi đặt.</p>

          {/* Thông tin nhận hàng */}
          <div className="bg-white rounded-3xl p-8 shadow-sm mb-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <span className="mr-3">📦</span> Thông tin nhận hàng
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-bold mb-2">Họ và tên</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Nhập họ và tên"
                  className="w-full px-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Số điện thoại</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Nhập số điện thoại"
                  className="w-full px-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Địa chỉ email của bạn"
                className="w-full px-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold mb-2">Địa chỉ giao hàng</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Địa chỉ giao hàng"
                className="w-full px-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:border-orange-500"
              />
            </div>


          </div>

          {/* Chi tiết đơn hàng */}
          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <span className="mr-3">❌</span> Chi tiết đơn hàng
            </h2>

            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between pb-4 border-b">
                  <div className="flex items-center gap-4">
                    <img src={item.img} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                    <div>
                      <h4 className="font-bold mb-1">{item.name}</h4>
                      <p className="text-sm text-gray-500">Thanh chế định các đặc độ tố Wagyu</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${(item.price * item.qty).toFixed(2)}</p>
                    <p className="text-sm text-gray-500">{item.qty} x ${item.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tóm tắt đơn hàng */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-3xl p-6 shadow-sm sticky top-6">
            <h2 className="text-xl font-bold mb-6">Tóm tắt</h2>

            <div className="space-y-4 mb-6 pb-6 border-b border-dashed">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tạm tính</span>
                <span className="font-bold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Phí giao hàng</span>
                <span className="font-bold">${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Thuế (VAT)</span>
                <span className="font-bold">${tax}</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6 pb-6 border-b border-dashed">
              <span className="font-bold text-lg">Tổng số tiền</span>
              <span className="text-2xl font-bold text-orange-500">${total}</span>
            </div>

            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Bằng cách nhấp "Đặt hàng", bạn đại diện đồng ý với {' '}
              <a href="#" className="text-orange-500 hover:underline">điều khoản dịch vụ</a> của {' '}
              <a href="#" className="text-orange-500 hover:underline">The Kinetic Gourmet</a>
            </p>

            <button className="w-full bg-orange-500 text-white py-4 rounded-full font-bold hover:bg-orange-600 transition mb-4">
              ĐẶT HÀNG NGAY →
            </button>

            {/* Phương thức thanh toán */}
            <div className="mt-8 pt-6 border-t">
              <h3 className="font-bold mb-4 flex items-center">
                <span className="mr-2">💳</span> Phương thức thanh toán
              </h3>

              <div className="space-y-3">
                <div className="flex items-center p-3 rounded-full border-2 border-orange-500 bg-orange-50">
                  <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold mr-3">
                    V
                  </div>
                  <span className="font-bold">Vi MoMo</span>
                  <span className="text-xs text-gray-500 ml-2">Ví điện tử được sử dụng phổ biến</span>
                </div>

                <div className="flex items-center p-3 rounded-full border border-gray-200">
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                  <span className="font-bold">Tiền mặt</span>
                  <span className="text-xs text-gray-500 ml-2">Thanh toán khi nhận hàng</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white mt-12 py-12 px-4 md:px-10">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold mb-4">VèoFood</h3>
            <p className="text-sm text-gray-500">Nền tảng giao thực phẩm cao cấp tại Việt Nam.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Công ty</h4>
            <ul className="text-sm text-gray-500 space-y-2">
              <li><a href="#" className="hover:text-orange-500">Về chúng tôi</a></li>
              <li><a href="#" className="hover:text-orange-500">Tuyển dụng</a></li>
              <li><a href="#" className="hover:text-orange-500">Báo chí</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Hỗ trợ</h4>
            <ul className="text-sm text-gray-500 space-y-2">
              <li><a href="#" className="hover:text-orange-500">Trung tâm trợ giúp</a></li>
              <li><a href="#" className="hover:text-orange-500">Liên hệ hỗ trợ</a></li>
              <li><a href="#" className="hover:text-orange-500">Bảo mật</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Social</h4>
            <div className="flex space-x-4 text-orange-500">
              <a href="#" className="hover:text-orange-600">Instagram</a>
              <a href="#" className="hover:text-orange-600">Facebook</a>
            </div>
          </div>
        </div>
        <div className="text-center text-xs text-gray-500 mt-8 pt-8 border-t">
          © 2024 VèoFood. Tất cả quyền được bảo lưu.
        </div>
      </footer>
    </div>
  );
}
