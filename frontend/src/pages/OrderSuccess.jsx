import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axiosClient, { setAuthToken } from '../api/axiosClient';
import MainHeader from '../components/MainHeader';
import MainFooter from '../components/MainFooter';

const formatMoney = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const statusLabel = (status) => {
  const key = String(status || '').toLowerCase();
  if (key === 'pending') return 'Chờ thanh toán';
  if (key === 'paid' || key === 'shipping') return 'Đang giao hàng';
  if (key === 'completed') return 'Đã giao hàng';
  if (key === 'cancelled') return 'Đã hủy';
  return status || 'Không xác định';
};

const parsePaymentMethodFromNote = (note, fallback = 'cash') => {
  const raw = String(note || '');
  const match = raw.match(/thanh\s*toan\s*:\s*([a-zA-Z0-9_]+)/i);
  if (!match) return fallback;
  return String(match[1]).toLowerCase();
};

const paymentMethodLabel = (method) => {
  if (method === 'qr_transfer') return 'Chuyển khoản QR (mock)';
  return 'Tiền mặt khi nhận hàng';
};

const formatSeconds = (seconds) => {
  const safe = Math.max(0, Number(seconds) || 0);
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export default function OrderSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const [order, setOrder] = useState(location.state?.order || null);
  const [paymentMethod, setPaymentMethod] = useState(
    String(location.state?.paymentMethod || '').toLowerCase()
  );
  const [loading, setLoading] = useState(!location.state?.order);
  const [error, setError] = useState('');
  const [qrSession, setQrSession] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState('');
  const [nowTs, setNowTs] = useState(Date.now());

  const fetchOrder = useCallback(
    async (silent = false) => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Bạn cần đăng nhập để xem chi tiết đơn hàng.');
        if (!silent) setLoading(false);
        return;
      }

      if (!silent) setLoading(true);

      try {
        setAuthToken(token);
        const res = await axiosClient.get(`/orders/${id}`);
        const nextOrder = res.data?.data || null;
        setOrder(nextOrder);
        setPaymentMethod((prev) => {
          const fromNote = parsePaymentMethodFromNote(nextOrder?.note, 'cash');
          return (prev || fromNote || 'cash').toLowerCase();
        });
        setError('');
      } catch (err) {
        console.error(err);
        if (err?.response?.status === 401) {
          localStorage.removeItem('token');
          setAuthToken(null);
          navigate('/auth?mode=login');
          return;
        }
        setError('Không thể tải chi tiết đơn hàng.');
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [id, navigate]
  );

  const createQrSession = useCallback(
    async (forceNew = false) => {
      if (!order?.id) return;

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Bạn cần đăng nhập để tiếp tục thanh toán.');
        return;
      }

      try {
        setQrLoading(true);
        setQrError('');
        setAuthToken(token);

        const res = await axiosClient.post(`/orders/${order.id}/payment/qr-session`, {
          force_new: forceNew,
        });

        setQrSession(res.data?.data || null);
      } catch (err) {
        console.error(err);
        const msg = err?.response?.data?.message || 'Không thể tạo mã QR thanh toán lúc này.';
        setQrError(msg);
      } finally {
        setQrLoading(false);
      }
    },
    [order?.id]
  );

  useEffect(() => {
    if (order) {
      setLoading(false);
      if (!paymentMethod) {
        setPaymentMethod(parsePaymentMethodFromNote(order?.note, 'cash'));
      }
      return;
    }

    fetchOrder(false);
  }, [fetchOrder, order, paymentMethod]);

  const isQrTransfer = paymentMethod === 'qr_transfer';
  const isOrderPending = String(order?.status || '').toLowerCase() === 'pending';

  useEffect(() => {
    if (!order?.id || !isQrTransfer || !isOrderPending) return;
    if (qrSession || qrLoading) return;

    createQrSession(false);
  }, [order?.id, isQrTransfer, isOrderPending, qrSession, qrLoading, createQrSession]);

  useEffect(() => {
    if (!order?.id || !isQrTransfer || !isOrderPending) return;

    const timer = setInterval(() => {
      fetchOrder(true);
    }, 3000);

    return () => clearInterval(timer);
  }, [order?.id, isQrTransfer, isOrderPending, fetchOrder]);

  useEffect(() => {
    if (!isQrTransfer || !isOrderPending || !qrSession?.expires_at) return;

    const timer = setInterval(() => {
      setNowTs(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, [isQrTransfer, isOrderPending, qrSession?.expires_at]);

  const remainingSeconds = useMemo(() => {
    if (!qrSession?.expires_at) return 0;
    const expiresAt = new Date(qrSession.expires_at).getTime();
    if (!expiresAt) return 0;
    return Math.max(0, Math.floor((expiresAt - nowTs) / 1000));
  }, [qrSession?.expires_at, nowTs]);

  const isQrExpired = isOrderPending && isQrTransfer && remainingSeconds === 0;

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
          <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
            isOrderPending && isQrTransfer
              ? 'bg-amber-100 text-amber-700'
              : 'bg-green-100 text-green-700'
          }`}>
            {isOrderPending && isQrTransfer ? 'Chờ thanh toán' : 'Thành công'}
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

            <div className="rounded-2xl border border-gray-200 p-5 mb-8 bg-orange-50/40">
              <h2 className="text-xl font-bold mb-4">Thanh toán</h2>
              <p className="text-sm text-gray-600 mb-4">
                Phương thức: <span className="font-semibold text-gray-800">{paymentMethodLabel(paymentMethod)}</span>
              </p>

              {isQrTransfer && (
                <>
                  {String(order.status || '').toLowerCase() === 'paid' ? (
                    <div className="rounded-xl border border-green-200 bg-green-50 text-green-700 p-4 text-sm">
                      Thanh toán đã được xác nhận. Đơn hàng sẽ sớm được xử lý.
                    </div>
                  ) : qrLoading ? (
                    <div className="text-gray-600">Đang tạo mã QR thanh toán...</div>
                  ) : qrError ? (
                    <div className="space-y-3">
                      <div className="text-red-600 text-sm">{qrError}</div>
                      <button
                        onClick={() => createQrSession(true)}
                        className="px-4 py-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 text-sm"
                      >
                        Tạo lại mã QR
                      </button>
                    </div>
                  ) : qrSession ? (
                    <div className="grid md:grid-cols-2 gap-5 items-start">
                      <div className="rounded-xl bg-white border border-gray-200 p-4 text-center">
                        <img
                          src={qrSession.qr_image_url}
                          alt="QR thanh toán mock"
                          className="w-52 h-52 mx-auto object-contain"
                        />
                        <p className="text-sm text-gray-600 mt-3">
                          Quét QR bằng điện thoại để xác nhận thanh toán cho đơn hàng này.
                        </p>
                      </div>

                      <div className="rounded-xl bg-white border border-gray-200 p-4 space-y-3">
                        <div className="text-sm text-gray-600">
                          Số tiền cần chuyển:
                          <div className="text-xl font-bold text-orange-600 mt-1">{formatMoney(order.total_price)}</div>
                        </div>

                        <div className={`text-sm font-semibold ${isQrExpired ? 'text-red-600' : 'text-amber-600'}`}>
                          {isQrExpired
                            ? 'Mã QR đã hết hạn'
                            : `Mã QR hết hạn sau: ${formatSeconds(remainingSeconds)}`}
                        </div>

                        <p className="text-xs text-gray-500">
                          Hệ thống sẽ tự cập nhật trạng thái đơn khi mã QR được quét thành công.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-600">Đang chuẩn bị mã QR...</div>
                  )}
                </>
              )}
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
      <MainFooter />
    </div>
  );
}
