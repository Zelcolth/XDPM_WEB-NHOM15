import { useEffect, useState } from 'react';
import { adminApi } from '../services/adminApi';

const initialForm = {
  name: '',
  image: '',
};

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [showForm, setShowForm] = useState(false);
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
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      name: item.name || '',
      image: item.image || '',
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
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
      closeForm();
    } catch (error) {
      if (error?.response?.status === 403) {
        setNotice('Bạn không có quyền thao tác danh mục. Hãy đăng nhập tài khoản admin.');
      } else if (error?.response?.status === 422) {
        setNotice('Dữ liệu không hợp lệ. Kiểm tra lại tên hoặc URL ảnh.');
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
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Quản lý danh mục</h2>
          <p className="text-slate-500 mt-1">CRUD danh mục món ăn qua API backend.</p>
        </div>

        <button
          onClick={openCreate}
          className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600"
        >
          + Thêm danh mục
        </button>
      </div>

      {notice ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3 text-sm">
          {notice}
        </div>
      ) : null}

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
                  <th className="text-left px-4 py-3">Ảnh</th>
                  <th className="text-right px-4 py-3">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="px-4 py-3">#{item.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{item.name}</td>
                    <td className="px-4 py-3">
                      {item.image ? (
                        <a
                          href={item.image}
                          target="_blank"
                          rel="noreferrer"
                          className="text-orange-600 hover:underline"
                        >
                          Xem ảnh
                        </a>
                      ) : (
                        <span className="text-slate-400">--</span>
                      )}
                    </td>
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

      {showForm ? (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSave}
            className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-xl space-y-4"
          >
            <h3 className="text-lg font-semibold text-slate-900">
              {editingId ? 'Cập nhật danh mục' : 'Thêm danh mục'}
            </h3>

            <div>
              <label className="block text-sm text-slate-600 mb-1">Tên danh mục</label>
              <input
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-200"
                placeholder="Ví dụ: Món nước"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">URL ảnh</label>
              <input
                value={formData.image}
                onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-200"
                placeholder="https://..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeForm}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60"
              >
                {submitting ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
