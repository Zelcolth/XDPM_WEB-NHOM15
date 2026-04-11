import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient, { setAuthToken } from '../api/axiosClient';
import logoImg from '../assets/Ir5Tc.png';
import { CART_STORAGE_KEY, getCartItems, getCartTotal } from '../utils/cartStorage';

export default function MainHeader() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showCartPanel, setShowCartPanel] = useState(false);
  const [cartItems, setCartItems] = useState(() => getCartItems());
  const cartPanelRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
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
      localStorage.removeItem('token');
      setAuthToken(null);
      setIsLoggedIn(false);
      setShowMenu(false);
      navigate('/');
    }
  };

  const goHome = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goHomeSection = (section) => {
    navigate('/');
    setTimeout(() => {
      const id = section === 'about' ? 'home-about' : 'home-menu';
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 120);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + Number(item?.qty || 0), 0);
  const cartSubtotal = getCartTotal(cartItems);

  return (
    <header className="flex justify-between items-center px-6 md:px-10 py-4 bg-white/95 backdrop-blur shadow sticky top-0 z-50">
      <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
        <img src={logoImg} alt="VeoFood" className="h-14 md:h-11 w-auto object-contain" />
      </div>

      <nav className="flex gap-6 text-sm font-medium">
        <span onClick={goHome} className="cursor-pointer hover:text-orange-500">
          Trang chủ
        </span>
        <span onClick={() => goHomeSection('about')} className="cursor-pointer hover:text-orange-500">
          Giới thiệu
        </span>
        <span onClick={() => goHomeSection('menu')} className="cursor-pointer hover:text-orange-500">
          Thực đơn
        </span>
      </nav>

      <div className="flex gap-3">
        {!isLoggedIn ? (
          <>
            <button
              onClick={() => navigate('/auth?mode=login')}
              className="px-4 py-2 border border-slate-300 rounded-full hover:bg-slate-50"
            >
              Đăng nhập
            </button>
            <button
              onClick={() => navigate('/auth?mode=register')}
              className="px-4 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600"
            >
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
                        Giỏ hàng hiện chưa có sản phẩm nào.
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
                      <span className="text-slate-500">Tạm tính</span>
                      <span className="font-semibold text-slate-800">{cartSubtotal.toLocaleString('vi-VN')} đ</span>
                    </div>
                    <button
                      onClick={() => navigate('/order')}
                      className="w-full mt-3 bg-orange-500 text-white py-2.5 rounded-xl font-semibold hover:bg-orange-600"
                    >
                      Đi tới trang đặt món
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div ref={userMenuRef} className="relative">
              <div
                onClick={() => setShowMenu((prev) => !prev)}
                className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center cursor-pointer font-bold"
              >
                👤
              </div>

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
  );
}
