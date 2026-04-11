import { NavLink, useLocation } from 'react-router-dom';

const navItems = [
  { to: '/admin', label: 'Tổng quan' },
  { to: '/admin/categories', label: 'Danh mục' },
  { to: '/admin/products', label: 'Món ăn' },
  { to: '/admin/orders', label: 'Đơn hàng' },
];

export default function AdminLayout({ user, onLogout, children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="w-72 bg-slate-900 text-slate-100 p-5 flex flex-col">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-wider text-slate-400">Admin Panel</p>
          <h1 className="text-xl font-bold mt-1">VèoFood</h1>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const active =
              location.pathname === item.to ||
              (item.to !== '/admin' && location.pathname.startsWith(item.to));

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`block px-4 py-2 rounded-lg transition ${
                  active
                    ? 'bg-orange-500 text-white'
                    : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto bg-slate-800 rounded-xl p-4 space-y-3">
          <div>
            <p className="text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
          <button
            onClick={onLogout}
            className="w-full py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm"
          >
            Đăng xuất
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
