import { useEffect, useState } from 'react';
import { adminApi } from '../services/adminApi';

const initialForm = {
  name: '',
};

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    setNotice('');
    try {
      const list = await adminApi.getCategories();
      setCategories(list);
    } catch {
      setNotice('Không thể tải danh sách danh mục.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setFormData(initialForm);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      name: item.name || '',
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData(initialForm);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setNotice('Tên danh mục là bắt buộc.');
      return;
    }

    setSubmitting(true);
    setNotice('');
    try {
      if (editingId) {
        await adminApi.updateCategory(editingId, formData);
      } else {
        await adminApi.createCategory(formData);
      }
      await loadCategories();
      resetForm();
    } catch (error) {
      if (error?.response?.status === 403) {
        setNotice('Bạn không có quyền thao tác danh mục. Hãy đăng nhập tài khoản admin.');
      } else if (error?.response?.status === 422) {
        setNotice('Dữ liệu không hợp lệ. Kiểm tra lại tên danh mục.');
      } else {
        setNotice('Lưu danh mục thất bại.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm('Bạn có chắc muốn xóa danh mục này?');
    if (!ok) return;

    setNotice('');
    try {
      await adminApi.deleteCategory(id);
      setCategories((prev) => prev.filter((item) => item.id !== id));
    } catch {
      setNotice('Xóa danh mục thất bại.');
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Quản lý danh mục</h2>
          <p className="text-slate-500 mt-1">CRUD danh mục món ăn qua API backend.</p>
        </div>
      </div>

      {notice ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3 text-sm">
          {notice}
        </div>
      ) : null}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-slate-900">
            {editingId ? `Chỉnh sửa danh mục #${editingId}` : 'Thêm danh mục mới'}
          </h3>
          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              className="px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-sm"
            >
              Hủy sửa
            </button>
          ) : null}
        </div>

        <form onSubmit={handleSave} className="flex flex-col md:flex-row gap-3 md:items-end">
          <div className="flex-1">
            <label className="block text-sm text-slate-600 mb-1">Tên danh mục</label>
            <input
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-200"
              placeholder="Ví dụ: Món nước"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60"
            >
              {submitting ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Thêm mới'}
            </button>
            {!editingId ? (
              <button
                type="button"
                onClick={openCreate}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200"
              >
                Làm mới
              </button>
            ) : null}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-5 text-slate-600">Đang tải danh mục...</div>
        ) : categories.length === 0 ? (
          <div className="p-5 text-slate-600">Chưa có danh mục nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-4 py-3">ID</th>
                  <th className="text-left px-4 py-3">Tên</th>
                  <th className="text-right px-4 py-3">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="px-4 py-3">#{item.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{item.name}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => openEdit(item)}
                        className="px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-3 py-1.5 rounded-md bg-red-100 text-red-700 hover:bg-red-200"
                      >
                        Xóa
                      </button>
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
