import { useEffect, useState } from 'react';
import { adminApi, ApiNotAvailableError } from '../services/adminApi';
import { formatCurrency } from '../utils/formatters';
import axiosClient from '../../api/axiosClient';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

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
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searching, setSearching] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [removeImage, setRemoveImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const resolveImageUrl = (value) => {
    if (!value) return '';
    if (typeof value !== 'string') return '';
    if (value.startsWith('blob:') || value.startsWith('http')) return value;
    try {
      const base = axiosClient.defaults.baseURL.replace(/\/api\/?$/, '');
      return `${base}/${value.replace(/^\/+/, '')}`;
    } catch {
      return value;
    }
  };

  const validateImageFile = (file) => {
    if (!file) return '';

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return 'Định dạng ảnh không hợp lệ. Chỉ nhận PNG, JPG, JPEG hoặc WEBP.';
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return 'Ảnh vượt quá 5MB. Vui lòng chọn ảnh nhỏ hơn.';
    }

    return '';
  };

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

  useEffect(() => {
    return () => {
      if (typeof imagePreview === 'string' && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const openCreate = () => {
    setEditingId(null);
    setFormData(initialForm);
    setImageFile(null);
    setImagePreview('');
    setRemoveImage(false);
    setUploadProgress(0);
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
    setImageFile(null);
    setImagePreview(resolveImageUrl(item.image || ''));
    setRemoveImage(false);
    setUploadProgress(0);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData(initialForm);
    setImageFile(null);
    setImagePreview('');
    setRemoveImage(false);
    setUploadProgress(0);
  };

  const buildPayload = () => {
    const payload = {
      name: formData.name.trim(),
      category_id: Number(formData.category_id),
      price: Number(formData.price),
      description: formData.description?.trim() || '',
      is_available: Boolean(formData.is_available),
      image_file: imageFile,
    };

    if (editingId) {
      payload.remove_image = removeImage;
    }

    return payload;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.category_id || !formData.price) {
      setNotice('Vui lòng nhập đủ tên, danh mục và giá món ăn.');
      return;
    }

    setSubmitting(true);
    setNotice('');
    setUploadProgress(0);
    try {
      if (imageFile) {
        const fileError = validateImageFile(imageFile);
        if (fileError) {
          setNotice(fileError);
          return;
        }
      }

      const payload = buildPayload();
      if (!Number.isFinite(payload.category_id) || !Number.isFinite(payload.price)) {
        setNotice('Danh mục hoặc giá món ăn chưa hợp lệ. Vui lòng kiểm tra lại.');
        return;
      }

      const requestOptions = {
        onUploadProgress: (event) => {
          if (!event?.total) return;
          const percent = Math.round((event.loaded * 100) / event.total);
          setUploadProgress(percent);
        },
      };

      if (editingId) {
        await adminApi.updateProduct(editingId, payload, requestOptions);
      } else {
        await adminApi.createProduct(payload, requestOptions);
      }

      await loadData();
      resetForm();
    } catch (error) {
      if (error instanceof ApiNotAvailableError) {
        setNotice(error.message);
      } else if (error?.response?.status === 422) {
        const errors = error?.response?.data?.errors;
        const firstKey = errors ? Object.keys(errors)[0] : null;
        const firstMessage = firstKey && Array.isArray(errors[firstKey]) ? errors[firstKey][0] : '';
        setNotice(firstMessage || 'Dữ liệu món ăn không hợp lệ.');
      } else if (error?.response?.status === 403) {
        setNotice('Bạn không có quyền thao tác món ăn.');
      } else {
        setNotice('Lưu món ăn thất bại.');
      }
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
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
      <div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Quản lý món ăn</h2>
          <p className="text-slate-500 mt-1">Danh sách món ăn và thao tác CRUD.</p>
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
            {editingId ? `Chỉnh sửa món #${editingId}` : 'Thêm món ăn mới'}
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

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
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

            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm text-slate-600 mb-1">Ảnh món ăn</label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  const fileError = validateImageFile(file);

                  if (fileError) {
                    setNotice(fileError);
                    setImageFile(null);
                    setUploadProgress(0);
                    e.target.value = '';
                    return;
                  }

                  setImageFile(file);
                  setRemoveImage(false);
                  setNotice('');
                  setUploadProgress(0);
                  if (file) {
                    setImagePreview(URL.createObjectURL(file));
                  } else {
                    setImagePreview(resolveImageUrl(formData.image || ''));
                  }
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
              />
              <p className="text-xs text-slate-500">Hỗ trợ PNG, JPG, JPEG, WEBP. Tối đa 5MB.</p>

              {submitting && uploadProgress > 0 ? (
                <div className="space-y-1">
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500">Đang tải ảnh lên: {uploadProgress}%</p>
                </div>
              ) : null}

              {editingId && formData.image ? (
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={removeImage}
                    onChange={(e) => {
                      setRemoveImage(e.target.checked);
                      if (e.target.checked) {
                        setImageFile(null);
                        setImagePreview('');
                      } else {
                        setImagePreview(resolveImageUrl(formData.image || ''));
                      }
                    }}
                  />
                  Xóa ảnh hiện tại
                </label>
              ) : null}

              {imagePreview ? (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Xem trước</p>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-28 h-20 rounded-md object-cover border border-slate-200"
                  />
                </div>
              ) : null}
            </div>

            <div className="lg:col-span-3">
              <label className="block text-sm text-slate-600 mb-1">Mô tả</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 min-h-24"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
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

            <div className="flex gap-2">
              {!editingId ? (
                <button
                  type="button"
                  onClick={openCreate}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200"
                >
                  Làm mới
                </button>
              ) : null}
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60"
              >
                {submitting
                  ? uploadProgress > 0
                    ? `Đang tải ảnh ${uploadProgress}%...`
                    : 'Đang lưu...'
                  : editingId
                    ? 'Cập nhật'
                    : 'Thêm mới'}
              </button>
            </div>
          </div>
        </form>
      </div>

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
                  <th className="text-left px-4 py-3">Ảnh</th>
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
                    <td className="px-4 py-3">
                      {item.image ? (
                        <img
                          src={resolveImageUrl(item.image)}
                          alt={item.name}
                          className="w-14 h-14 rounded-md object-cover border border-slate-200"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="text-slate-400">--</span>
                      )}
                    </td>
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
            <div className="md:col-span-2">
              <p className="text-slate-500">Ảnh</p>
              {selectedProduct.image ? (
                <img
                  src={resolveImageUrl(selectedProduct.image)}
                  alt={selectedProduct.name}
                  className="mt-2 w-40 h-28 object-cover rounded-lg border border-slate-200"
                />
              ) : (
                <p className="font-medium text-slate-900">--</p>
              )}
            </div>
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
    </div>
  );
}
