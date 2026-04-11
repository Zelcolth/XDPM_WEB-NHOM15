const statusMap = {
  pending: { classes: 'bg-amber-100 text-amber-700', label: 'Chờ xử lý' },
  shipping: { classes: 'bg-blue-100 text-blue-700', label: 'Đang giao hàng' },
  completed: { classes: 'bg-emerald-100 text-emerald-700', label: 'Hoàn thành' },
  cancelled: { classes: 'bg-rose-100 text-rose-700', label: 'Đã hủy' },
  paid: { classes: 'bg-emerald-100 text-emerald-700', label: 'Đã thanh toán' },
  unpaid: { classes: 'bg-slate-100 text-slate-700', label: 'Chưa thanh toán' },
};

export default function OrderStatusBadge({ status }) {
  const normalized = (status || 'pending').toLowerCase();
  const config = statusMap[normalized] || { classes: 'bg-slate-100 text-slate-700', label: status || '--' };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${config.classes}`}>
      {config.label}
    </span>
  );
}
