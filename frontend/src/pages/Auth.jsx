import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosClient, { setAuthToken } from "../api/axiosClient";
import Toast from "../components/Toast";

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [successToast, setSuccessToast] = useState({ visible: false, message: "" });

  useEffect(() => {
    const mode = new URLSearchParams(location.search).get("mode");
    setIsLogin(mode !== "register");
  }, [location.search]);

  const switchMode = (nextIsLogin) => {
    setIsLogin(nextIsLogin);
    setErrors({});
    navigate(nextIsLogin ? "/auth?mode=login" : "/auth?mode=register", { replace: true });
  };

  const updateField = (setter, field) => (e) => {
    setter(e.target.value);

    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }

  };

  const inputClassName = (field) =>
    `w-full rounded-2xl border px-4 py-3 text-slate-900 outline-none transition ${
      errors[field]
        ? "border-red-300 bg-red-50/70 placeholder:text-red-300 focus:ring-2 focus:ring-red-200"
        : "border-slate-200 bg-slate-50 focus:border-orange-300 focus:ring-2 focus:ring-orange-200"
    }`;

  const handleLogin = async () => {
    const clientErr = {};

    if (!email) clientErr.email = "Email là bắt buộc.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) clientErr.email = "Email không đúng định dạng.";

    if (!password) clientErr.password = "Mật khẩu là bắt buộc.";
    else if (password.length < 8) clientErr.password = "Mật khẩu phải có tối thiểu 8 ký tự.";
    else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) clientErr.password = "Mật khẩu phải bao gồm chữ và số.";

    if (Object.keys(clientErr).length) {
      setErrors(clientErr);
      return;
    }

    try {
      const res = await axiosClient.post("/login", { email, password });

      const token = res.data.token;
      const role = res.data?.user?.role;
      localStorage.setItem("token", token);
      setAuthToken(token);

      setErrors({});
      setSuccessToast({ visible: true, message: "Đăng nhập thành công" });

      if (typeof role === "string" && role.toLowerCase() === "admin") {
        setTimeout(() => navigate("/admin", { replace: true }), 700);
      } else {
        setTimeout(() => navigate("/", { replace: true }), 700);
      }
    } catch (err) {
      const status = err.response?.status;
      setErrors({});

      if (status === 401) {
        setErrors({ password: "Email hoặc mật khẩu không đúng." });
      } else if (status === 422 && err.response?.data?.errors) {
        const be = {};
        Object.entries(err.response.data.errors).forEach(([k, v]) => {
          be[k] = v.join(" ");
        });
        setErrors(be);
      } else {
        setErrors({ email: "Có lỗi xảy ra, vui lòng thử lại." });
      }
    }
  };

  const handleRegister = async () => {
    const clientErr = {};

    if (!name) clientErr.name = "Họ và tên là bắt buộc.";

    if (!email) clientErr.email = "Email là bắt buộc.";
    else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) clientErr.email = "Email không đúng định dạng.";

    if (!password) clientErr.password = "Mật khẩu là bắt buộc.";
    else if (password.length < 8) clientErr.password = "Mật khẩu phải có tối thiểu 8 ký tự.";
    else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) clientErr.password = "Mật khẩu phải bao gồm chữ và số.";

    if (password !== passwordConfirm) clientErr.passwordConfirm = "Mật khẩu xác nhận không khớp.";

    if (Object.keys(clientErr).length) {
      setErrors(clientErr);
      return;
    }

    try {
      const res = await axiosClient.post("/register", {
        name,
        email,
        password,
        password_confirmation: passwordConfirm,
      });

      const token = res.data.token;
      localStorage.setItem("token", token);
      setAuthToken(token);

      setErrors({});
      setSuccessToast({ visible: true, message: "Đăng ký thành công" });

      setTimeout(() => navigate("/"), 700);
    } catch (err) {
      const status = err.response?.status;
      setErrors({});

      if (status === 422 && err.response?.data?.errors) {
        const be = {};
        Object.entries(err.response.data.errors).forEach(([k, v]) => {
          be[k] = v.join(" ");
        });
        setErrors(be);
      } else {
        setErrors({ email: "Đăng ký thất bại." });
      }
    }
  };

  const authTitle = isLogin ? "Đăng Nhập" : "Tạo Tài Khoản";
  const authDesc = isLogin
    ? "Nhập email và mật khẩu để tiếp tục."
    : "Điền thông tin để bắt đầu sử dụng VèoFood.";

  return (
    <div className="min-h-screen bg-[#FDF7F2] px-4 py-6 md:px-6 md:py-8 flex items-center justify-center">
      <div className="grid min-h-[640px] w-full max-w-6xl overflow-hidden rounded-[36px] bg-white shadow-[0_25px_80px_rgba(148,102,60,0.18)] md:grid-cols-[1.08fr_0.92fr]">
        <section className="flex items-center justify-center px-6 py-10 sm:px-10 md:px-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{authTitle}</h1>
              <p className="mt-3 text-sm leading-6 text-slate-500">{authDesc}</p>
            </div>

            <div className="mb-6 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
              <button
                onClick={() => switchMode(true)}
                className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  isLogin ? "bg-white text-orange-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Đăng nhập
              </button>
              <button
                onClick={() => switchMode(false)}
                className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  !isLogin ? "bg-white text-orange-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Đăng ký
              </button>
            </div>

            <div className="relative w-full overflow-hidden">
              <div
                className="flex"
                style={{
                  width: "200%",
                  transform: isLogin ? "translateX(0%)" : "translateX(-50%)",
                  transition: "transform 320ms ease-in-out",
                  willChange: "transform",
                }}
              >
                {/* Login panel */}
                <div className="w-1/2 pr-4" style={{ flex: "0 0 50%", pointerEvents: isLogin ? "auto" : "none" }} aria-hidden={!isLogin}>
                  <div className="space-y-4">
                    <div>
                      <input
                        value={email}
                        onChange={updateField(setEmail, "email")}
                        type="email"
                        placeholder="Email"
                        className={inputClassName("email")}
                      />
                      {errors.email && <div className="text-sm text-red-500">{errors.email}</div>}
                    </div>

                    <div>
                      <input
                        value={password}
                        onChange={updateField(setPassword, "password")}
                        type="password"
                        placeholder="Mật khẩu"
                        className={inputClassName("password")}
                      />
                      {errors.password && <div className="text-sm text-red-500">{errors.password}</div>}
                    </div>

                    <button
                      onClick={handleLogin}
                      className="w-full rounded-2xl bg-orange-500 px-4 py-3 font-semibold text-white transition hover:bg-orange-600"
                    >
                      ĐĂNG NHẬP
                    </button>
                  </div>
                </div>

                {/* Register panel */}
                <div className="w-1/2 pl-4" style={{ flex: "0 0 50%", pointerEvents: isLogin ? "none" : "auto" }} aria-hidden={isLogin}>
                  <div className="space-y-4">
                    <div>
                      <input
                        value={name}
                        onChange={updateField(setName, "name")}
                        type="text"
                        placeholder="Họ và tên"
                        className={inputClassName("name")}
                      />
                      {errors.name && <div className="text-sm text-red-500">{errors.name}</div>}
                    </div>

                    <div>
                      <input
                        value={email}
                        onChange={updateField(setEmail, "email")}
                        type="email"
                        placeholder="Email"
                        className={inputClassName("email")}
                      />
                      {errors.email && <div className="text-sm text-red-500">{errors.email}</div>}
                    </div>

                    <div>
                      <input
                        value={password}
                        onChange={updateField(setPassword, "password")}
                        type="password"
                        placeholder="Mật khẩu"
                        className={inputClassName("password")}
                      />
                      {errors.password && <div className="text-sm text-red-500">{errors.password}</div>}
                    </div>

                    <div>
                      <input
                        value={passwordConfirm}
                        onChange={updateField(setPasswordConfirm, "passwordConfirm")}
                        type="password"
                        placeholder="Xác nhận mật khẩu"
                        className={inputClassName("passwordConfirm")}
                      />
                      {errors.passwordConfirm && <div className="text-sm text-red-500">{errors.passwordConfirm}</div>}
                    </div>

                    <button
                      onClick={handleRegister}
                      className="w-full rounded-2xl bg-orange-500 px-4 py-3 font-semibold text-white transition hover:bg-orange-600"
                    >
                      ĐĂNG KÝ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="relative flex min-h-[280px] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.22),_transparent_30%),linear-gradient(135deg,#ff7a00_0%,#f05a00_45%,#c94700_100%)] px-8 py-12 text-white sm:px-10 md:px-12">
          <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.08),transparent)]" />
          <div className="absolute -left-16 top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -right-12 bottom-8 h-52 w-52 rounded-full bg-black/10 blur-3xl" />

          <div className="relative z-10 max-w-md text-center md:text-left">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-100/90">Welcome</p>
            <h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
              {isLogin ? "Chào bạn mới!" : "Mừng trở lại!"}
            </h2>
            <p className="mt-5 text-base leading-7 text-orange-50/90">
              {isLogin
                ? "Tạo tài khoản để đặt món nhanh hơn, theo dõi đơn hàng và nhận ưu đãi mới nhất từ VèoFood."
                : "Đăng nhập để tiếp tục đặt món, quản lý tài khoản và xem lại lịch sử đơn hàng của bạn."}
            </p>

            <button
              onClick={() => switchMode(!isLogin)}
              className="mt-8 inline-flex rounded-full border border-white/70 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-orange-600"
            >
              {isLogin ? "TẠO TÀI KHOẢN" : "ĐĂNG NHẬP NGAY"}
            </button>
          </div>
        </aside>
      </div>
      <Toast
        visible={successToast.visible}
        message={successToast.message}
        type="success"
        onClose={() => setSuccessToast({ visible: false, message: "" })}
        duration={2200}
      />
    </div>
  );
}
