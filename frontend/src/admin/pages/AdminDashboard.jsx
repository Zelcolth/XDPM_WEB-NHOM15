import { useEffect, useState } from 'react';
import { adminApi, ApiNotAvailableError } from '../services/adminApi';
import { formatCurrency } from '../utils/formatters';

const Card = ({ title, value, hint }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
    <p className="text-sm text-slate-500">{title}</p>
    <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
    {hint ? <p className="text-xs text-slate-400 mt-2">{hint}</p> : null}
  </div>
);

const LineChart = ({ title, data, color, unit }) => {
  const width = 760;
  const height = 280;
  const paddingLeft = 52;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;

  if (!data.length) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center text-slate-500">
        Sắp có dữ liệu
      </div>
    );
  }

  const isCountChart = unit === 'đơn';
  const rawMax = Math.max(...data.map((item) => item.value), 1);
  const roundedMax = rawMax > 10 ? Math.ceil(rawMax / 10) * 10 : rawMax;
  const minValue = 0;
  const usableWidth = width - paddingLeft - paddingRight;
  const usableHeight = height - paddingTop - paddingBottom;
  const yTickCount = 4;
  const maxValue = Math.max(roundedMax, 1);
  const yStep = isCountChart
    ? Math.max(1, Math.ceil(rawMax / yTickCount))
    : maxValue / yTickCount;
  const normalizedMaxValue = isCountChart
    ? yStep * yTickCount
    : maxValue;
  const yTicks = Array.from({ length: yTickCount + 1 }, (_, index) => {
    const value = isCountChart
      ? yStep * (yTickCount - index)
      : (normalizedMaxValue / yTickCount) * (yTickCount - index);
    const y = paddingTop + (index / yTickCount) * usableHeight;
    return { value, y };
  });

  const getPointX = (index) =>
    data.length === 1
      ? paddingLeft + usableWidth / 2
      : paddingLeft + (index / (data.length - 1)) * usableWidth;

  const getPointY = (value) =>
    paddingTop + usableHeight - ((value - minValue) / (normalizedMaxValue - minValue || 1)) * usableHeight;

  const chartPoints = data.map((item, index) => ({
    ...item,
    x: getPointX(index),
    y: getPointY(item.value),
  }));

  const linePath = chartPoints
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  const areaPath = [
    linePath,
    `L ${chartPoints[chartPoints.length - 1].x} ${height - paddingBottom}`,
    `L ${chartPoints[0].x} ${height - paddingBottom}`,
    'Z',
  ].join(' ');

  const currentValue = data[data.length - 1].value;
  const previousValue = data.length > 1 ? data[data.length - 2].value : 0;
  const changePercent = previousValue > 0 ? ((currentValue - previousValue) / previousValue) * 100 : null;
  const chartId = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const formatValue = (value) => {
    if (unit === 'VND') {
      return formatCurrency(value);
    }
    return `${value.toLocaleString('vi-VN')} ${unit}`;
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500">{data.length} tháng gần nhất</p>
      </div>

      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          Tháng hiện tại: <span className="font-semibold text-slate-900">{formatValue(currentValue)}</span>
        </p>
        {changePercent !== null ? (
          <p className={`text-xs font-semibold ${changePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(1)}% so với tháng trước
          </p>
        ) : (
          <p className="text-xs text-slate-500">Chưa đủ dữ liệu để so sánh</p>
        )}
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56">
        <defs>
          <linearGradient id={`area-${chartId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.03" />
          </linearGradient>
        </defs>

        {yTicks.map((tick, index) => (
          <g key={`${title}-tick-${index}`}>
            <line
              x1={paddingLeft}
              y1={tick.y}
              x2={width - paddingRight}
              y2={tick.y}
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <text x={paddingLeft - 8} y={tick.y + 4} textAnchor="end" fontSize="11" fill="#64748b">
              {isCountChart
                ? Math.round(tick.value).toLocaleString('vi-VN')
                : tick.value.toLocaleString('vi-VN')}
            </text>
          </g>
        ))}

        <line
          x1={paddingLeft}
          y1={height - paddingBottom}
          x2={width - paddingRight}
          y2={height - paddingBottom}
          stroke="#94a3b8"
          strokeWidth="1.5"
        />

        <path d={areaPath} fill={`url(#area-${chartId})`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />

        {chartPoints.map((point) => (
          <g key={point.date}>
            <circle cx={point.x} cy={point.y} r="4" fill={color} />
            <circle cx={point.x} cy={point.y} r="8" fill={color} fillOpacity="0.15" />
            <text
              x={point.x}
              y={height - 12}
              textAnchor="middle"
              fontSize="11"
              fill="#64748b"
              fontWeight="500"
            >
              {point.label}
            </text>
          </g>
        ))}
      </svg>

      <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-slate-600">
        <p>
          Mức cao nhất: <span className="font-semibold">{formatValue(rawMax)}</span>
        </p>
        <p className="text-right">
          Điểm gần nhất:{' '}
          <span className="font-semibold">
            {formatValue(currentValue)}
          </span>
        </p>
      </div>
    </div>
  );
};

const getOrderDate = (order) => {
  const rawDate = order?.updated_at || order?.created_at;
  if (!rawDate) return null;

  const date = new Date(rawDate);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isDeliveredOrder = (order) => {
  const status = String(order?.status || '').toLowerCase();
  return status === 'completed' || status === 'delivered';
};

const getMonthKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const buildMonthlySeries = (orders = [], monthCount = 6) => {
  const months = Array.from({ length: monthCount }, (_, index) => {
    const monthDate = new Date();
    monthDate.setDate(1);
    monthDate.setHours(0, 0, 0, 0);
    monthDate.setMonth(monthDate.getMonth() - (monthCount - 1 - index));

    return {
      key: getMonthKey(monthDate),
      label: monthDate.toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' }),
      delivered: 0,
      revenue: 0,
    };
  });

  const mapByMonth = Object.fromEntries(months.map((month) => [month.key, month]));

  orders.forEach((order) => {
    if (!isDeliveredOrder(order)) return;

    const date = getOrderDate(order);
    if (!date) return;

    const target = mapByMonth[getMonthKey(date)];
    if (!target) return;

    target.delivered += 1;
    const total = Number(order?.total_price ?? order?.total ?? 0);
    target.revenue += Number.isFinite(total) ? total : 0;
  });

  return {
    deliveredByMonth: months.map((month) => ({
      date: month.key,
      label: month.label,
      value: month.delivered,
    })),
    revenueByMonth: months.map((month) => ({
      date: month.key,
      label: month.label,
      value: month.revenue,
    })),
  };
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    monthlyRevenue: 0,
    monthlyDeliveredOrders: 0,
    pendingOrders: 0,
  });
  const [charts, setCharts] = useState({ deliveredByMonth: [], revenueByMonth: [] });
  const [hasOrderChartData, setHasOrderChartData] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadSummary = async () => {
      setLoading(true);
      setNotice('');

      const results = await Promise.allSettled([adminApi.getOrders()]);

      if (!mounted) return;

      const [orderResult] = results;

      if (orderResult.status === 'fulfilled') {
        const orders = orderResult.value;
        const currentMonth = new Date();
        const currentMonthKey = getMonthKey(currentMonth);
        const series = buildMonthlySeries(orders);
        const pendingOrders = orders.filter((order) => (order?.status || '').toLowerCase() === 'pending').length;

        const currentMonthDeliveredOrders = series.deliveredByMonth.find(
          (item) => item.date === currentMonthKey
        )?.value ?? 0;
        const currentMonthRevenue = series.revenueByMonth.find((item) => item.date === currentMonthKey)?.value ?? 0;

        setCharts(series);
        setHasOrderChartData(true);
        setSummary({
          monthlyRevenue: currentMonthRevenue,
          monthlyDeliveredOrders: currentMonthDeliveredOrders,
          pendingOrders,
        });
      } else {
        setCharts({ deliveredByMonth: [], revenueByMonth: [] });
        setHasOrderChartData(false);
        setSummary({
          monthlyRevenue: 0,
          monthlyDeliveredOrders: 0,
          pendingOrders: 0,
        });
      }

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
            <Card
              title="Tổng doanh thu theo tháng"
              value={formatCurrency(summary.monthlyRevenue)}
              hint="Chỉ tính đơn đã giao trong tháng hiện tại"
            />
            <Card
              title="Tổng đơn đã giao theo tháng"
              value={summary.monthlyDeliveredOrders}
              hint="Đếm các đơn completed / delivered"
            />
            <Card
              title="Đơn chờ duyệt"
              value={summary.pendingOrders}
              hint="Tính từ trạng thái pending"
            />
          </div>

          {hasOrderChartData ? (
            <div className="grid xl:grid-cols-2 gap-4">
              <LineChart
                title="Đơn đã giao theo tháng"
                data={charts.deliveredByMonth}
                color="#16a34a"
                unit="đơn"
              />
              <LineChart
                title="Doanh thu theo tháng"
                data={charts.revenueByMonth}
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
