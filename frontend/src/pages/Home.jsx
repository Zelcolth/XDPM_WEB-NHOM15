import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import phoImg from '../assets/Phol.png';
import banhmiImg from '../assets/banhmi.png';
import sushiImg from '../assets/sushi.png';
import heroImg from '../assets/hero.png';

export default function Home() {
  const navigate = useNavigate();

  // Slider images
  const slides = [heroImg, phoImg, sushiImg];
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? slides.length - 1 : prev - 1
    );
  };

  const products = [
    { id: 1, name: 'Phở Bò Kobe', rating: 4.9, time: '15-20 min', price: 24.0, img: phoImg },
    { id: 2, name: 'Bánh Mì Đặc Biệt', rating: 4.8, time: '10-15 min', price: 12.5, img: banhmiImg },
    { id: 3, name: 'Sushi Premium', rating: 5.0, time: '25-30 min', price: 38.0, img: sushiImg },
  ];

  return (
    <div className="bg-[#FDF7F2] min-h-screen">

      {/* NAVBAR */}
      <header className="flex items-center justify-between px-10 py-4 bg-white shadow">

  <div className="text-xl font-bold text-orange-500">
    🍴 VèoFood
  </div>

  <nav className="flex gap-6 text-sm font-medium">
    <span className="text-orange-500 cursor-pointer">Trang Chủ</span>
    <span onClick={() => navigate('/about')} className="cursor-pointer hover:text-orange-500">Giới Thiệu</span>
    <span onClick={() => navigate('/menu')} className="cursor-pointer hover:text-orange-500">Thực Đơn</span>
    <span onClick={() => navigate('/account')} className="cursor-pointer hover:text-orange-500">Tài Khoản</span>
  </nav>

  {/* SEARCH + AUTH */}
  <div className="flex items-center gap-3">
    
    <input
      type="text"
      placeholder="Tìm món..."
      className="border px-4 py-2 rounded-full text-sm outline-none"
    />

    <button
      onClick={() => navigate('/login')}
      className="text-sm px-4 py-2 border rounded-full hover:bg-gray-100"
    >
      Đăng nhập
    </button>

    <button
      onClick={() => navigate('/register')}
      className="text-sm px-4 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600"
    >
      Đăng ký
    </button>

  </div>

</header>

      {/* SLIDER */}
      <section className="relative h-[400px]">

        <img
          src={slides[currentSlide]}
          alt="slide"
          className="w-full h-full object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white text-center">
          <h1 className="text-4xl font-bold mb-4">
            Chào Mừng Đến Quán VèoFood
          </h1>
          <p className="mb-6">Trải nghiệm ẩm thực Việt Nam đích thực</p>
          <button className="bg-orange-500 px-6 py-2 rounded-lg">
            Đặt Món Ngay
          </button>
        </div>

        {/* Prev */}
        <button
          onClick={prevSlide}
          className="absolute left-5 top-1/2 -translate-y-1/2 bg-orange-500 text-white w-10 h-10 rounded-full"
        >
          ❮
        </button>

        {/* Next */}
        <button
          onClick={nextSlide}
          className="absolute right-5 top-1/2 -translate-y-1/2 bg-orange-500 text-white w-10 h-10 rounded-full"
        >
          ❯
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, index) => (
            <div
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full cursor-pointer ${
                currentSlide === index ? 'bg-white' : 'bg-gray-400'
              }`}
            />
          ))}
        </div>

      </section>

      {/* PRODUCT */}
      <section className="container mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Món ăn nổi bật
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {products.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-xl shadow">

              <img
                src={item.img}
                className="w-full h-40 object-cover rounded-lg"
              />

              <h3 className="mt-3 font-bold">{item.name}</h3>
              <p className="text-sm text-gray-500">
                ⭐ {item.rating} • {item.time}
              </p>

              <div className="flex justify-between mt-3">
                <span className="font-bold">${item.price}</span>
                <button
                  onClick={() => navigate('/menu')}
                  className="bg-orange-500 text-white px-3 py-1 rounded"
                >
                  Xem
                </button>
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
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