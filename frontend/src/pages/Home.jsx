import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient, { setAuthToken } from '../api/axiosClient';
import phoImg from '../assets/Phol.png';
import banhmiImg from '../assets/banhmi.png';
import sushiImg from '../assets/sushi.png';
import heroImg from '../assets/hero.png';
import gt1 from '../assets/GioiThieu/1.jpg';
import gt2 from '../assets/GioiThieu/2.jpg';
import gt3 from '../assets/GioiThieu/3.jpg';

export default function Home() {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const aboutRef = useRef(null);
  const menuRef = useRef(null);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

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

  const slides = [heroImg, phoImg, sushiImg];
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // About section carousel
  const introSlides = [gt1, gt2, gt3];
  const [introIndex, setIntroIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIntroIndex(i => (i + 1) % introSlides.length), 3500);
    return () => clearInterval(t);
  }, []);

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState('');

  const buildImageUrl = (imgPath) => {
    if (!imgPath) return null;
    if (imgPath.startsWith('http')) return imgPath;
    try {
      const base = axiosClient.defaults.baseURL.replace(/\/api\/?$/, '');
      return `${base}/${imgPath}`;
    } catch {
      return imgPath;
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      setProductsError('');
      try {
        const res = await axiosClient.get('/products');
        const items = res.data?.data ?? res.data ?? [];
        setProducts(items);
      } catch (error) {
        console.error('Lỗi lấy products:', error);
        setProductsError('Không thể tải danh sách món ăn.');
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="bg-[#FDF7F2]">

      {/* ===== NAVBAR ===== */}
      <header className="flex justify-between items-center px-10 py-4 bg-white shadow sticky top-0 z-50">
        <div className="text-xl font-bold text-orange-500">🍴 VèoFood</div>

        <nav className="flex gap-6 text-sm font-medium">
          <span className="text-orange-500 cursor-pointer">Trang Chủ</span>

          <span onClick={() => scrollToSection(aboutRef)} className="cursor-pointer hover:text-orange-500">
            Giới Thiệu
          </span>

          <span onClick={() => scrollToSection(menuRef)} className="cursor-pointer hover:text-orange-500">
            Thực Đơn
          </span>
        </nav>

        <div className="flex gap-3">
          {!isLoggedIn ? (
            <>
              <button onClick={() => navigate('/auth?mode=login')} className="px-4 py-2 border rounded-full">
                Đăng nhập
              </button>
              <button onClick={() => navigate('/auth?mode=register')} className="px-4 py-2 bg-orange-500 text-white rounded-full">
                Đăng ký
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3 relative">

              {}
              <div
                onClick={() => navigate('/order')}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200"
              >
                🛒
              </div>

              {/*USER */}
              <div
                onClick={() => setShowMenu(!showMenu)}
                className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center cursor-pointer font-bold"
              >
                👤
              </div>

              {/* DROPDOWN */}
              {showMenu && (
                <div className="absolute right-0 mt-12 w-48 bg-white shadow-lg rounded-xl overflow-hidden z-50">
                  <div
                    onClick={() => navigate('/account')}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    Tài khoản
                  </div>

                  <div
                    onClick={logout}
                    className="px-4 py-2 text-red-500 hover:bg-gray-100 cursor-pointer"
                  >
                    Đăng xuất
                  </div>
                </div>
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
      <section ref={aboutRef} className="py-16 px-6 bg-white">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Giới Thiệu</h2>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">

          {/* Left: carousel */}
          <div className="relative">
            <div className="overflow-hidden rounded-2xl shadow-lg">
              <img
                src={introSlides[introIndex]}
                alt="Giới thiệu"
                className="w-full h-[420px] object-cover rounded-2xl transition-all duration-700"
              />
            </div>

            <button
              onClick={() => setIntroIndex((s) => (s - 1 + introSlides.length) % introSlides.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow"
            >
              ❮
            </button>

            <button
              onClick={() => setIntroIndex((s) => (s + 1) % introSlides.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow"
            >
              ❯
            </button>
          </div>

          {/* Right: content */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800">Câu Chuyện Của Chúng Tôi</h3>

            <p className="text-gray-600 leading-relaxed">
              Nhà hàng chúng tôi tự hào phục vụ các món ăn Việt Nam truyền thống với hương vị đậm đà, chất lượng. Với không gian ấm cúng và đội ngũ nhân viên nhiệt tình, chúng tôi cam kết mang đến cho quý khách những trải nghiệm ẩm thực tuyệt vời nhất.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-green-100 text-green-600 rounded-full flex items-center justify-center">✓</div>
                <div className="text-green-600">Nguyên liệu tươi ngon</div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-green-100 text-green-600 rounded-full flex items-center justify-center">✓</div>
                <div className="text-green-600">Phục vụ nhanh chóng</div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-green-100 text-green-600 rounded-full flex items-center justify-center">✓</div>
                <div className="text-green-600">Giá cả hợp lý</div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-green-100 text-green-600 rounded-full flex items-center justify-center">✓</div>
                <div className="text-green-600">Không gian thoải mái</div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ===== MENU ===== */}
      <section ref={menuRef} className="py-16 px-6 bg-[#FDF7F2]">
        <h2 className="text-3xl font-bold text-center mb-10 text-orange-500">
          Thực đơn
        </h2>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {loadingProducts ? (
            <div>Đang tải thực đơn...</div>
          ) : productsError ? (
            <div className="text-red-500">{productsError}</div>
          ) : (
            products.map((item, idx) => (
              <div key={item.id} className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition">
                <img 
                  src={buildImageUrl(item.image) || [phoImg, banhmiImg, sushiImg][idx % 3]} 
                  className="w-full h-40 object-cover rounded-lg" 
                />

                <h3 className="mt-3 font-bold">{item.name}</h3>
                {item.description && <p className="text-sm text-gray-500">{item.description}</p>}

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
            ))
          )}
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-white rounded-t-[3rem] mt-12 py-12 px-4 md:px-10"> <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8"> <div className="md:col-span-1"> <h3 className="text-xl font-bold text-gray-800 mb-4">Vèo Food</h3> <p className="text-sm text-gray-500 leading-relaxed"> Tinh hoa ẩm thực được giao tận nơi với độ chính xác tuyệt đối. Nâng tầm trải nghiệm ăn uống mỗi ngày của bạn. </p> </div> <div> <h4 className="font-bold mb-4">NỀN TẢNG</h4> <ul className="text-sm text-gray-500 space-y-2"> <li><a href="#" className="hover:text-orange-500">Về đầu bếp của chúng tôi</a></li> <li><a href="#" className="hover:text-orange-500">Sự bền vững</a></li> <li><a href="#" className="hover:text-orange-500">Đối tác</a></li> </ul> </div> <div> <h4 className="font-bold mb-4">HỖ TRỢ</h4> <ul className="text-sm text-gray-500 space-y-2"> <li><a href="#" className="hover:text-orange-500">Chính sách bảo mật</a></li> <li><a href="#" className="hover:text-orange-500">Điều khoản dịch vụ</a></li> <li><a href="#" className="hover:text-orange-500">Liên hệ</a></li> </ul> </div> <div> <h4 className="font-bold mb-4 text-right">NHẬN TIN</h4> <div className="flex bg-[#FDF7F2] rounded-full p-1"> <input type="email" placeholder="Email của bạn" className="bg-transparent pl-4 outline-none text-sm w-full" /> <button className="bg-[#8C592B] text-white px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap hover:bg-[#6d4522]"> Đăng ký </button> </div> </div> </div> </footer>

    </div>
  );
}