import React, { useState } from 'react';
import phoImg from '../assets/Phol.png';
import banhmiImg from '../assets/banhmi.png';
import sushiImg from '../assets/sushi.png';
import heroImg from '../assets/hero.png';

export default function Home() {
  const [showAll, setShowAll] = useState(false);
  
  // Dữ liệu mẫu giống trong thiết kế
  const categories = ['Tất cả', 'Pizza', 'Burger', 'Phở', 'Sushi', 'Tráng miệng'];
  const suggestedProducts = [
    { id: 1, name: 'Phở Bò Kobe', tag: 'BÁN CHẠY', rating: 4.9, time: '15-20 min', ship: 'Miễn phí', price: 24.00, img: phoImg },
    { id: 2, name: 'Bánh Mì Đặc Biệt', tag: 'MỚI', rating: 4.8, time: '10-15 min', ship: '$2.00', price: 12.50, img: banhmiImg },
    { id: 3, name: 'Premium Nigiri Set', tag: 'ĐẦU BẾP GỢI Ý', rating: 5.0, time: '25-30 min', ship: '$3.50', price: 38.00, img: sushiImg },
  ];
  
  const allProducts = [
    { id: 1, name: 'Phở Bò Kobe', tag: 'BÁN CHẠY', rating: 4.9, time: '15-20 min', ship: 'Miễn phí', price: 24.00, img: phoImg },
    { id: 2, name: 'Bánh Mì Đặc Biệt', tag: 'MỚI', rating: 4.8, time: '10-15 min', ship: '$2.00', price: 12.50, img: banhmiImg },
    { id: 3, name: 'Premium Nigiri Set', tag: 'ĐẦU BẾP GỢI Ý', rating: 5.0, time: '25-30 min', ship: '$3.50', price: 38.00, img: sushiImg },
    { id: 4, name: 'Phở Gà Hương', tag: 'POPULAR', rating: 4.7, time: '18-22 min', ship: 'Miễn phí', price: 22.00, img: phoImg },
    { id: 5, name: 'Bánh Mì Tôm', tag: 'HOT', rating: 4.6, time: '12-18 min', ship: '$2.00', price: 14.00, img: banhmiImg },
    { id: 6, name: 'Sushi Premium Mix', tag: 'BESTSELLER', rating: 4.9, time: '28-32 min', ship: '$4.00', price: 42.00, img: sushiImg },
  ];
  
  const cartItems = [
    { id: 1, name: 'Phở Bò Kobe', note: 'Thêm hành', price: 24.00, qty: 1, img: phoImg },
    { id: 2, name: 'Bánh Mì Đặc Biệt', note: 'Tương ớt cay', price: 12.50, qty: 1, img: banhmiImg },
  ];

  return (

    <div className="bg-[#FDF7F2] min-h-screen font-sans text-gray-800">
      
      <header className="flex justify-between items-center py-6 px-10 bg-white shadow-sm">
        <div className="text-2xl font-bold text-orange-500 italic">VèoFood</div>
        <nav className="hidden md:flex space-x-8 font-medium text-sm">
          <a href="#" className="text-orange-500 border-b-2 border-orange-500 pb-1">Trang chủ</a>
          <a href="#" className="text-gray-500 hover:text-orange-500">Khám phá</a>
          <a href="#" className="text-gray-500 hover:text-orange-500">Đơn hàng</a>
          <a href="#" className="text-gray-500 hover:text-orange-500">Tài khoản</a>
        </nav>
        <div className="flex space-x-4 text-orange-500">
          <button><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg></button>
          <button><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        
        <div className="lg:w-2/3 space-y-8">
          
          <div className="flex flex-col md:flex-row rounded-3xl overflow-hidden h-72 shadow-lg">
            <div className="md:w-1/2 bg-[#8C592B] p-10 flex flex-col justify-center">
              <h1 className="text-white text-3xl font-bold mb-6 leading-tight">Hương vị tinh tế <br/> giao tận nơi</h1>
              <div className="relative">
                <input type="text" placeholder="Tìm kiếm món ăn..." className="w-full py-3 pl-10 pr-4 rounded-full focus:outline-none" />
                <svg className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
            </div>
            <div className="md:w-1/2 bg-gray-900 flex items-center justify-center relative">
              <img src={heroImg} alt="Banner Food" className="object-cover w-full h-full opacity-80" />
            </div>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat, idx) => (
              <button key={idx} className={`whitespace-nowrap px-6 py-2 rounded-full font-medium transition ${idx === 0 ? 'bg-[#8C592B] text-white' : 'bg-[#FBE9D7] text-[#8C592B] hover:bg-[#f3d9bf]'}`}>
                {cat}
              </button>
            ))}
          </div>

          <div>
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Gợi ý cho bạn</h2>
                <p className="text-gray-500 text-sm mt-1">Những lựa chọn cao cấp được đầu bếp của chúng tôi đề xuất hôm nay.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestedProducts.map((item) => (
                <div key={item.id} className="bg-white rounded-3xl p-4 shadow-sm hover:shadow-md transition">
                  <div className="relative">
                    <img src={item.img} alt={item.name} className="w-full h-40 object-cover rounded-2xl" />
                    <span className="absolute top-3 left-3 bg-yellow-400 text-xs font-bold px-2 py-1 rounded-md">{item.tag}</span>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-lg">{item.name}</h3>
                      <span className="flex items-center text-sm font-medium bg-[#FFF5E6] text-orange-600 px-2 py-0.5 rounded-lg">
                        <span className="text-yellow-500 mr-1">★</span> {item.rating}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">Mô tả ngắn gọn về món ăn cao cấp này...</p>
                    <div className="flex gap-4 mt-3 text-xs text-gray-500 font-medium">
                      <span className="flex items-center">⏱ {item.time}</span>
                      <span className="flex items-center">🛵 {item.ship}</span>
                    </div>
                    <div className="flex justify-between items-center mt-5">
                      <span className="text-xl font-bold">${item.price.toFixed(2)}</span>
                      <button className="bg-[#F97316] text-white p-2 rounded-xl hover:bg-orange-600 transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-8">
              <button onClick={() => setShowAll(!showAll)} className="bg-[#8C592B] text-white px-8 py-3 rounded-full font-bold hover:bg-[#6d4620] transition">
                {showAll ? 'Ẩn bớt ↑' : 'Xem tất cả các món ăn →'}
              </button>
            </div>
          </div>

          {showAll && (
            <div className="mt-12 pt-8 border-t-2 border-gray-200">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Tất cả các món ăn</h2>
                  <p className="text-gray-500 text-sm mt-1">Khám phá toàn bộ bộ sưu tập của chúng tôi.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allProducts.map((item) => (
                  <div key={item.id} className="bg-white rounded-3xl p-4 shadow-sm hover:shadow-md transition">
                    <div className="relative">
                      <img src={item.img} alt={item.name} className="w-full h-40 object-cover rounded-2xl" />
                      <span className="absolute top-3 left-3 bg-yellow-400 text-xs font-bold px-2 py-1 rounded-md">{item.tag}</span>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg">{item.name}</h3>
                        <span className="flex items-center text-sm font-medium bg-[#FFF5E6] text-orange-600 px-2 py-0.5 rounded-lg">
                          <span className="text-yellow-500 mr-1">★</span> {item.rating}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2">Mô tả ngắn gọn về món ăn cao cấp này...</p>
                      <div className="flex gap-4 mt-3 text-xs text-gray-500 font-medium">
                        <span className="flex items-center">⏱ {item.time}</span>
                        <span className="flex items-center">🛵 {item.ship}</span>
                      </div>
                      <div className="flex justify-between items-center mt-5">
                        <span className="text-xl font-bold">${item.price.toFixed(2)}</span>
                        <button className="bg-[#F97316] text-white p-2 rounded-xl hover:bg-orange-600 transition">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:w-1/3">
          <div className="bg-white rounded-3xl p-6 shadow-sm sticky top-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Lựa chọn của bạn</h2>
              <span className="bg-[#FBE9D7] text-[#8C592B] font-bold w-6 h-6 flex items-center justify-center rounded-full text-xs">2</span>
            </div>

            <div className="space-y-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <img src={item.img} alt={item.name} className="w-16 h-16 rounded-full object-cover border border-gray-100" />
                  <div className="flex-1">
                    <h4 className="font-bold text-sm">{item.name}</h4>
                    <p className="text-xs text-gray-500 mb-2">{item.note}</p>
                    <div className="flex items-center bg-[#FDF7F2] w-fit rounded-full px-2 py-1">
                      <button className="text-gray-500 hover:text-orange-500 px-2">-</button>
                      <span className="text-xs font-bold px-2">{item.qty}</span>
                      <button className="text-gray-500 hover:text-orange-500 px-2">+</button>
                    </div>
                  </div>
                  <div className="font-bold text-sm">${item.price.toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-dashed border-gray-200 space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>ĐẦU BẾP GỢI Ý</span>
                <span className="font-medium">$36.50</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Phí giao hàng</span>
                <span className="font-medium text-green-600">Miễn phí</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="font-bold text-lg">Tổng cộng</span>
                <span className="font-bold text-xl">$36.50</span>
              </div>
              <button className="w-full mt-4 bg-[#F97316] text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition shadow-lg shadow-orange-200">
                TIẾN HÀNH THANH TOÁN
              </button>
            </div>
          </div>
        </div>

      </main>

      <footer className="bg-white rounded-t-[3rem] mt-12 py-12 px-4 md:px-10">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Vèo Food</h3>
            <p className="text-sm text-gray-500 leading-relaxed">Tinh hoa ẩm thực được giao tận nơi với độ chính xác tuyệt đối. Nâng tầm trải nghiệm ăn uống mỗi ngày của bạn.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">NỀN TẢNG</h4>
            <ul className="text-sm text-gray-500 space-y-2">
              <li><a href="#" className="hover:text-orange-500">Về đầu bếp của chúng tôi</a></li>
              <li><a href="#" className="hover:text-orange-500">Sự bền vững</a></li>
              <li><a href="#" className="hover:text-orange-500">Đối tác</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">HỖ TRỢ</h4>
            <ul className="text-sm text-gray-500 space-y-2">
              <li><a href="#" className="hover:text-orange-500">Chính sách bảo mật</a></li>
              <li><a href="#" className="hover:text-orange-500">Điều khoản dịch vụ</a></li>
              <li><a href="#" className="hover:text-orange-500">Liên hệ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-right">NHẬN TIN</h4>
            <div className="flex bg-[#FDF7F2] rounded-full p-1">
              <input type="email" placeholder="Email của bạn" className="bg-transparent pl-4 outline-none text-sm w-full" />
              <button className="bg-[#8C592B] text-white px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap">Đăng ký</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}