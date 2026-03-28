import { useEffect, useState } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { setAuthToken } from '../api/axiosClient';
import { adminApi } from './services/adminApi';
import AdminLayout from './components/AdminLayout';

export default function RequireAdmin() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (!token) return;

    let mounted = true;

    const verifyAdmin = async () => {
      setLoading(true);
      setAuthToken(token);

      try {
        const me = await adminApi.getMe();
        if (!mounted) return;

        if (me?.role !== 'admin') {
          setAuthError('Tài khoản của bạn không có quyền truy cập trang quản trị.');
          return;
        }

        setUser(me);
        setAuthError('');
      } catch (error) {
        if (!mounted) return;
        localStorage.removeItem('token');
        setAuthToken(null);
        setAuthError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    verifyAdmin();

    return () => {
      mounted = false;
    };
  }, [token]);

  const handleLogout = async () => {
    try {
      await adminApi.logout();
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('token');
      setAuthToken(null);
      navigate('/auth?mode=login', { replace: true });
    }
  };

  if (!token) {
    return <Navigate to="/auth?mode=login" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow p-6 text-center space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Không thể truy cập</h2>
          <p className="text-slate-600">{authError || 'Bạn chưa đăng nhập.'}</p>
          <button
            onClick={() => navigate('/', { replace: true })}
            className="px-5 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout user={user} onLogout={handleLogout}>
      <Outlet context={{ user }} />
    </AdminLayout>
  );
}
