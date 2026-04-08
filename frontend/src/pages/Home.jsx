import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient, { setAuthToken } from '../api/axiosClient';
import phoImg from '../assets/Phol.png';
import banhmiImg from '../assets/banhmi.png';
import sushiImg from '../assets/sushi.png';
import gt1 from '../assets/GioiThieu/1.jpg';
import gt2 from '../assets/GioiThieu/2.jpg';
import gt3 from '../assets/GioiThieu/3.jpg';
import logoImg from '../assets/Ir5Tc.png';
import FoodCard from '../components/FoodCard';
import Toast from '../components/Toast';
import { addToCart, CART_STORAGE_KEY, getCartItems, getCartTotal } from '../utils/cartStorage';

export default function Home() {
  const [showMenu, setShowMenu] = useState(false);
  const [showCartPanel, setShowCartPanel] = useState(false);
  const [cartItems, setCartItems] = useState(() => getCartItems());
  const navigate = useNavigate();

  const aboutRef = useRef(null);
  const menuRef = useRef(null);
  const cartPanelRef = useRef(null);
  const userMenuRef = useRef(null);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setAuthToken(token);
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'token') {
        setAuthToken(e.newValue);
        setIsLoggedIn(Boolean(e.newValue));
      }

      if (e.key === CART_STORAGE_KEY) {
        setCartItems(getCartItems());
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cartPanelRef.current && !cartPanelRef.current.contains(event.target)) {
        setShowCartPanel(false);
      }

      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
      setShowMenu(false);
      navigate("/");
    }
  };

  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      image: phoImg,
      title: 'Món Ăn Đặc Sắc',
      desc: 'Hướng vị truyền thống, chất lượng đảm bảo',
      cta: 'Xem Thực Đơn',
      onClick: () => scrollToSection(menuRef),
    },
    {
      image: sushiImg,
      title: 'Không Gian Ấm Cúng',
      desc: 'Phù hợp cho gia đình và bạn bè',
      cta: 'Tìm Hiểu Thêm',
      onClick: () => scrollToSection(aboutRef),
    },
    {
      image: gt2,
      title: 'Chào Mừng Đến VèoFood',
      desc: 'Trải nghiệm ẩm thực Việt Nam đích thực',
      cta: isLoggedIn ? 'Xem Đơn Hàng' : 'Đăng Nhập Ngay',
      onClick: () => navigate(isLoggedIn ? '/order' : '/auth?mode=login'),
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4200);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const goHeroSlide = (delta) => {
    setCurrentSlide((prev) => (prev + delta + heroSlides.length) % heroSlides.length);
  };

  // About section carousel
  const introSlides = [gt1, gt2, gt3];
  const [introIndex, setIntroIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIntroIndex((i) => (i + 1) % introSlides.length), 4000);
    return () => clearInterval(t);
  }, []);

  const [categories, setCategories] = useState([]);

  const ITEMS_PER_PAGE = 4;

  // Map products theo category: { [categoryId]: [items...] }
  const [categoryProducts, setCategoryProducts] = useState({});
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState('');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  // Trang hiện tại cho mỗi category (0-based)
  const [currentPage, setCurrentPage] = useState({});
  const [menuFading, setMenuFading] = useState({});

  // timers per category để auto chuyển trang
  const timersRef = useRef({});
  const fadeTimersRef = useRef({});

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

  const cartCount = cartItems.reduce((sum, item) => sum + Number(item?.qty || 0), 0);
  const cartSubtotal = getCartTotal(cartItems);

  const addToCartQuick = (item, categoryId) => {
    try {
      const nextCart = addToCart(
        {
          id: item?.id,
          name: item?.name,
          price: item?.price,
          image: buildImageUrl(item?.image),
          description: item?.description,
        },
        1
      );
      setCartItems(nextCart);
      setShowCartPanel(true);
      setToast({
        visible: true,
        message: `Đã thêm ${item?.name || 'món ăn'} vào giỏ hàng`,
        type: 'success',
      });
    } catch (e) {
      console.error(e);
      setToast({
        visible: true,
        message: 'Không thể thêm món vào giỏ hàng.',
        type: 'error',
      });
    }
  };

  const handleViewOrder = useCallback(() => {
    navigate('/order');
  }, [navigate]);

  const handleQuickAdd = useCallback((item) => {
    addToCartQuick(item);
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchPerCategory = async () => {
      setLoadingProducts(true);
      setProductsError('');
      try {
        const [categoriesRes, productsRes] = await Promise.all([
          axiosClient.get('/categories'),
          axiosClient.get('/products')
        ]);

        const rawCategories = categoriesRes.data?.data ?? categoriesRes.data ?? [];
        const products = productsRes.data?.data ?? productsRes.data ?? [];

        const normalizedCategories = rawCategories
          .map((c) => ({ id: Number(c.id), name: c.name || `Danh má»¥c ${c.id}` }))
          .filter((c) => Number.isFinite(c.id));

        const map = {};
        normalizedCategories.forEach((c) => {
          map[c.id] = [];
        });

        products.forEach((item) => {
          const cid = Number(item.category_id);
          if (map[cid]) {
            map[cid].push(item);
          }
        });

        if (!mounted) return;

        setCategories(normalizedCategories);
        setCategoryProducts(map);

        // khởi tạo currentPage
        const init = {};
        normalizedCategories.forEach(c => { init[c.id] = 0; });
        setCurrentPage(init);

        // start timers
        normalizedCategories.forEach(c => startCategoryTimer(c.id));
      } catch (error) {
        console.error('Lỗi lấy products:', error);
        setProductsError('Không thể tải danh sách món ăn.');
      } finally {
        if (mounted) setLoadingProducts(false);
      }
    };

    fetchPerCategory();

    return () => {
      mounted = false;
      // cleanup timers
      Object.values(timersRef.current || {}).forEach(t => clearTimeout(t));
      timersRef.current = {};
      Object.values(fadeTimersRef.current || {}).forEach(t => clearTimeout(t));
      fadeTimersRef.current = {};
    };
  }, []);

  // Helpers: pagination + timers
  const totalPagesFor = (categoryId) => {
    const arr = categoryProducts[categoryId] || [];
    return Math.max(1, Math.ceil(arr.length / ITEMS_PER_PAGE));
  };

  const getPageItems = (categoryId) => {
    const arr = categoryProducts[categoryId] || [];
    const page = currentPage[categoryId] || 0;
    const start = page * ITEMS_PER_PAGE;
    return arr.slice(start, start + ITEMS_PER_PAGE);
  };

  const clearCategoryTimer = (categoryId) => {
    const t = timersRef.current[categoryId];
    if (t) clearTimeout(t);
    delete timersRef.current[categoryId];
  };

  const clearFadeTimer = (categoryId) => {
    const t = fadeTimersRef.current[categoryId];
    if (t) clearTimeout(t);
    delete fadeTimersRef.current[categoryId];
  };

  const changeCategoryPage = useCallback((categoryId, getNextIndex) => {
    clearFadeTimer(categoryId);
    setMenuFading((prev) => ({ ...prev, [categoryId]: true }));

    fadeTimersRef.current[categoryId] = setTimeout(() => {
      setCurrentPage((prev) => {
        const total = totalPagesFor(categoryId);
        const cur = prev[categoryId] ?? 0;
        const next = getNextIndex(cur, total);
        return { ...prev, [categoryId]: next };
      });
      setMenuFading((prev) => ({ ...prev, [categoryId]: false }));
      delete fadeTimersRef.current[categoryId];
    }, 180);
  }, [totalPagesFor]);

  const startCategoryTimer = (categoryId) => {
    clearCategoryTimer(categoryId);
    // khởi tạo timeout 30s để chuyển sang trang tiếp theo
    timersRef.current[categoryId] = setTimeout(() => {
      changeCategoryPage(categoryId, (cur, total) => (cur + 1) % total);
      // tiếp tục chu kỳ
      startCategoryTimer(categoryId);
    }, 30000);
  };

  const resetCategoryTimer = (categoryId) => {
    clearCategoryTimer(categoryId);
    startCategoryTimer(categoryId);
  };

  const goPage = (categoryId, delta) => {
    changeCategoryPage(categoryId, (cur, total) => (cur + delta + total) % total);
    // reset timer khi user tương tác
    resetCategoryTimer(categoryId);
  };

  const formatPage = (current, total) => `${current + 1}/${total}`;

  return (
    <div className="bg-[#f4efe9] text-slate-900">

      {/* ===== NAVBAR ===== */}
      <header className="flex justify-between items-center px-6 md:px-10 py-4 bg-white/95 backdrop-blur shadow sticky top-0 z-50">
        <div className="flex items-center">
          <img src={logoImg} alt="VÃ¨oFood" className="h-14 md:h-11 w-auto object-contain" />
        </div>

        <nav className="flex gap-6 text-sm font-medium">
          <span
            onClick={() => {
              navigate('/');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="cursor-pointer hover:text-orange-500"
          >
            Trang Chủ
          </span>

          <span onClick={() => scrollToSection(aboutRef)} className="cursor-pointer hover:text-orange-500">
            Giới thiệu
          </span>

          <span onClick={() => scrollToSection(menuRef)} className="cursor-pointer hover:text-orange-500">
            Thực đơn
          </span>
        </nav>

        <div className="flex gap-3">
          {!isLoggedIn ? (
            <>
              <button onClick={() => navigate('/auth?mode=login')} className="px-4 py-2 border border-slate-300 rounded-full hover:bg-slate-50">
                Đăng nhập
              </button>
              <button onClick={() => navigate('/auth?mode=register')} className="px-4 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600">
                Đăng ký
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3 relative">
              <div ref={cartPanelRef} className="relative">
                <div
                  onClick={() => setShowCartPanel((prev) => !prev)}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 relative"
                >
                  🛒
                  {cartCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                  )}
                </div>

                {showCartPanel && (
                  <div className="absolute right-0 mt-3 w-[340px] bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-800">Giỏ hàng của bạn</div>
                        <div className="text-xs text-slate-500">{cartCount} sản phẩm</div>
                      </div>
                      <button
                        onClick={() => navigate('/order')}
                        className="text-sm font-semibold text-orange-500 hover:text-orange-600"
                      >
                        Xem tất cả
                      </button>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      {cartItems.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-slate-500">
                          Giỏ hàng hiện tại chưa có sản phẩm nào.
                        </div>
                      ) : (
                        cartItems.map((cartItem) => (
                          <div key={cartItem.id} className="px-4 py-3 border-b border-slate-100 last:border-b-0 flex gap-3">
                            <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                              {cartItem.img ? (
                                <img src={cartItem.img} alt={cartItem.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-xs text-slate-400">No img</span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-sm text-slate-800 truncate">{cartItem.name}</div>
                              <div className="text-xs text-slate-500 mt-1">SL: {cartItem.qty}</div>
                              <div className="text-sm font-semibold text-orange-600 mt-1">
                                {(Number(cartItem.price || 0) * Number(cartItem.qty || 0)).toLocaleString('vi-VN')} đ
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Tổng cộng</span>
                        <span className="font-semibold text-slate-800">{cartSubtotal.toLocaleString('vi-VN')} đ</span>
                      </div>
                      <button
                        onClick={() => navigate('/order')}
                        className="w-full mt-3 bg-orange-500 text-white py-2.5 rounded-xl font-semibold hover:bg-orange-600"
                      >
                         đi tới trang đặt món
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div ref={userMenuRef} className="relative">
                {/*USER */}
                <div
                  onClick={() => setShowMenu((prev) => !prev)}
                  className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center cursor-pointer font-bold"
                >
                  👤
                </div>

                {/* DROPDOWN */}
                {showMenu && (
                  <div className="absolute right-0 mt-3 w-48 bg-white shadow-lg rounded-xl overflow-hidden z-50">
                    <div
                      onClick={() => {
                        setShowMenu(false);
                        navigate('/account');
                      }}
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
            </div>
          )}
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="relative h-[560px] md:h-[845px] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <img
            key={`${slide.title}-${index}`}
            src={slide.image}
            alt={`VèoFood hero ${index + 1}`}
            className={`absolute inset-0 w-full h-full object-cover will-change-opacity transition-opacity duration-1000 ease-linear ${
              currentSlide === index ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}

        <div className="absolute inset-0 bg-black/45 flex items-center justify-center text-white px-6">
          <div className="text-center w-full max-w-3xl">
              <div className="relative h-[250px] md:h-[280px] flex items-center justify-center">
              {heroSlides.map((slide, idx) => (
                <div
                  key={`hero-content-${idx}`}
                  className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-700 ease-linear ${
                    currentSlide === idx ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <h2 className="text-4xl md:text-6xl font-extrabold leading-tight">{slide.title}</h2>
                  <p className="mt-4 text-xl md:text-3xl font-semibold text-orange-50/95">{slide.desc}</p>
                  <button
                    onClick={slide.onClick}
                    className="mt-8 bg-orange-500 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-orange-600"
                  >
                    {slide.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== ABOUT ===== */}
      <section id="home-about" ref={aboutRef} className="py-16 px-6 bg-white">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Giới Thiệu</h2>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">

          {/* Left: carousel */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl shadow-lg h-[420px]">
              {introSlides.map((slide, idx) => (
                <img
                  key={`intro-${idx}`}
                  src={slide}
                  alt="Giá»›i thiá»‡u"
                  className={`absolute inset-0 w-full h-full object-cover rounded-2xl will-change-opacity transition-opacity duration-900 ease-linear ${
                    introIndex === idx ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              ))}
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
              Nhà hàng của chúng tôi tự hào phục vụ các món ăn Việt Nam truyền thống với hương vị đậm đà, chất lượng. Với không gian âm nhạc và đội ngũ nhân viên nhiệt tình, chúng tôi cam kết mang đến cho quý khách những trải nghiệm ẩm thực tuyệt vời nhất.
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
      <section id="home-menu" ref={menuRef} className="py-16 px-6 bg-[#f4efe9]">
        <h2 className="text-3xl font-bold text-center mb-10 text-orange-500">
          Thực Đơn
        </h2>

        <div className="flex flex-col gap-6 max-w-6xl mx-auto">
          {loadingProducts ? (
            <div>Đang tải thực đơn...</div>
          ) : productsError ? (
            <div className="text-red-500">{productsError}</div>
          ) : (
            categories.length === 0 ? (
              <div className="text-slate-500">Chưa có danh mục để hiển thị.</div>
            ) : (
            categories.map((cat) => {
              const items = categoryProducts[cat.id] || [];
              const pageIndex = currentPage[cat.id] || 0;
              const total = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));

              return (
                <div key={cat.id} className="relative bg-white p-5 md:p-6 rounded-2xl shadow-[0_12px_30px_rgba(15,23,42,0.08)] border border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-orange-600">{cat.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                        Trang {formatPage(pageIndex, total)}
                      </span>
                      <button
                        onClick={() => goPage(cat.id, -1)}
                        className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center hover:bg-orange-200"
                        aria-label={`Prev ${cat.name}`}
                      >
                        ←
                      </button>
                      <button
                        onClick={() => goPage(cat.id, +1)}
                        className="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600"
                        aria-label={`Next ${cat.name}`}
                      >
                        →
                      </button>
                    </div>
                  </div>

                  <div
                    className={`grid md:grid-cols-2 gap-5 transition-opacity duration-300 ease-linear ${
                      menuFading[cat.id] ? 'opacity-30' : 'opacity-100'
                    }`}
                  >
                    {getPageItems(cat.id).length === 0 ? (
                      <div className="text-slate-500 col-span-2">Không có món trong danh mục này.</div>
                    ) : (
                      getPageItems(cat.id).map((item) => (
                        <FoodCard
                          key={item.id}
                          item={item}
                          imageUrl={buildImageUrl(item.image)}
                          onView={handleViewOrder}
                          onQuickAdd={handleQuickAdd}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            }))
          )}
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-[#111827] mt-12 py-12 px-4 md:px-10 text-slate-200">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold text-white mb-4">VèoFood</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Tinh hoa ẩm thực Viêt Nam với nguyên liệu tươi ngon và trải nghiệm đặt món tiện lợi.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-white">LIÊN KẾT</h4>
            <ul className="text-sm text-slate-300 space-y-2">
              <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-orange-300">Trang Chủ</button></li>
              <li><button onClick={() => scrollToSection(aboutRef)} className="hover:text-orange-300">Giới Thiệu</button></li>
              <li><button onClick={() => scrollToSection(menuRef)} className="hover:text-orange-300">Thực Đơn</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-white">LIÊN HỆ</h4>
            <ul className="text-sm text-slate-300 space-y-2">
              <li>67 Trần Thị Nơi, P.4, Q.8, TP.HCM</li>
              <li>024 1234 5678</li>
              <li>info@veofood.com</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-white">GIỜ MỞ CỬA</h4>
            <p className="text-sm text-slate-300">Thứ 2 - Chủ Nhật</p>
            <p className="text-lg font-semibold text-orange-300">10:00 - 22:00</p>
          </div>
        </div>
      </footer>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
        duration={2200}
      />

    </div>
  );
}
