import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient, { setAuthToken } from '../api/axiosClient';
import logoImg from '../assets/Ir5Tc.png';

export default function MainHeader() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

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
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
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
    // Delay to ensure Home is mounted before scrolling.
    setTimeout(() => {
      const id = section === 'about' ? 'home-about' : 'home-menu';
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 120);
  };

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
          Giới Thiệu
        </span>
        <span onClick={() => goHomeSection('menu')} className="cursor-pointer hover:text-orange-500">
          Thực Đơn
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
            <div
              onClick={() => navigate('/order')}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200"
            >
              🛒
            </div>

            <div
              onClick={() => setShowMenu((prev) => !prev)}
              className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center cursor-pointer font-bold"
            >
              👤
            </div>

            {showMenu && (
              <div className="absolute right-0 mt-12 w-48 bg-white shadow-lg rounded-xl overflow-hidden z-50">
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
        )}
      </div>
    </header>
  );
}
