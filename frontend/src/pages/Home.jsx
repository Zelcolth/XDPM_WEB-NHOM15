import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient, { setAuthToken } from '../api/axiosClient';
import phoImg from '../assets/Phol.png';
import banhmiImg from '../assets/banhmi.png';
import sushiImg from '../assets/sushi.png';
import heroImg from '../assets/hero.png';

export default function Home() {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  // ===== SCROLL REF =====
  const aboutRef = useRef(null);
  const menuRef = useRef(null);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // ===== AUTH =====
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setAuthToken(token);
      setIsLoggedIn(true);
    }
  }, []);

  const logout = async () => {
    try {
      await axiosClient.post('/logout');
    } catch (err) {
      console.error(err);
    } finally {
      localStorage.removeItem("token");
      setAuthToken(null);
      setIsLoggedIn(false);
      navigate("/");
    }
  };

  // ===== SLIDER =====
  const slides = [heroImg, phoImg, sushiImg];
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // ===== DATA =====
  const products = [
    { id: 1, name: 'Phở Bò Kobe', price: 24.0, img: phoImg },
    { id: 2, name: 'Bánh Mì Đặc Biệt', price: 12.5, img: banhmiImg },
    { id: 3, name: 'Sushi Premium', price: 38.0, img: sushiImg },
  ];

  return (
    <div className="bg-[#FDF7F2]">

      {/* ===== NAVBAR ===== */}
      <header className="flex justify-between items-center px-10 py-4 bg-white shadow sticky top-0 z-50">
        <div className="text-xl font-bold text-orange-500">🍴 VèoFood</div>

        <nav className="flex gap-6 text-sm font-medium">
          <span className="text-orange-500 cursor-pointer">Trang Chủ</span>

          {/* 🔥 SCROLL */}
          <span onClick={() => scrollToSection(aboutRef)} className="cursor-pointer hover:text-orange-500">
            Giới Thiệu
          </span>

          <span onClick={() => scrollToSection(menuRef)} className="cursor-pointer hover:text-orange-500">
            Thực Đơn
          </span>

          {isLoggedIn && (
            <span onClick={() => navigate('/order')} className="cursor-pointer hover:text-orange-500">
              Đơn hàng
            </span>
          )}

          {isLoggedIn && (
            <span onClick={() => navigate('/account')} className="cursor-pointer hover:text-orange-500">
              Tài Khoản
            </span>
          )}
        </nav>

        <div className="flex gap-3">
          {!isLoggedIn ? (
            <>
              <button onClick={() => navigate('/auth')} className="px-4 py-2 border rounded-full">
                Đăng nhập
              </button>
              <button onClick={() => navigate('/auth')} className="px-4 py-2 bg-orange-500 text-white rounded-full">
                Đăng ký
              </button>
            </>
          ) : (
            <div className="relative">
  {!isLoggedIn ? (
    <>
      <button
        onClick={() => navigate('/auth')}
        className="text-sm px-4 py-2 border rounded-full hover:bg-gray-100"
      >
        Đăng nhập
      </button>
      <button
        onClick={() => navigate('/auth')}
        className="text-sm px-4 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600"
      >
        Đăng ký
      </button>
    </>
  ) : (
    <>
      {/* 🔥 ICON USER */}
      <div
        onClick={() => setShowMenu(!showMenu)}
        className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center cursor-pointer font-bold"
      >
        U
      </div>

      {/* 🔥 DROPDOWN */}
      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-xl overflow-hidden z-50">
          <div
            onClick={() => navigate('/account')}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
          >
            Tài khoản
          </div>

          <div
            onClick={() => navigate('/order')}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
          >
            Đơn hàng
          </div>

          <div
            onClick={logout}
            className="px-4 py-2 text-red-500 hover:bg-gray-100 cursor-pointer"
          >
            Đăng xuất
          </div>
        </div>
      )}
    </>
  )}
</div>
          )}
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="relative h-[500px]">
        <img src={slides[currentSlide]} className="w-full h-full object-cover" />

        <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-white">
          <h1 className="text-4xl font-bold mb-4">VèoFood Restaurant</h1>
          <p className="mb-6">Tinh hoa ẩm thực Việt</p>

          <button
            onClick={() => scrollToSection(menuRef)}
            className="bg-orange-500 px-6 py-2 rounded-lg"
          >
            Xem thực đơn
          </button>
        </div>
      </section>

      {/* ===== ABOUT ===== */}
      <section ref={aboutRef} className="py-16 px-6 bg-white text-center">
        <h2 className="text-3xl font-bold mb-6 text-orange-500">
          Giới thiệu
        </h2>

        <p className="max-w-3xl mx-auto text-gray-600 leading-relaxed">
          VèoFood mang đến trải nghiệm ẩm thực Việt Nam đích thực với những món ăn được chế biến từ nguyên liệu tươi ngon nhất.
          Chúng tôi cam kết chất lượng, tốc độ và sự hài lòng của khách hàng.
        </p>
      </section>

      {/* ===== MENU ===== */}
      <section ref={menuRef} className="py-16 px-6 bg-[#FDF7F2]">
        <h2 className="text-3xl font-bold text-center mb-10 text-orange-500">
          Thực đơn
        </h2>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {products.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition">
              <img src={item.img} className="w-full h-40 object-cover rounded-lg" />

              <h3 className="mt-3 font-bold">{item.name}</h3>

              <div className="flex justify-between mt-3">
                <span className="text-orange-500 font-bold">${item.price}</span>

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

      {/* ===== FOOTER ===== */}
      <footer className="bg-white rounded-t-[3rem] mt-12 py-12 px-4 md:px-10">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Vèo Food</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Tinh hoa ẩm thực được giao tận nơi với độ chính xác tuyệt đối. Nâng tầm trải nghiệm ăn uống mỗi ngày của bạn.
            </p>
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
              <input 
                type="email" 
                placeholder="Email của bạn" 
                className="bg-transparent pl-4 outline-none text-sm w-full" 
              />
              <button className="bg-[#8C592B] text-white px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap hover:bg-[#6d4522]">
                Đăng ký
              </button>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}