import React, { useState } from "react";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF7F2] font-sans p-4">
      <div className="relative w-full max-w-[850px] h-[550px] bg-white rounded-[2rem] shadow-2xl overflow-hidden flex">

        {/* LEFT SIDE */}
        <div className="w-1/2 h-full overflow-hidden relative z-10">
          <div
            className={`absolute inset-0 flex w-[200%] h-full transition-transform duration-700 ease-in-out ${
              isLogin ? "translate-x-0" : "translate-x-[-50%]"
            }`}
          >

            {/* LOGIN */}
            <div className="w-1/2 flex-shrink-0 flex flex-col justify-center items-center px-10">
              <h2 className="text-3xl font-extrabold text-gray-800 mb-6">
                Đăng Nhập
              </h2>

              <div className="w-full space-y-4">
                <input
                  type="text"
                  placeholder="Tên đăng nhập hoặc Email"
                  className="w-full p-3 rounded-lg bg-gray-100 outline-none focus:ring-2 focus:ring-orange-400"
                />

                <input
                  type="password"
                  placeholder="Mật khẩu"
                  className="w-full p-3 rounded-lg bg-gray-100 outline-none focus:ring-2 focus:ring-orange-400"
                />

                <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition">
                  ĐĂNG NHẬP
                </button>
              </div>
            </div>

            {/* REGISTER */}
            <div className="w-1/2 flex-shrink-0 flex flex-col justify-center items-center px-10">
              <h2 className="text-3xl font-extrabold text-gray-800 mb-6">
                Tạo Tài Khoản
              </h2>

              <div className="w-full space-y-4">
                <input
                  type="text"
                  placeholder="Họ và tên"
                  className="w-full p-3 rounded-lg bg-gray-100 outline-none focus:ring-2 focus:ring-orange-400"
                />

                <input
                  type="email"
                  placeholder="Email"
                  className="w-full p-3 rounded-lg bg-gray-100 outline-none focus:ring-2 focus:ring-orange-400"
                />

                <input
                  type="password"
                  placeholder="Mật khẩu"
                  className="w-full p-3 rounded-lg bg-gray-100 outline-none focus:ring-2 focus:ring-orange-400"
                />

                <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition">
                  ĐĂNG KÝ
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-1/2 h-full bg-gradient-to-br from-orange-500 to-orange-700 text-white flex flex-col justify-center items-center text-center px-8">

          {isLogin ? (
            <>
              <h2 className="text-4xl font-bold mb-4">
                Chào Bạn Mới!
              </h2>

              <p className="mb-6 opacity-90">
                Đăng ký để sử dụng hệ thống của chúng tôi
              </p>

              <button
                onClick={() => setIsLogin(false)}
                className="border-2 border-white px-8 py-2 rounded-full hover:bg-white hover:text-orange-600 transition font-semibold"
              >
                ĐĂNG KÝ
              </button>
            </>
          ) : (
            <>
              <h2 className="text-4xl font-bold mb-4">
                Mừng Trở Lại!
              </h2>

              <p className="mb-6 opacity-90">
                Nếu đã có tài khoản hãy đăng nhập
              </p>

              <button
                onClick={() => setIsLogin(true)}
                className="border-2 border-white px-8 py-2 rounded-full hover:bg-white hover:text-orange-600 transition font-semibold"
              >
                ĐĂNG NHẬP
              </button>
            </>
          )}

        </div>

      </div>
    </div>
  );
}