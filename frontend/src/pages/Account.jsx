import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient, { setAuthToken } from '../api/axiosClient';
import Toast from '../components/Toast';
import MainHeader from '../components/MainHeader';
import MainFooter from '../components/MainFooter';

const formatMoney = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatDateTime = (dateString) => {
  if (!dateString) return '--';
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return '--';
  return d.toLocaleString('vi-VN');
};

const mapOrderStatus = (status) => {
  const key = String(status || '').toLowerCase();
  if (key === 'pending' || key === 'paid' || key === 'shipping') return 'Đang giao hàng';
  if (key === 'completed') return 'Đã giao hàng';
  if (key === 'cancelled') return 'Đã hủy';
  return status || 'Không xác định';
};

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
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [ordersFetched, setOrdersFetched] = useState(false);

  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      setOrdersError('');
      const res = await axiosClient.get('/orders');
      const data = res.data?.data ?? res.data ?? [];
      setOrders(Array.isArray(data) ? data : []);
      setOrdersFetched(true);
    } catch (err) {
      if (err?.response?.status === 401) {
        localStorage.removeItem('token');
        setAuthToken(null);
        navigate('/auth');
        return;
      }

      console.error('Fetch orders error', err);
      setOrdersError('Không thể tải lịch sử đơn hàng.');
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setAuthToken(null);
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

        await fetchOrders();

      } catch (err) {
        if (err?.response?.status === 401) {
          localStorage.removeItem("token");
          setAuthToken(null);
          navigate("/auth");
          return;
        }

        console.error('Fetch user error', err);
        setToast({
          visible: true,
          message: 'Không thể tải thông tin tài khoản. Vui lòng thử lại sau.',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  useEffect(() => {
    if (activeTab === 'orders' && !ordersFetched && !ordersLoading && !ordersError) {
      fetchOrders();
    }
  }, [activeTab, ordersFetched, ordersLoading, ordersError]);

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

      <MainHeader active="account" />

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
            <>
              <div className="flex justify-between items-center mb-8 border-b pb-4">
                <h2 className="text-xl font-bold text-gray-800">Đơn hàng của tôi</h2>
                <button
                  onClick={fetchOrders}
                  className="text-orange-500 font-medium hover:underline"
                >
                  Làm mới
                </button>
              </div>

              {ordersLoading ? (
                <div className="text-gray-500 py-10">Đang tải lịch sử đơn hàng...</div>
              ) : ordersError ? (
                <div className="text-red-500 py-10">{ordersError}</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">🛒</div>
                  <h3 className="text-lg font-semibold text-gray-700">Bạn chưa có đơn hàng nào</h3>
                  <button
                    onClick={() => navigate('/order')}
                    className="mt-4 text-orange-500 font-bold hover:underline"
                  >
                    Đặt món ngay
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders
                    .slice()
                    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
                    .map((order) => {
                      const itemCount = (order?.items || []).reduce(
                        (sum, item) => sum + Number(item?.quantity || 0),
                        0
                      );

                      return (
                        <div key={order.id} className="border rounded-xl p-4 bg-gray-50">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <div>
                              <div className="font-bold text-gray-800">Đơn #{order.id}</div>
                              <div className="text-sm text-gray-500 mt-1">
                                {formatDateTime(order.created_at)} · {itemCount} món
                              </div>
                            </div>
                            <div className="text-left md:text-right">
                              <div className="font-semibold text-orange-600">
                                {formatMoney(order.total_price)}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {mapOrderStatus(order.status)}
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {(order?.items || []).slice(0, 3).map((item) => (
                              <span
                                key={item.id}
                                className="text-xs bg-white border rounded-full px-3 py-1 text-gray-600"
                              >
                                {item?.product?.name || `Món #${item.product_id}`} x {item.quantity}
                              </span>
                            ))}
                          </div>

                          <button
                            onClick={() => navigate(`/order-success/${order.id}`, { state: { order } })}
                            className="mt-4 text-sm font-semibold text-orange-500 hover:underline"
                          >
                            Xem chi tiết đơn hàng
                          </button>
                        </div>
                      );
                    })}
                </div>
              )}
            </>
          )}

        </section>

      </main>
      <MainFooter />
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
