import { useEffect, useState } from 'react';
import OrderStatusBadge from '../components/OrderStatusBadge';
import { adminApi, ApiNotAvailableError } from '../services/adminApi';
import { formatCurrency, formatDateTime } from '../utils/formatters';

const statusOptions = ['pending', 'shipping', 'completed', 'cancelled'];

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
      setOrders(data);
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
        prev.map((order) => (order.id === orderId ? { ...order, status } : order))
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
                  <th className="text-left px-4 py-3">Ngày tạo</th>
                  <th className="text-left px-4 py-3">Duyệt nhanh</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-800">#{order.id}</td>
                    <td className="px-4 py-3">{order?.user?.name || `User #${order.user_id || '--'}`}</td>
                    <td className="px-4 py-3">{formatCurrency(order.total_price)}</td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3">{formatDateTime(order.created_at)}</td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status || 'pending'}
                        disabled={updatingId === order.id}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
