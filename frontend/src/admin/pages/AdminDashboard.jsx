import { useEffect, useState } from 'react';
import { adminApi, ApiNotAvailableError } from '../services/adminApi';

const Card = ({ title, value, hint }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
    <p className="text-sm text-slate-500">{title}</p>
    <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
    {hint ? <p className="text-xs text-slate-400 mt-2">{hint}</p> : null}
  </div>
);

const LineChart = ({ title, data, color, unit }) => {
  const width = 760;
  const height = 240;
  const padding = 28;

  if (!data.length) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center text-slate-500">
        Sắp có dữ liệu
      </div>
    );
  }

  const maxValue = Math.max(...data.map((item) => item.value), 1);
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;

  const points = data
    .map((item, index) => {
      const x =
        data.length === 1
          ? width / 2
          : padding + (index / (data.length - 1)) * usableWidth;
      const y = padding + usableHeight - (item.value / maxValue) * usableHeight;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500">7 ngày gần nhất</p>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-52">
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#cbd5e1"
          strokeWidth="1"
        />
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="#cbd5e1"
          strokeWidth="1"
        />

        <polyline fill="none" stroke={color} strokeWidth="3" points={points} />

        {data.map((item, index) => {
          const x =
            data.length === 1
              ? width / 2
              : padding + (index / (data.length - 1)) * usableWidth;
          const y = padding + usableHeight - (item.value / maxValue) * usableHeight;

          return (
            <g key={item.date}>
              <circle cx={x} cy={y} r="4" fill={color} />
              <text x={x} y={height - 8} textAnchor="middle" fontSize="11" fill="#64748b">
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-slate-600">
        <p>
          Mức cao nhất: <span className="font-semibold">{maxValue.toLocaleString('vi-VN')} {unit}</span>
        </p>
        <p className="text-right">
          Hôm nay:{' '}
          <span className="font-semibold">
            {data[data.length - 1].value.toLocaleString('vi-VN')} {unit}
          </span>
        </p>
      </div>
    </div>
  );
};

const buildLast7DaysSeries = (orders = []) => {
  const days = Array.from({ length: 7 }, (_, index) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - index));
    const key = d.toISOString().slice(0, 10);
    return {
      key,
      label: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
      delivered: 0,
      revenue: 0,
    };
  });

  const mapByDay = Object.fromEntries(days.map((day) => [day.key, day]));

  orders.forEach((order) => {
    const status = String(order?.status || '').toLowerCase();
    const isDelivered = status === 'completed' || status === 'delivered';
    if (!isDelivered) return;

    const dateStr = order?.updated_at || order?.created_at;
    if (!dateStr) return;

    const key = new Date(dateStr).toISOString().slice(0, 10);
    const target = mapByDay[key];
    if (!target) return;

    target.delivered += 1;
    const total = Number(order?.total_price ?? order?.total ?? 0);
    target.revenue += Number.isFinite(total) ? total : 0;
  });

  return {
    deliveredByDay: days.map((day) => ({ date: day.key, label: day.label, value: day.delivered })),
    revenueByDay: days.map((day) => ({ date: day.key, label: day.label, value: day.revenue })),
  };
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    categories: 0,
    products: 0,
    pendingOrders: 0,
  });
  const [charts, setCharts] = useState({ deliveredByDay: [], revenueByDay: [] });
  const [hasOrderChartData, setHasOrderChartData] = useState(false);
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

        const series = buildLast7DaysSeries(orderResult.value);
        setCharts(series);
        setHasOrderChartData(true);
      } else {
        setCharts({ deliveredByDay: [], revenueByDay: [] });
        setHasOrderChartData(false);
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
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <Card title="Tổng danh mục" value={summary.categories} hint="Dữ liệu từ GET /categories" />
            <Card title="Tổng món ăn" value={summary.products} hint="Dữ liệu từ GET /products" />
            <Card
              title="Đơn chờ duyệt"
              value={summary.pendingOrders}
              hint="Tính từ trạng thái pending"
            />
          </div>

          {hasOrderChartData ? (
            <div className="grid xl:grid-cols-2 gap-4">
              <LineChart
                title="Đơn đã giao theo ngày"
                data={charts.deliveredByDay}
                color="#16a34a"
                unit="đơn"
              />
              <LineChart
                title="Doanh thu theo ngày"
                data={charts.revenueByDay}
                color="#ea580c"
                unit="VND"
              />
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-semibold text-slate-900">Biểu đồ đơn hàng và doanh thu</h3>
              <p className="mt-2 text-slate-500">Sắp có dữ liệu</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
