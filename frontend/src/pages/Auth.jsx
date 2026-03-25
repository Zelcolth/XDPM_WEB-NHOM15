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

      // 🔥 FIX: override message backend
      if (status === 401) {
        setMessage('Email hoặc mật khẩu không đúng');
      } 
      else if (status === 422 && err.response?.data?.errors) {
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
    <div className="min-h-screen flex items-center justify-center bg-[#FDF7F2] p-4">

      <div className="w-full max-w-[850px] h-[550px] bg-white rounded-3xl shadow-2xl flex">

        {/* LEFT */}
        <div className="w-1/2 flex flex-col justify-center items-center p-10">

          {isLogin ? (
            <>
              <h2 className="text-3xl font-bold mb-6">Đăng Nhập</h2>

              <div className="w-full space-y-4">

                {}
                {message && (
                  <div className={`w-full p-3 rounded ${messageType === 'error'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-green-100 text-green-700'}`}>
                    {message}
                  </div>
                )}

                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full p-3 bg-gray-100 rounded"
                />
                {errors.email && <div className="text-sm text-red-500">{errors.email}</div>}

                <input
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  type="password"
                  placeholder="Mật khẩu"
                  className="w-full p-3 bg-gray-100 rounded"
                />
                {errors.password && <div className="text-sm text-red-500">{errors.password}</div>}

                <button
                  onClick={handleLogin}
                  className="w-full bg-orange-500 text-white py-3 rounded">
                  ĐĂNG NHẬP
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold mb-6">Đăng Ký</h2>

              <div className="w-full space-y-4">

                {message && (
                  <div className={`w-full p-3 rounded ${messageType === 'error'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-green-100 text-green-700'}`}>
                    {message}
                  </div>
                )}

                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Họ và tên"
                  className="w-full p-3 bg-gray-100 rounded"
                />
                {errors.name && <div className="text-sm text-red-500">{errors.name}</div>}

                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full p-3 bg-gray-100 rounded"
                />
                {errors.email && <div className="text-sm text-red-500">{errors.email}</div>}

                <input
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  type="password"
                  placeholder="Mật khẩu"
                  className="w-full p-3 bg-gray-100 rounded"
                />
                {errors.password && <div className="text-sm text-red-500">{errors.password}</div>}

                <input
                  value={passwordConfirm}
                  onChange={e => setPasswordConfirm(e.target.value)}
                  type="password"
                  placeholder="Xác nhận mật khẩu"
                  className="w-full p-3 bg-gray-100 rounded"
                />
                {errors.passwordConfirm && <div className="text-sm text-red-500">{errors.passwordConfirm}</div>}

                <button
                  onClick={handleRegister}
                  className="w-full bg-orange-500 text-white py-3 rounded">
                  ĐĂNG KÝ
                </button>
              </div>
            </>
          )}

          <button
            onClick={() => setIsLogin(!isLogin)}
            className="mt-6 text-orange-500">
            {isLogin ? "Chưa có tài khoản? Đăng ký" : "Đã có tài khoản? Đăng nhập"}
          </button>

        </div>

        {/* RIGHT */}
        <div className="w-1/2 bg-orange-500 rounded-r-3xl flex items-center justify-center text-white">
          <h1 className="text-3xl font-bold">Restaurant System</h1>
        </div>

      </div>
    </div>
  );
}