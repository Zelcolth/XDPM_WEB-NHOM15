import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axiosClient, { setAuthToken } from '../api/axiosClient';
import MainHeader from '../components/MainHeader';

const formatMoney = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const statusLabel = (status) => {
  const key = String(status || '').toLowerCase();
  if (key === 'pending' || key === 'paid' || key === 'shipping') return 'Đang giao hàng';
  if (key === 'completed') return 'Đã giao hàng';
  if (key === 'cancelled') return 'Đã hủy';
  return status || 'Không xác định';
};

export default function OrderSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadOrder = async () => {
      if (order) return;

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Bạn cần đăng nhập để xem chi tiết đơn hàng.');
        setLoading(false);
        return;
      }

      try {
        setAuthToken(token);
        const res = await axiosClient.get(`/orders/${id}`);
        if (!mounted) return;
        setOrder(res.data?.data || null);
      } catch (err) {
        console.error(err);
        if (mounted) setError('Không thể tải chi tiết đơn hàng.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadOrder();
    return () => {
      mounted = false;
    };
  }, [id, order]);

  const items = order?.items || [];

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + Number(item?.price || 0) * Number(item?.quantity || 0), 0),
    [items]
  );

  return (
    <div className="bg-[#FDF7F2] min-h-screen font-sans text-gray-800">
      <MainHeader active="account" />
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm p-6 md:p-10 mt-10 mb-10">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Đặt hàng thành công</h1>
            <p className="text-gray-500 mt-2">Cảm ơn bạn đã đặt món tại VèoFood.</p>
          </div>
          <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
            Thành công
          </div>
        </div>

        {loading ? (
          <div className="text-gray-500">Đang tải chi tiết đơn hàng...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : !order ? (
          <div className="text-gray-500">Không tìm thấy đơn hàng.</div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="rounded-2xl border border-gray-200 p-4">
                <div className="text-sm text-gray-500">Mã đơn</div>
                <div className="font-bold text-lg">#{order.id}</div>
              </div>
              <div className="rounded-2xl border border-gray-200 p-4">
                <div className="text-sm text-gray-500">Trạng thái</div>
                <div className="font-bold text-lg">{statusLabel(order.status)}</div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 p-5 mb-8">
              <h2 className="text-xl font-bold mb-4">Thông tin giao hàng</h2>
              <div className="space-y-2 text-sm md:text-base">
                <p><span className="text-gray-500">Số điện thoại:</span> {order.phone || '--'}</p>
                <p><span className="text-gray-500">Địa chỉ:</span> {order.address || '--'}</p>
                {order.note && <p><span className="text-gray-500">Ghi chú:</span> {order.note}</p>}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 overflow-hidden mb-8">
              <div className="px-5 py-4 border-b bg-gray-50 font-bold">Chi tiết món ăn</div>
              <div className="divide-y">
                {items.length === 0 ? (
                  <div className="px-5 py-4 text-gray-500">Đơn hàng không có sản phẩm.</div>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="px-5 py-4 flex items-center justify-between gap-4">
                      <div>
                        <div className="font-semibold">{item?.product?.name || `Sản phẩm #${item.product_id}`}</div>
                        <div className="text-sm text-gray-500">{item.quantity} x {formatMoney(item.price)}</div>
                      </div>
                      <div className="font-bold">{formatMoney(Number(item.price) * Number(item.quantity))}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 p-5 mb-8">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Tạm tính</span>
                <span className="font-medium">{formatMoney(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Phí giao hàng</span>
                <span className="font-medium text-green-600">Miễn phí</span>
              </div>
              <div className="flex items-center justify-between text-lg font-bold pt-2 border-t mt-3">
                <span>Tổng thanh toán</span>
                <span className="text-orange-600">{formatMoney(order.total_price ?? subtotal)}</span>
              </div>
            </div>
          </>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto px-6 py-3 rounded-full border border-gray-300 hover:bg-gray-50"
          >
            Về trang chủ
          </button>
          <button
            onClick={() => navigate('/account')}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-orange-500 text-white hover:bg-orange-600"
          >
            Xem đơn hàng của tôi
          </button>
        </div>
      </div>
    </div>
  );
}
