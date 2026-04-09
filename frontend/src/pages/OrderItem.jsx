import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import heroImg from '../assets/hero.png';
import Toast from '../components/Toast';
import MainHeader from '../components/MainHeader';
import MainFooter from '../components/MainFooter';
import {
  addToCart,
  CART_STORAGE_KEY,
  getCartItems,
  getCartTotal,
  updateCartItemQty,
} from '../utils/cartStorage';

const formatMoney = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const buildImageUrl = (imgPath) => {
  if (!imgPath) return null;
  if (imgPath.startsWith('http')) return imgPath;
  try {
    const base = axiosClient.defaults.baseURL.replace(/\/api\/?$/, '');
    return `${base}/${imgPath}`;
  } catch {
    return imgPath;
  }
};

export default function OrderItem() {
  const [showAll, setShowAll] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [products, setProducts] = useState([]);
  const [apiCategories, setApiCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cartItems, setCartItems] = useState(() => getCartItems());
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const [categoriesRes, productsRes] = await Promise.all([
          axiosClient.get('/categories'),
          axiosClient.get('/products'),
        ]);

        if (!mounted) return;

        const rawCategories = categoriesRes.data?.data ?? categoriesRes.data ?? [];
        const rawProducts = productsRes.data?.data ?? productsRes.data ?? [];

        const normalizedCategories = rawCategories
          .map((c) => ({ id: Number(c.id), name: c.name || `Danh mục ${c.id}` }))
          .filter((c) => Number.isFinite(c.id));

        const categoryMap = normalizedCategories.reduce((acc, c) => {
          acc[c.id] = c.name;
          return acc;
        }, {});

        const normalizedProducts = rawProducts
          .filter((item) => Number(item?.id) > 0)
          .map((item) => {
            const categoryName = item?.category?.name || categoryMap[Number(item.category_id)] || 'Khác';
            return {
              id: Number(item.id),
              name: item.name || `Món #${item.id}`,
              tag: Number(item.id) % 3 === 0 ? 'ĐẦU BẾP GỢI Ý' : Number(item.id) % 2 === 0 ? 'MỚI' : 'BÁN CHẠY',
              rating: Number((4.6 + (Number(item.id) % 5) * 0.1).toFixed(1)),
              time: Number(item.id) % 2 === 0 ? '10-15 min' : '15-25 min',
              ship: Number(item.id) % 2 === 0 ? '20.000 đ' : 'Miễn phí',
              price: Number(item.price || 0),
              img: buildImageUrl(item.image),
              note: item.description || 'Mô tả ngắn gọn về món ăn cao cấp này...',
              categoryName,
            };
          });

        setApiCategories(normalizedCategories.map((c) => c.name));
        setProducts(normalizedProducts);
      } catch (err) {
        console.error(err);
        if (mounted) setError('Không thể tải dữ liệu món ăn.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProducts();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === CART_STORAGE_KEY) {
        setCartItems(getCartItems());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const categories = useMemo(() => {
    const fromProducts = Array.from(new Set(products.map((item) => item.categoryName))).filter(Boolean);
    const merged = [...apiCategories, ...fromProducts];
    return Array.from(new Set(merged));
  }, [apiCategories, products]);

  const searchedProducts = useMemo(() => {
    return products.filter((item) => {
      const keyword = search.trim().toLowerCase();
      const passSearch =
        keyword.length === 0 ||
        item.name.toLowerCase().includes(keyword) ||
        String(item.note || '').toLowerCase().includes(keyword);
      return passSearch;
    });
  }, [products, search]);

  const allProducts = useMemo(() => {
    if (!selectedCategory) return searchedProducts;
    return searchedProducts.filter((item) => item.categoryName === selectedCategory);
  }, [searchedProducts, selectedCategory]);

  const suggestedProducts = useMemo(() => {
    const cloned = [...products];
    for (let i = cloned.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
    }
    return cloned.slice(0, 3);
  }, [products]);
  const subtotal = getCartTotal(cartItems);
  const cartCount = cartItems.reduce((sum, item) => sum + Number(item.qty || 0), 0);

  const syncCart = () => setCartItems(getCartItems());

  const handleAddProduct = (item) => {
    addToCart(item, 1);
    syncCart();
    setToast({ visible: true, message: `${item.name} đã được thêm vào giỏ`, type: 'success' });
  };

  const handleQtyChange = (productId, nextQty) => {
    updateCartItemQty(productId, nextQty);
    syncCart();
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      setToast({ visible: true, message: 'Giỏ hàng đang trống', type: 'error' });
      return;
    }
    navigate('/checkout');
  };

  return (

    <div className="bg-[#FDF7F2] min-h-screen font-sans text-gray-800">
      
      <MainHeader active="explore" />

      <main className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        
        <div className="lg:w-2/3 space-y-8">
          
          <div className="flex flex-col md:flex-row rounded-3xl overflow-hidden h-72 shadow-lg">
            <div className="md:w-1/2 bg-[#8C592B] p-10 flex flex-col justify-center">
              <h1 className="text-white text-3xl font-bold mb-6 leading-tight">Hương vị tinh tế <br/> giao tận nơi</h1>
              <p className="text-orange-100 text-sm">Khám phá món ăn ngon và đặt hàng nhanh chóng.</p>
            </div>
            <div className="md:w-1/2 bg-gray-900 flex items-center justify-center relative">
              <img src={heroImg} alt="Banner Food" className="object-cover w-full h-full opacity-80" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Gợi ý cho bạn</h2>
                <p className="text-gray-500 text-sm mt-1">Những lựa chọn cao cấp được đầu bếp của chúng tôi đề xuất hôm nay.</p>
              </div>
            </div>

            {loading ? (
              <div className="text-gray-500">Đang tải danh sách món ăn...</div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : suggestedProducts.length === 0 ? (
              <div className="text-gray-500">Không có món ăn phù hợp với bộ lọc hiện tại.</div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestedProducts.map((item) => (
                <div key={item.id} className="bg-white rounded-3xl p-4 shadow-sm hover:shadow-md transition">
                  <div className="relative">
                    {item.img ? (
                      <img src={item.img} alt={item.name} className="w-full h-40 object-cover rounded-2xl" />
                    ) : (
                      <div className="w-full h-40 rounded-2xl bg-slate-100 text-slate-500 text-sm font-medium flex items-center justify-center">
                        Chưa có ảnh
                      </div>
                    )}
                    <span className="absolute top-3 left-3 bg-yellow-400 text-xs font-bold px-2 py-1 rounded-md">{item.tag}</span>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-lg">{item.name}</h3>
                      <span className="flex items-center text-sm font-medium bg-[#FFF5E6] text-orange-600 px-2 py-0.5 rounded-lg">
                        <span className="text-yellow-500 mr-1">★</span> {item.rating}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">{item.note}</p>
                    <div className="flex gap-4 mt-3 text-xs text-gray-500 font-medium">
                      <span className="flex items-center">⏱ {item.time}</span>
                      <span className="flex items-center">🛵 {item.ship}</span>
                    </div>
                    <div className="flex justify-between items-center mt-5">
                      <span className="text-xl font-bold">{formatMoney(item.price)}</span>
                      <button onClick={() => handleAddProduct(item)} className="bg-[#F97316] text-white p-2 rounded-xl hover:bg-orange-600 transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}

            <div className="flex justify-center mt-8">
              <button onClick={() => setShowAll(!showAll)} className="bg-[#8C592B] text-white px-8 py-3 rounded-full font-bold hover:bg-[#6d4620] transition">
                {showAll ? 'Ẩn bớt ↑' : 'Xem tất cả các món ăn →'}
              </button>
            </div>
          </div>

          {showAll && (
            <div className="mt-12 pt-8 border-t-2 border-gray-200">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Tất cả các món ăn</h2>
                  <p className="text-gray-500 text-sm mt-1">Khám phá toàn bộ bộ sưu tập của chúng tôi.</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory((prev) => (prev === cat ? '' : cat))}
                      className={`whitespace-nowrap px-6 py-2 rounded-full font-medium transition ${selectedCategory === cat ? 'bg-[#8C592B] text-white' : 'bg-[#FBE9D7] text-[#8C592B] hover:bg-[#f3d9bf]'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="relative md:min-w-[260px]">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm kiếm món ăn..."
                    className="w-full py-2.5 pl-10 pr-4 rounded-full border border-[#FBE9D7] focus:outline-none"
                  />
                  <svg className="w-5 h-5 absolute left-3 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
              </div>

              {allProducts.length === 0 ? (
                <div className="text-gray-500">Không có món ăn để hiển thị.</div>
              ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allProducts.map((item) => (
                  <div key={item.id} className="bg-white rounded-3xl p-4 shadow-sm hover:shadow-md transition">
                    <div className="relative">
                      {item.img ? (
                        <img src={item.img} alt={item.name} className="w-full h-40 object-cover rounded-2xl" />
                      ) : (
                        <div className="w-full h-40 rounded-2xl bg-slate-100 text-slate-500 text-sm font-medium flex items-center justify-center">
                          Chưa có ảnh
                        </div>
                      )}
                      <span className="absolute top-3 left-3 bg-yellow-400 text-xs font-bold px-2 py-1 rounded-md">{item.tag}</span>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg">{item.name}</h3>
                        <span className="flex items-center text-sm font-medium bg-[#FFF5E6] text-orange-600 px-2 py-0.5 rounded-lg">
                          <span className="text-yellow-500 mr-1">★</span> {item.rating}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2">{item.note}</p>
                      <div className="flex gap-4 mt-3 text-xs text-gray-500 font-medium">
                        <span className="flex items-center">⏱ {item.time}</span>
                        <span className="flex items-center">🛵 {item.ship}</span>
                      </div>
                      <div className="flex justify-between items-center mt-5">
                        <span className="text-xl font-bold">{formatMoney(item.price)}</span>
                        <button onClick={() => handleAddProduct(item)} className="bg-[#F97316] text-white p-2 rounded-xl hover:bg-orange-600 transition">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </div>
          )}
        </div>

        <div className="lg:w-1/3">
          <div className="bg-white rounded-3xl p-6 shadow-sm sticky top-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Lựa chọn của bạn</h2>
              <span className="bg-[#FBE9D7] text-[#8C592B] font-bold w-6 h-6 flex items-center justify-center rounded-full text-xs">{cartCount}</span>
            </div>

            <div className="space-y-6">
              {cartItems.length === 0 ? (
                <p className="text-sm text-gray-500">Chưa có món nào trong giỏ.</p>
              ) : (
              cartItems.map((item) => (
                <div key={item.id} className="flex gap-4 items-center">
                  {item.img ? (
                    <img src={item.img} alt={item.name} className="w-16 h-16 rounded-full object-cover border border-gray-100" />
                  ) : (
                    <div className="w-16 h-16 rounded-full border border-gray-100 bg-slate-100 text-slate-500 text-[10px] flex items-center justify-center">
                      Chưa có ảnh
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-bold text-sm">{item.name}</h4>
                    <p className="text-xs text-gray-500 mb-2">{item.note}</p>
                    <div className="flex items-center bg-[#FDF7F2] w-fit rounded-full px-2 py-1">
                      <button onClick={() => handleQtyChange(item.id, Number(item.qty) - 1)} className="text-gray-500 hover:text-orange-500 px-2">-</button>
                      <span className="text-xs font-bold px-2">{item.qty}</span>
                      <button onClick={() => handleQtyChange(item.id, Number(item.qty) + 1)} className="text-gray-500 hover:text-orange-500 px-2">+</button>
                    </div>
                  </div>
                  <div className="font-bold text-sm">{formatMoney(Number(item.price) * Number(item.qty))}</div>
                </div>
              ))) }
            </div>

            <div className="mt-8 pt-6 border-t border-dashed border-gray-200 space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Số Tiền cần thanh toán:</span>
                <span className="font-medium">{formatMoney(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Phí giao hàng</span>
                <span className="font-medium text-green-600">Miễn phí</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="font-bold text-lg">Tổng cộng</span>
                <span className="font-bold text-xl">{formatMoney(subtotal)}</span>
              </div>
              <button onClick={handleCheckout} className="w-full mt-4 bg-[#F97316] text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition shadow-lg shadow-orange-200">
                TIẾN HÀNH THANH TOÁN
              </button>
            </div>
          </div>
        </div>

      </main>

      <MainFooter />
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
        duration={2200}
      />
    </div>
  );
}