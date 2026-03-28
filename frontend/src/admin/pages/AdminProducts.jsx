import { useEffect, useState } from 'react';
import { adminApi, ApiNotAvailableError } from '../services/adminApi';
import { formatCurrency } from '../utils/formatters';

const initialForm = {
  name: '',
  category_id: '',
  price: '',
  description: '',
  image: '',
  is_available: true,
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searching, setSearching] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setNotice('');
    try {
      const [productList, categoryList] = await Promise.all([
        adminApi.getProducts(),
        adminApi.getCategories(),
      ]);
      setProducts(productList);
      setCategories(categoryList);
    } catch {
      setNotice('Không thể tải dữ liệu món ăn hoặc danh mục.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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
      category_id: item.category_id ? String(item.category_id) : '',
      price: item.price ? String(item.price) : '',
      description: item.description || '',
      image: item.image || '',
      is_available: Boolean(item.is_available),
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(initialForm);
  };

  const buildPayload = () => ({
    ...formData,
    category_id: Number(formData.category_id),
    price: Number(formData.price),
    is_available: Boolean(formData.is_available),
  });

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.category_id || !formData.price) {
      setNotice('Vui lòng nhập đủ tên, danh mục và giá món ăn.');
      return;
    }

    setSubmitting(true);
    setNotice('');
    try {
      const payload = buildPayload();
      if (editingId) {
        await adminApi.updateProduct(editingId, payload);
      } else {
        await adminApi.createProduct(payload);
      }

      await loadData();
      closeForm();
    } catch (error) {
      if (error instanceof ApiNotAvailableError) {
        setNotice(error.message);
      } else if (error?.response?.status === 422) {
        setNotice('Dữ liệu món ăn không hợp lệ.');
      } else if (error?.response?.status === 403) {
        setNotice('Bạn không có quyền thao tác món ăn.');
      } else {
        setNotice('Lưu món ăn thất bại.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm('Bạn có chắc muốn xóa món ăn này?');
    if (!ok) return;

    setNotice('');
    try {
      await adminApi.deleteProduct(id);
      setProducts((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      if (error instanceof ApiNotAvailableError) {
        setNotice(error.message);
      } else {
        setNotice('Xóa món ăn thất bại.');
      }
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const keyword = searchKeyword.trim();

    if (!keyword) {
      await loadData();
      setSelectedProduct(null);
      setNotice('Đã tải lại danh sách đầy đủ.');
      return;
    }

    setSearching(true);
    setNotice('');
    setSelectedProduct(null);
    try {
      const result = await adminApi.getProducts(keyword);
      setProducts(result);
      if (result.length === 0) {
        setNotice('Không tìm thấy món ăn phù hợp từ khóa.');
      }
    } catch (error) {
      if (error instanceof ApiNotAvailableError) {
        setNotice(error.message);
      } else {
        setNotice('Không thể tra cứu món ăn lúc này.');
      }
    } finally {
      setSearching(false);
    }
  };

  const handleViewDetail = async (id) => {
    setDetailLoading(true);
    setNotice('');
    try {
      const detail = await adminApi.getProductDetail(id);
      setSelectedProduct(detail);
    } catch (error) {
      if (error instanceof ApiNotAvailableError) {
        setNotice(error.message);
      } else if (error?.response?.status === 404) {
        setNotice('Món ăn không còn tồn tại.');
      } else {
        setNotice('Không lấy được chi tiết món ăn.');
      }
      setSelectedProduct(null);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Quản lý món ăn</h2>
          <p className="text-slate-500 mt-1">Danh sách món ăn và thao tác CRUD.</p>
        </div>

        <button
          onClick={openCreate}
          className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600"
        >
          + Thêm món ăn
        </button>
      </div>

      {notice ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3 text-sm">
          {notice}
        </div>
      ) : null}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Tra cứu món ăn nhanh</h3>
          <p className="text-sm text-slate-500 mt-1">
            Tìm theo tên (GET /products?keyword=...) và xem chi tiết (GET /products/{'{id}'}).
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <input
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Nhập tên món để tìm kiếm..."
            className="flex-1 px-3 py-2 rounded-lg border border-slate-300"
          />
          <button
            type="submit"
            disabled={searching}
            className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60"
          >
            {searching ? 'Đang tìm...' : 'Tra cứu'}
          </button>
          <button
            type="button"
            onClick={async () => {
              setSearchKeyword('');
              setSelectedProduct(null);
              await loadData();
            }}
            className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200"
          >
            Xóa lọc
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-5 text-slate-600">Đang tải món ăn...</div>
        ) : products.length === 0 ? (
          <div className="p-5 text-slate-600">Chưa có món ăn nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-4 py-3">ID</th>
                  <th className="text-left px-4 py-3">Tên món</th>
                  <th className="text-left px-4 py-3">Danh mục</th>
                  <th className="text-left px-4 py-3">Giá</th>
                  <th className="text-left px-4 py-3">Trạng thái</th>
                  <th className="text-right px-4 py-3">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {products.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="px-4 py-3">#{item.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{item.name}</td>
                    <td className="px-4 py-3">{item.category?.name || '--'}</td>
                    <td className="px-4 py-3">{formatCurrency(item.price)}</td>
                    <td className="px-4 py-3">
                      {item.is_available ? (
                        <span className="px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700">
                          Còn hàng
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs bg-slate-200 text-slate-700">
                          Hết hàng
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => handleViewDetail(item.id)}
                        className="px-3 py-1.5 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200"
                      >
                        Chi tiết
                      </button>
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

      {detailLoading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 text-slate-600">
          Đang lấy chi tiết món ăn...
        </div>
      ) : null}

      {selectedProduct ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-3">
          <h3 className="text-base font-semibold text-slate-900">Chi tiết món ăn</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Tên món</p>
              <p className="font-medium text-slate-900">{selectedProduct.name}</p>
            </div>
            <div>
              <p className="text-slate-500">Danh mục</p>
              <p className="font-medium text-slate-900">{selectedProduct.category?.name || '--'}</p>
            </div>
            <div>
              <p className="text-slate-500">Giá</p>
              <p className="font-medium text-slate-900">{formatCurrency(selectedProduct.price)}</p>
            </div>
            <div>
              <p className="text-slate-500">Trạng thái</p>
              <p className="font-medium text-slate-900">
                {selectedProduct.is_available ? 'Còn hàng' : 'Hết hàng'}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-slate-500">Mô tả</p>
              <p className="text-slate-700">{selectedProduct.description || '--'}</p>
            </div>
          </div>
        </div>
      ) : null}

      {showForm ? (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSave}
            className="w-full max-w-2xl bg-white rounded-2xl p-6 shadow-xl space-y-4"
          >
            <h3 className="text-lg font-semibold text-slate-900">
              {editingId ? 'Cập nhật món ăn' : 'Thêm món ăn'}
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Tên món</label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1">Danh mục</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData((prev) => ({ ...prev, category_id: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1">Giá (VND)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1">URL ảnh</label>
                <input
                  value={formData.image}
                  onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">Mô tả</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 min-h-24"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={formData.is_available}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, is_available: e.target.checked }))
                }
              />
              Còn hàng
            </label>

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
