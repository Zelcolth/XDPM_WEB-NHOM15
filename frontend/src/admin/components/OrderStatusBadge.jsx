const statusMap = {
  pending: 'bg-amber-100 text-amber-700',
  shipping: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-rose-100 text-rose-700',
};

export default function OrderStatusBadge({ status }) {
  const normalized = (status || 'pending').toLowerCase();
  const classes = statusMap[normalized] || 'bg-slate-100 text-slate-700';

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${classes}`}>
      {normalized}
    </span>
  );
}
