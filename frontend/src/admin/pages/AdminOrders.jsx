import { useEffect, useState } from 'react';
import OrderStatusBadge from '../components/OrderStatusBadge';
import { adminApi, ApiNotAvailableError } from '../services/adminApi';
import { formatCurrency, formatDateTime } from '../utils/formatters';

const normalizeStatus = (status) => {
  const normalized = String(status || 'pending').toLowerCase();

  if (normalized === 'delivered') return 'completed';
  if (normalized === 'paid' || normalized === 'unpaid') return 'pending';

  if (['pending', 'shipping', 'completed', 'cancelled'].includes(normalized)) {
    return normalized;
  }

  return 'pending';
};

const getCustomerName = (order) => {
  const value =
    order?.user?.name ||
    order?.customer_name ||
    order?.full_name ||
    order?.receiver_name ||
    order?.name;

  return value ? String(value).trim() : `Khách hàng #${order?.user_id || '--'}`;
};

const getPaymentStatus = (order) => {
  const explicit = String(order?.payment_status ?? '').toLowerCase();
  if (['paid', 'da_thanh_toan', 'completed', 'success', '1', 'true'].includes(explicit)) {
    return 'paid';
  }
  if (['unpaid', 'chua_thanh_toan', 'pending', 'failed', '0', 'false'].includes(explicit)) {
    return 'unpaid';
  }

  const status = String(order?.status || '').toLowerCase();
  if (status === 'paid') return 'paid';
  if (status === 'unpaid') return 'unpaid';
  if (status === 'completed' || status === 'delivered') return 'paid';

  return 'unpaid';
};

const ActionButton = ({ children, variant = 'neutral', ...props }) => {
  const variantMap = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600',
    danger: 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200',
    neutral: 'bg-white text-slate-700 hover:bg-slate-50 border-slate-300',
  };

  return (
    <button
      type="button"
      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${
        variantMap[variant] || variantMap.neutral
      }`}
      {...props}
    >
      {children}
    </button>
  );
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [notAvailable, setNotAvailable] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const loadOrders = async () => {
    setLoading(true);
    setNotice('');
    setNotAvailable(false);

    try {
      const data = await adminApi.getOrders();
      setOrders(data.map((order) => ({ ...order, status: normalizeStatus(order?.status) })));
    } catch (error) {
      if (error instanceof ApiNotAvailableError) {
        setNotAvailable(true);
        setNotice(error.message);
      } else {
        setNotice('Không thể tải danh sách đơn hàng.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId, status) => {
    setUpdatingId(orderId);
    setNotice('');
    try {
      await adminApi.updateOrderStatus(orderId, status);
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? { ...order, status: normalizeStatus(status) } : order))
      );
    } catch (error) {
      if (error instanceof ApiNotAvailableError) {
        setNotAvailable(true);
        setNotice(error.message);
      } else {
        setNotice('Cập nhật trạng thái đơn hàng thất bại.');
      }
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Quản lý đơn hàng</h2>
        <p className="text-slate-500 mt-1">Duyệt và cập nhật trạng thái đơn hàng của khách.</p>
      </div>

      {notice ? (
        <div
          className={`rounded-xl p-3 text-sm border ${
            notAvailable
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {notice}
        </div>
      ) : null}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-5 text-slate-600">Đang tải đơn hàng...</div>
        ) : notAvailable ? (
          <div className="p-5 text-slate-700">
            API đơn hàng chưa sẵn sàng từ backend. Giao diện đã chuẩn bị sẵn để tích hợp ngay khi có
            endpoint.
          </div>
        ) : orders.length === 0 ? (
          <div className="p-5 text-slate-600">Hiện chưa có đơn hàng nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-4 py-3">Mã đơn</th>
                  <th className="text-left px-4 py-3">Khách hàng</th>
                  <th className="text-left px-4 py-3">Tổng tiền</th>
                  <th className="text-left px-4 py-3">Trạng thái</th>
                  <th className="text-left px-4 py-3">Trạng thái thanh toán</th>
                  <th className="text-left px-4 py-3">Ngày tạo</th>
                  <th className="text-left px-4 py-3">Thao tác nhanh</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const status = normalizeStatus(order?.status);

                  return (
                  <tr key={order.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-800">#{order.id}</td>
                    <td className="px-4 py-3">{getCustomerName(order)}</td>
                    <td className="px-4 py-3">{formatCurrency(order.total_price)}</td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={status} />
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={getPaymentStatus(order)} />
                    </td>
                    <td className="px-4 py-3">{formatDateTime(order.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <ActionButton
                          variant="primary"
                          disabled={updatingId === order.id || status === 'shipping'}
                          onClick={() => handleStatusChange(order.id, 'shipping')}
                        >
                          Đang giao
                        </ActionButton>

                        <ActionButton
                          variant="success"
                          disabled={updatingId === order.id || status === 'completed'}
                          onClick={() => handleStatusChange(order.id, 'completed')}
                        >
                          Hoàn thành
                        </ActionButton>

                        <ActionButton
                          variant="danger"
                          disabled={updatingId === order.id || status === 'cancelled'}
                          onClick={() => handleStatusChange(order.id, 'cancelled')}
                        >
                          Hủy đơn
                        </ActionButton>
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
