import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient, { setAuthToken } from '../api/axiosClient';
import Toast from '../components/Toast';

export default function Account() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/auth");
          return;
        }

        // ensure axios has Authorization header
        setAuthToken(token);

        const res = await axiosClient.get("/user");
        const user = res.data;

        setUserData({
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          address: user.address || ''
        });

      } catch (err) {
        localStorage.removeItem("token");
        navigate("/auth");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) await axiosClient.post('/logout');
      } catch (err) {
        console.error('Logout error', err);
      } finally {
        localStorage.removeItem("token");
        setAuthToken(null);
        navigate("/auth");
      }
    })();
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // Gửi chỉ các trường được phép sửa: name, phone, address
      const payload = {
        name: userData.name,
        phone: userData.phone,
        address: userData.address,
      };

      const res = await axiosClient.put('/user', payload);

      // Backend trả về đối tượng user trực tiếp
      const updated = res.data ?? {};

      setUserData(prev => ({
        ...prev,
        name: updated.name ?? prev.name,
        phone: updated.phone ?? prev.phone,
        address: updated.address ?? prev.address,
      }));

      setIsEditing(false);
      setToast({ visible: true, message: 'Cập nhật thành công', type: 'success' });
    } catch (err) {
      // Nếu backend trả lỗi validate 422, hiển thị thông tin
      if (err.response && err.response.status === 422) {
        const errors = err.response.data?.errors || {};
        const msgs = Object.values(errors).flat().join('\n');
        setToast({ visible: true, message: msgs || 'Lỗi xác thực dữ liệu', type: 'error' });
      } else {
        console.error('Update user error', err);
        setToast({ visible: true, message: 'Lỗi cập nhật!', type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-[#FDF7F2] min-h-screen">

      {/* HEADER */}
      <header className="flex items-center justify-between px-10 py-4 bg-white shadow-sm">

  {/* LOGO */}
  <div
    className="text-xl font-bold text-orange-500 cursor-pointer"
    onClick={() => navigate('/')}
  >
    🍴 VèoFood
  </div>

  {/* NAVBAR */}
  <nav className="flex gap-6 text-sm font-medium">

    <span
      onClick={() => navigate('/')}
      className="cursor-pointer hover:text-orange-500"
    >
      Trang Chủ
    </span>

    

    

    {/* 🔥 HIỂN THỊ KHI CÓ TOKEN */}
    <span
      onClick={() => navigate('/account')}
      className="text-orange-500 cursor-pointer"
    >
      Tài Khoản
    </span>

  </nav>

  {/* RIGHT SIDE */}
  <div className="flex items-center gap-3">

    {localStorage.getItem("token") ? (
      <button
        onClick={handleLogout}
        className="text-sm px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
      >
        Đăng xuất
      </button>
    ) : (
      <button
        onClick={() => navigate('/auth')}
        className="text-sm px-4 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition"
      >
        Đăng nhập
      </button>
    )}

  </div>

</header>

      {/* MAIN */}
      <main className="max-w-6xl mx-auto py-10 px-4 flex gap-8">

        {/* SIDEBAR */}
        <aside className="w-1/4 space-y-6">

          {/* USER CARD */}
          <div className="bg-white p-6 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center text-xl">
              👤
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{userData.name}</h3>
              <p className="text-xs text-gray-500">{userData.email}</p>
            </div>
          </div>

          {/* MENU */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden text-sm">

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left px-6 py-4 transition ${
                activeTab === 'profile'
                  ? 'bg-orange-50 text-orange-500 border-r-4 border-orange-500'
                  : 'hover:bg-gray-50 text-gray-600'
              }`}
            >
              Thông tin cá nhân
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full text-left px-6 py-4 transition ${
                activeTab === 'orders'
                  ? 'bg-orange-50 text-orange-500 border-r-4 border-orange-500'
                  : 'hover:bg-gray-50 text-gray-600'
              }`}
            >
              Đơn hàng của tôi
            </button>

            {/* LOGOUT ở đây */}
            <button
              onClick={handleLogout}
              className="w-full text-left px-6 py-4 text-red-500 hover:bg-red-50 transition"
            >
              Đăng xuất
            </button>

          </div>
        </aside>

        {/* CONTENT */}
        <section className="w-3/4 bg-white p-8 rounded-2xl shadow-sm">

          {activeTab === 'profile' ? (
            <>
              {/* HEADER */}
              <div className="flex justify-between items-center mb-8 border-b pb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Thông tin cá nhân
                </h2>

                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-orange-500 font-medium hover:underline"
                  >
                    Sửa
                  </button>
                ) : (
                  <button
                    onClick={handleSave}
                    className="bg-orange-500 text-white px-5 py-2 rounded-full hover:bg-orange-600 transition"
                  >
                    Lưu
                  </button>
                )}
              </div>

              {/* FORM */}
              <div className="space-y-6">

                <div>
                  <label className="text-sm text-gray-500">Họ và tên</label>
                  <input
                    value={userData.name}
                    disabled={!isEditing}
                    onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                    className="w-full mt-1 px-4 py-2 rounded-lg border bg-gray-50 focus:outline-none focus:border-orange-400"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-500">Email</label>
                  <input
                    value={userData.email}
                    disabled
                    className="w-full mt-1 px-4 py-2 rounded-lg border bg-gray-100"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-500">Số điện thoại</label>
                  <input
                    value={userData.phone}
                    disabled={!isEditing}
                    onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                    className="w-full mt-1 px-4 py-2 rounded-lg border bg-gray-50"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-500">Địa chỉ</label>
                  <textarea
                    value={userData.address}
                    disabled={!isEditing}
                    onChange={(e) => setUserData({ ...userData, address: e.target.value })}
                    className="w-full mt-1 px-4 py-2 rounded-lg border bg-gray-50"
                  />
                </div>

              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🛒</div>
              <h3 className="text-lg font-semibold text-gray-700">
                Bạn chưa có đơn hàng nào
              </h3>
              <button
                onClick={() => navigate('/menu')}
                className="mt-4 text-orange-500 font-bold hover:underline"
              >
                Đặt món ngay
              </button>
            </div>
          )}

        </section>

      </main>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, visible: false })}
        duration={3000}
      />
    </div>
  );
}