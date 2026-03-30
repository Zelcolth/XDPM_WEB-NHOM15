import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosClient, { setAuthToken } from "../api/axiosClient";

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const mode = new URLSearchParams(location.search).get('mode');
    if (mode === 'register') {
      setIsLogin(false);
    } else if (mode === 'login') {
      setIsLogin(true);
    }
  }, [location.search]);

  const switchMode = (nextIsLogin) => {
    setIsLogin(nextIsLogin);
    setMessage('');
    setMessageType('');
    setErrors({});
    navigate(nextIsLogin ? '/auth?mode=login' : '/auth?mode=register', { replace: true });
  };

  // ================= LOGIN =================
  const handleLogin = async () => {
    const clientErr = {};

    if (!email)
      clientErr.email = 'Email là bắt buộc.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      clientErr.email = 'Email không đúng định dạng.';

    if (!password)
      clientErr.password = 'Mật khẩu là bắt buộc.';
    else if (password.length < 8)
      clientErr.password = 'Mật khẩu phải có tối thiểu 8 ký tự.';
    else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password))
      clientErr.password = 'Mật khẩu phải bao gồm chữ và số.';

    if (Object.keys(clientErr).length) {
      setErrors(clientErr);
      setMessage("");
      return;
    }

    try {
      const res = await axiosClient.post('/login', { email, password });

      const token = res.data.token;
      localStorage.setItem('token', token);
      setAuthToken(token);

      setErrors({});
      setMessage('Đăng nhập thành công');
      setMessageType('success');

      navigate("/");
    } catch (err) {
      const status = err.response?.status;

      setErrors({});

      if (status === 401) {
        setMessage('Email hoặc mật khẩu không đúng');
      } else if (status === 422 && err.response?.data?.errors) {
        const be = {};
        Object.entries(err.response.data.errors).forEach(([k, v]) => {
          be[k] = v.join(' ');
        });
        setErrors(be);
        setMessage('Dữ liệu không hợp lệ');
      } 
      else {
        setMessage('Có lỗi xảy ra, vui lòng thử lại');
      }

      setMessageType('error');
    }
  };

  // ================= REGISTER =================
  const handleRegister = async () => {
    const clientErr = {};

    if (!name)
      clientErr.name = 'Họ và tên là bắt buộc.';

    if (!email)
      clientErr.email = 'Email là bắt buộc.';
    else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email))
      clientErr.email = 'Email không đúng định dạng.';

    if (!password)
      clientErr.password = 'Mật khẩu là bắt buộc.';
    else if (password.length < 8)
      clientErr.password = 'Mật khẩu phải có tối thiểu 8 ký tự.';
    else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password))
      clientErr.password = 'Mật khẩu phải bao gồm chữ và số.';

    if (password !== passwordConfirm)
      clientErr.passwordConfirm = 'Mật khẩu xác nhận không khớp.';

    if (Object.keys(clientErr).length) {
      setErrors(clientErr);
      setMessage("");
      return;
    }

    try {
      const res = await axiosClient.post('/register', {
        name,
        email,
        password,
        password_confirmation: passwordConfirm
      });

      const token = res.data.token;
      localStorage.setItem('token', token);
      setAuthToken(token);

      setErrors({});
      setMessage('Đăng ký thành công');
      setMessageType('success');

      navigate("/");
    } catch (err) {
      const status = err.response?.status;

      setErrors({});

      if (status === 422 && err.response?.data?.errors) {
        const be = {};
        Object.entries(err.response.data.errors).forEach(([k, v]) => {
          be[k] = v.join(' ');
        });
        setErrors(be);
        setMessage('Dữ liệu không hợp lệ');
      } else {
        setMessage('Đăng ký thất bại');
      }

      setMessageType('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF7F2] font-sans p-4">
      <div className="relative w-full max-w-[850px] h-[550px] bg-white rounded-[2rem] shadow-2xl overflow-hidden flex">
        <div className="w-1/2 h-full overflow-hidden relative z-10">
          <div
            className={`absolute inset-0 flex w-[200%] h-full transition-transform duration-700 ease-in-out ${
              isLogin ? "translate-x-0" : "translate-x-[-50%]"
            }`}
          >
            <div className="w-1/2 flex-shrink-0 flex flex-col justify-center items-center px-10">
              <h2 className="text-3xl font-extrabold text-gray-800 mb-6">Đăng Nhập</h2>

              <div className="w-full space-y-4">
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="text"
                  placeholder="Email"
                  className="w-full p-3 rounded-lg bg-gray-100 outline-none focus:ring-2 focus:ring-orange-400"
                />
                {errors.email && <div className="text-sm text-red-600 mt-1">{errors.email}</div>}

                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="Mật khẩu"
                  className="w-full p-3 rounded-lg bg-gray-100 outline-none focus:ring-2 focus:ring-orange-400"
                />
                {errors.password && <div className="text-sm text-red-600 mt-1">{errors.password}</div>}

                <button
                  onClick={handleLogin}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition"
                >
                  ĐĂNG NHẬP
                </button>
              </div>
            </div>

            <div className="w-1/2 flex-shrink-0 flex flex-col justify-center items-center px-10">
              <h2 className="text-3xl font-extrabold text-gray-800 mb-6">Tạo Tài Khoản</h2>

              <div className="w-full space-y-4">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  placeholder="Họ và tên"
                  className="w-full p-3 rounded-lg bg-gray-100 outline-none focus:ring-2 focus:ring-orange-400"
                />
                {errors.name && <div className="text-sm text-red-600 mt-1">{errors.name}</div>}

                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="Email"
                  className="w-full p-3 rounded-lg bg-gray-100 outline-none focus:ring-2 focus:ring-orange-400"
                />
                {errors.email && <div className="text-sm text-red-600 mt-1">{errors.email}</div>}

                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="Mật khẩu"
                  className="w-full p-3 rounded-lg bg-gray-100 outline-none focus:ring-2 focus:ring-orange-400"
                />
                {errors.password && <div className="text-sm text-red-600 mt-1">{errors.password}</div>}

                <input
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  type="password"
                  placeholder="Xác nhận mật khẩu"
                  className="w-full p-3 rounded-lg bg-gray-100 outline-none focus:ring-2 focus:ring-orange-400"
                />
                {errors.passwordConfirm && (
                  <div className="text-sm text-red-600 mt-1">{errors.passwordConfirm}</div>
                )}

                <button
                  onClick={handleRegister}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition"
                >
                  ĐĂNG KÝ
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="w-1/2 h-full bg-gradient-to-br from-orange-500 to-orange-700 text-white flex flex-col justify-center items-center text-center px-8">
          {isLogin ? (
            <>
              <h2 className="text-4xl font-bold mb-4">Chào Bạn Mới!</h2>
              <p className="mb-6 opacity-90">Đăng ký để sử dụng hệ thống của chúng tôi</p>
              <button
                onClick={() => switchMode(false)}
                className="border-2 border-white px-8 py-2 rounded-full hover:bg-white hover:text-orange-600 transition font-semibold"
              >
                ĐĂNG KÝ
              </button>
            </>
          ) : (
            <>
              <h2 className="text-4xl font-bold mb-4">Mừng Trở Lại!</h2>
              <p className="mb-6 opacity-90">Nếu đã có tài khoản hãy đăng nhập</p>
              <button
                onClick={() => switchMode(true)}
                className="border-2 border-white px-8 py-2 rounded-full hover:bg-white hover:text-orange-600 transition font-semibold"
              >
                ĐĂNG NHẬP
              </button>
            </>
          )}

          {message && (
            <div
              className={`mt-6 px-4 py-2 rounded ${
                messageType === 'error' ? 'bg-red-100 text-red-700' : 'bg-white text-orange-600'
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}