import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient, { setAuthToken } from "../api/axiosClient";

export default function Auth() {

  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

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
      return;
    }

    try {

      const res = await axiosClient.post('/login',{
        email,
        password
      });

      const token = res.data.token;

      localStorage.setItem('token', token);

      setAuthToken(token);

      setErrors({});

      setMessage('Đăng nhập thành công');

      // chuyển về Home
      navigate("/");

    }
    catch (err) {

      const msg =
        err.response?.data?.message ||
        (err.response?.data?.errors ?
          Object.values(err.response.data.errors).flat().join(' ')
          :
          'Lỗi đăng nhập');

      setMessage(msg);
    }
  };

  const handleRegister = async () => {

    const clientErr = {};

    if (!name)
      clientErr.name = 'Họ và tên là bắt buộc.';

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

    if (password !== passwordConfirm)
      clientErr.passwordConfirm = 'Mật khẩu xác nhận không khớp.';

    if (Object.keys(clientErr).length) {

      setErrors(clientErr);

      return;
    }

    try {

      setErrors({});

      const res = await axiosClient.post('/register',{

        name,
        email,
        password,
        password_confirmation: passwordConfirm

      });

      const token = res.data.token;

      localStorage.setItem('token', token);

      setAuthToken(token);

      setMessage('Đăng ký thành công');

      // chuyển về Home
      navigate("/");

    }
    catch (err) {

      const msg =
        err.response?.data?.message ||
        (err.response?.data?.errors ?
          Object.values(err.response.data.errors).flat().join(' ')
          :
          'Lỗi đăng ký');

      if (err.response?.data?.errors) {

        const be = {};

        Object.entries(err.response.data.errors).forEach(([k, v]) => {

          be[k] = v.join(' ');

        });

        setErrors(be);
      }

      setMessage(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF7F2] p-4">

      <div className="w-full max-w-[850px] h-[550px] bg-white rounded-3xl shadow-2xl flex">

        {/* LEFT */}

        <div className="w-1/2 flex flex-col justify-center items-center p-10">

          {isLogin ?

            <>
              <h2 className="text-3xl font-bold mb-6">
                Đăng Nhập
              </h2>

              <div className="w-full space-y-4">

                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full p-3 bg-gray-100 rounded"
                />

                <input
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  type="password"
                  placeholder="Mật khẩu"
                  className="w-full p-3 bg-gray-100 rounded"
                />

                <button
                  onClick={handleLogin}
                  className="w-full bg-orange-500 text-white py-3 rounded">

                  ĐĂNG NHẬP

                </button>

              </div>
            </>

            :

            <>
              <h2 className="text-3xl font-bold mb-6">
                Đăng Ký
              </h2>

              <div className="w-full space-y-4">

                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Họ và tên"
                  className="w-full p-3 bg-gray-100 rounded"
                />

                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full p-3 bg-gray-100 rounded"
                />

                <input
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  type="password"
                  placeholder="Mật khẩu"
                  className="w-full p-3 bg-gray-100 rounded"
                />

                <input
                  value={passwordConfirm}
                  onChange={e => setPasswordConfirm(e.target.value)}
                  type="password"
                  placeholder="Xác nhận mật khẩu"
                  className="w-full p-3 bg-gray-100 rounded"
                />

                <button
                  onClick={handleRegister}
                  className="w-full bg-orange-500 text-white py-3 rounded">

                  ĐĂNG KÝ

                </button>

              </div>
            </>
          }

          <button
            onClick={() => setIsLogin(!isLogin)}
            className="mt-6 text-orange-500">

            {isLogin ? "Chưa có tài khoản? Đăng ký" : "Đã có tài khoản? Đăng nhập"}

          </button>

          {message &&
            <div className="mt-4 text-orange-500">
              {message}
            </div>
          }

        </div>

        {/* RIGHT */}

        <div className="w-1/2 bg-orange-500 rounded-r-3xl flex items-center justify-center text-white">

          <h1 className="text-3xl font-bold">
            Restaurant System
          </h1>

        </div>

      </div>

    </div>
  );

}