import React, { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient, { setAuthToken } from '../api/axiosClient';
import phoImg from '../assets/Phol.png';
import banhmiImg from '../assets/banhmi.png';
import sushiImg from '../assets/sushi.png';
import Toast from '../components/Toast';
import MainHeader from '../components/MainHeader';
import { CART_STORAGE_KEY, clearCart, getCartItems } from '../utils/cartStorage';

export default function Checkout() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
  });
  const [cartItems, setCartItems] = useState(() => getCartItems());
  const [paymentMethod, setPaymentMethod] = useState('momo');
  const [saveCustomerInfo, setSaveCustomerInfo] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === CART_STORAGE_KEY) {
        setCartItems(getCartItems());
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    let mounted = true;
    const token = localStorage.getItem('token');
    if (!token) return;

    const loadProfile = async () => {
      try {
        setAuthToken(token);
        const res = await axiosClient.get('/user');
        const user = res.data || {};
        if (!mounted) return;

        setFormData((prev) => ({
          ...prev,
          fullName: user.name || prev.fullName,
          phone: user.phone || prev.phone,
          email: user.email || prev.email,
          address: user.address || prev.address,
        }));
      } catch (err) {
        console.error(err);
      }
    };

    loadProfile();
    return () => {
      mounted = false;
    };
  }, []);

  const formatMoney = (value) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(Number(value || 0));

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = 2.50;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const fallbackImages = [phoImg, banhmiImg, sushiImg];
  const normalizeCartImage = (item, idx) => item?.img || fallbackImages[idx % fallbackImages.length];

  const handlePlaceOrder = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setToast({ visible: true, message: 'Vui lòng đăng nhập để đặt hàng', type: 'error' });
      navigate('/auth?mode=login');
      return;
    }

    if (cartItems.length === 0) {
      setToast({ visible: true, message: 'Giỏ hàng đang trống', type: 'error' });
      return;
    }

    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.address.trim()) {
      setToast({ visible: true, message: 'Vui lòng nhập đầy đủ thông tin nhận hàng', type: 'error' });
      return;
    }

    const payload = {
      address: formData.address.trim(),
      phone: formData.phone.trim(),
      note: `Nguoi nhan: ${formData.fullName.trim()}${formData.email ? ` | Email: ${formData.email.trim()}` : ''} | Thanh toan: ${paymentMethod}`,
      items: cartItems.map((item) => ({
        product_id: Number(item.product_id || item.id),
        quantity: Number(item.qty || 1),
      })),
    };

    try {
      setPlacingOrder(true);
      setAuthToken(token);

      if (saveCustomerInfo) {
        try {
          await axiosClient.put('/user', {
            name: formData.fullName.trim(),
            phone: formData.phone.trim(),
            address: formData.address.trim(),
          });
        } catch (profileErr) {
          // Keep checkout flow running even when profile update fails.
          console.error('Save customer info failed', profileErr);
        }
      }

      const orderRes = await axiosClient.post('/orders', payload);
      const order = orderRes.data?.data;

      if (paymentMethod === 'momo' && order?.id) {
        try {
          await axiosClient.post(`/orders/${order.id}/pay`);
        } catch (payErr) {
          console.error(payErr);
        }
      }

      clearCart();
      setCartItems([]);
      if (order?.id) {
        navigate(`/order-success/${order.id}`, {
          state: {
            order,
            paymentMethod,
          },
        });
      } else {
        setToast({ visible: true, message: 'Đặt hàng thành công', type: 'success' });
        navigate('/account');
      }
    } catch (err) {
      const serverMessage = err.response?.data?.message;
      if (err.response?.status === 422) {
        setToast({ visible: true, message: serverMessage || 'Thông tin đơn hàng chưa hợp lệ', type: 'error' });
      } else {
        setToast({ visible: true, message: serverMessage || 'Không thể đặt đơn lúc này', type: 'error' });
      }
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="bg-[#FDF7F2] min-h-screen font-sans text-gray-800">
      <MainHeader active="checkout" />

      <main className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* Form Thanh Toán */}
        <div className="lg:w-2/3">
          <h1 className="text-3xl font-bold mb-2">Thanh toán</h1>
          <p className="text-gray-500 mb-8">Kiểm tra lại đơn hàng của bạn trước khi đặt.</p>

          {/* Thông tin nhận hàng */}
          <div className="bg-white rounded-3xl p-8 shadow-sm mb-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <span className="mr-3">📦</span> Thông tin nhận hàng
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-bold mb-2">Họ và tên</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Nhập họ và tên"
                  className="w-full px-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Số điện thoại</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Nhập số điện thoại"
                  className="w-full px-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

 

            <div className="mb-4">
              <label className="block text-sm font-bold mb-2">Địa chỉ giao hàng</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Địa chỉ giao hàng"
                className="w-full px-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:border-orange-500"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-600 select-none">
              <input
                type="checkbox"
                checked={saveCustomerInfo}
                onChange={(e) => setSaveCustomerInfo(e.target.checked)}
                className="w-4 h-4 accent-orange-500"
              />
              Lưu thông tin khách hàng cho lần đặt sau
            </label>


          </div>

          {/* Chi tiết đơn hàng */}
          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <span className="mr-3">❌</span> Chi tiết đơn hàng
            </h2>

            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between pb-4 border-b">
                  <div className="flex items-center gap-4">
                    <img src={normalizeCartImage(item, item.id)} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                    <div>
                      <h4 className="font-bold mb-1">{item.name}</h4>
                      <p className="text-sm text-gray-500">{item.note || 'Yêu cầu đặc biệt sẽ được ghi chú khi xác nhận đơn'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatMoney(item.price * item.qty)}</p>
                    <p className="text-sm text-gray-500">{item.qty} x {formatMoney(item.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tóm tắt đơn hàng */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-3xl p-6 shadow-sm sticky top-6">
            <h2 className="text-xl font-bold mb-6">Tóm tắt</h2>

            <div className="space-y-4 mb-6 pb-6 border-b border-dashed">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tạm tính</span>
                <span className="font-bold">{formatMoney(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Phí giao hàng</span>
                <span className="font-bold">{formatMoney(shipping)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Thuế (VAT)</span>
                <span className="font-bold">{formatMoney(tax)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6 pb-6 border-b border-dashed">
              <span className="font-bold text-lg">Tổng số tiền</span>
              <span className="text-2xl font-bold text-orange-500">{formatMoney(total)}</span>
            </div>

            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Bằng cách nhấp "Đặt hàng", bạn đại diện đồng ý với {' '}
              <a href="#" className="text-orange-500 hover:underline">điều khoản dịch vụ</a> của {' '}
              <a href="#" className="text-orange-500 hover:underline">The Kinetic Gourmet</a>
            </p>

            <button
              disabled={placingOrder || cartItems.length === 0}
              onClick={handlePlaceOrder}
              className="w-full bg-orange-500 text-white py-4 rounded-full font-bold hover:bg-orange-600 transition mb-4 disabled:opacity-70"
            >
              {placingOrder ? 'ĐANG XỬ LÝ...' : 'ĐẶT HÀNG NGAY →'}
            </button>

            {/* Phương thức thanh toán */}
            <div className="mt-8 pt-6 border-t">
              <h3 className="font-bold mb-4 flex items-center">
                <span className="mr-2">💳</span> Phương thức thanh toán
              </h3>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('momo')}
                  className={`w-full flex items-center p-3 rounded-full ${paymentMethod === 'momo' ? 'border-2 border-orange-500 bg-orange-50' : 'border border-gray-200'}`}
                >
                  <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold mr-3">
                    V
                  </div>
                  <span className="font-bold">Vi MoMo</span>
                  <span className="text-xs text-gray-500 ml-2">Ví điện tử được sử dụng phổ biến</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`w-full flex items-center p-3 rounded-full ${paymentMethod === 'cash' ? 'border-2 border-orange-500 bg-orange-50' : 'border border-gray-200'}`}
                >
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                  <span className="font-bold">Tiền mặt</span>
                  <span className="text-xs text-gray-500 ml-2">Thanh toán khi nhận hàng</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white mt-12 py-12 px-4 md:px-10">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold mb-4">VèoFood</h3>
            <p className="text-sm text-gray-500">Nền tảng giao thực phẩm cao cấp tại Việt Nam.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Công ty</h4>
            <ul className="text-sm text-gray-500 space-y-2">
              <li><a href="#" className="hover:text-orange-500">Về chúng tôi</a></li>
              <li><a href="#" className="hover:text-orange-500">Tuyển dụng</a></li>
              <li><a href="#" className="hover:text-orange-500">Báo chí</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Hỗ trợ</h4>
            <ul className="text-sm text-gray-500 space-y-2">
              <li><a href="#" className="hover:text-orange-500">Trung tâm trợ giúp</a></li>
              <li><a href="#" className="hover:text-orange-500">Liên hệ hỗ trợ</a></li>
              <li><a href="#" className="hover:text-orange-500">Bảo mật</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Social</h4>
            <div className="flex space-x-4 text-orange-500">
              <a href="#" className="hover:text-orange-600">Instagram</a>
              <a href="#" className="hover:text-orange-600">Facebook</a>
            </div>
          </div>
        </div>
        <div className="text-center text-xs text-gray-500 mt-8 pt-8 border-t">
          © 2024 VèoFood. Tất cả quyền được bảo lưu.
        </div>
      </footer>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
        duration={3000}
      />
    </div>
  );
}
