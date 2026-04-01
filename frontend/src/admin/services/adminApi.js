import axiosClient from '../../api/axiosClient';

export class ApiNotAvailableError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ApiNotAvailableError';
    this.code = 'API_NOT_AVAILABLE';
  }
}

const getListPayload = (response) => {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const normalizeText = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const filterProductsByKeyword = (products, keyword) => {
  const needle = normalizeText(keyword);
  if (!needle) return products;

  const matched = products.filter((item) => normalizeText(item?.name).includes(needle));

  const score = (item) => {
    const name = normalizeText(item?.name);
    if (name === needle) return 0;
    if (name.startsWith(needle)) return 1;
    return 2;
  };

  return matched.sort((a, b) => {
    const byScore = score(a) - score(b);
    if (byScore !== 0) return byScore;

    const nameA = normalizeText(a?.name);
    const nameB = normalizeText(b?.name);
    return nameA.localeCompare(nameB, 'vi');
  });
};

const ensureApi = async (request, message) => {
  try {
    return await request();
  } catch (error) {
    if (error?.response?.status === 404) {
      throw new ApiNotAvailableError(message);
    }
    throw error;
  }
};

const toProductFormData = (payload = {}) => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || key === 'image_file') return;

    if (typeof value === 'boolean') {
      formData.append(key, value ? '1' : '0');
      return;
    }

    formData.append(key, String(value));
  });

  if (payload.image_file instanceof File) {
    formData.append('image_file', payload.image_file);
  }

  return formData;
};

export const adminApi = {
  async getMe() {
    const res = await axiosClient.get('/user');
    return res.data;
  },

  async logout() {
    return axiosClient.post('/logout');
  },

  async getCategories() {
    const res = await axiosClient.get('/categories');
    return getListPayload(res);
  },

  async createCategory(payload) {
    const res = await axiosClient.post('/categories', payload);
    return res.data;
  },

  async updateCategory(id, payload) {
    const res = await axiosClient.put(`/categories/${id}`, payload);
    return res.data;
  },

  async deleteCategory(id) {
    return axiosClient.delete(`/categories/${id}`);
  },

  async getProducts(keyword = '') {
    const params = {};
    if (typeof keyword === 'string' && keyword.trim() !== '') {
      params.keyword = keyword.trim();
    }

    const res = await axiosClient.get('/products', { params });
    const list = getListPayload(res);

    if (params.keyword) {
      // Fallback when backend has not implemented keyword filtering yet.
      return filterProductsByKeyword(list, params.keyword);
    }

    return list;
  },

  async getProductDetail(id) {
    const res = await ensureApi(
      () => axiosClient.get(`/products/${id}`),
      'Backend chưa có API chi tiết món ăn (GET /products/{id}).'
    );

    const data = res?.data;
    if (data?.data) return data.data;
    return data;
  },

  async createProduct(payload, options = {}) {
    const formData = toProductFormData(payload);
    const res = await ensureApi(
      () => axiosClient.post('/products', formData, options),
      'Backend chưa có API tạo món ăn (POST /products).'
    );
    return res.data;
  },

  async updateProduct(id, payload, options = {}) {
    const formData = toProductFormData(payload);
    formData.append('_method', 'PUT');

    const res = await ensureApi(
      () => axiosClient.post(`/products/${id}`, formData, options),
      'Backend chưa có API cập nhật món ăn (PUT /products/{id}).'
    );
    return res.data;
  },

  async deleteProduct(id) {
    return ensureApi(
      () => axiosClient.delete(`/products/${id}`),
      'Backend chưa có API xóa món ăn (DELETE /products/{id}).'
    );
  },

  async getOrders() {
    const res = await ensureApi(
      () => axiosClient.get('/orders'),
      'Backend chưa có API danh sách đơn hàng (GET /orders).'
    );
    return getListPayload(res);
  },

  async updateOrderStatus(orderId, status) {
    try {
      const res = await axiosClient.patch(`/orders/${orderId}/status`, { status });
      return res.data;
    } catch (firstError) {
      if (firstError?.response?.status !== 404) {
        throw firstError;
      }

      const fallback = await ensureApi(
        () => axiosClient.put(`/orders/${orderId}`, { status }),
        'Backend chưa có API duyệt/cập nhật trạng thái đơn hàng.'
      );
      return fallback.data;
    }
  },
};
