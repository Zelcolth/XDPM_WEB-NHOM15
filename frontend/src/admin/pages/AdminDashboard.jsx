import { useEffect, useState } from 'react';
import { adminApi, ApiNotAvailableError } from '../services/adminApi';

const Card = ({ title, value, hint }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
    <p className="text-sm text-slate-500">{title}</p>
    <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
    {hint ? <p className="text-xs text-slate-400 mt-2">{hint}</p> : null}
  </div>
);

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    categories: 0,
    products: 0,
    pendingOrders: 0,
  });
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadSummary = async () => {
      setLoading(true);
      setNotice('');

      const results = await Promise.allSettled([
        adminApi.getCategories(),
        adminApi.getProducts(),
        adminApi.getOrders(),
      ]);

      if (!mounted) return;

      const [catResult, productResult, orderResult] = results;
      const categories = catResult.status === 'fulfilled' ? catResult.value.length : 0;
      const products = productResult.status === 'fulfilled' ? productResult.value.length : 0;

      let pendingOrders = 0;
      if (orderResult.status === 'fulfilled') {
        pendingOrders = orderResult.value.filter(
          (order) => (order?.status || '').toLowerCase() === 'pending'
        ).length;
      }

      setSummary({ categories, products, pendingOrders });

      if (orderResult.status === 'rejected') {
        const reason = orderResult.reason;
        if (reason instanceof ApiNotAvailableError) {
          setNotice(reason.message);
        }
      }

      setLoading(false);
    };

    loadSummary();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Tổng quan quản trị</h2>
        <p className="text-slate-500 mt-1">Theo dõi nhanh dữ liệu và trạng thái API.</p>
      </div>

      {notice ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 text-sm">
          {notice}
        </div>
      ) : null}

      {loading ? (
        <div className="bg-white rounded-2xl p-6 shadow-sm">Đang tải dữ liệu...</div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <Card title="Tổng danh mục" value={summary.categories} hint="Dữ liệu từ GET /categories" />
          <Card title="Tổng món ăn" value={summary.products} hint="Dữ liệu từ GET /products" />
          <Card
            title="Đơn chờ duyệt"
            value={summary.pendingOrders}
            hint="Tính từ trạng thái pending"
          />
        </div>
      )}
    </div>
  );
}
