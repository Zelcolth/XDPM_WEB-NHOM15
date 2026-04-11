const CART_KEY = 'veofood_cart';

const safeNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

export function getCartItems() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => ({
        id: safeNumber(item?.id),
        product_id: safeNumber(item?.product_id ?? item?.id),
        name: String(item?.name || ''),
        price: safeNumber(item?.price),
        qty: Math.max(1, Math.floor(safeNumber(item?.qty, 1))),
        img: item?.img || null,
        note: item?.note || '',
      }))
      .filter((item) => item.id > 0 && item.name);
  } catch {
    return [];
  }
}

export function setCartItems(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addToCart(product, quantity = 1) {
  const cart = getCartItems();
  const productId = safeNumber(product?.id);
  if (!productId) return cart;

  const qty = Math.max(1, Math.floor(safeNumber(quantity, 1)));
  const idx = cart.findIndex((item) => item.id === productId);

  if (idx >= 0) {
    cart[idx] = { ...cart[idx], qty: cart[idx].qty + qty };
  } else {
    cart.push({
      id: productId,
      product_id: productId,
      name: product?.name || `Mon #${productId}`,
      price: safeNumber(product?.price),
      qty,
      img: product?.img || product?.image || null,
      note: product?.description || '',
    });
  }

  setCartItems(cart);
  return cart;
}

export function updateCartItemQty(productId, quantity) {
  const targetId = safeNumber(productId);
  const qty = Math.floor(safeNumber(quantity, 0));
  const cart = getCartItems();

  const next = cart
    .map((item) => (item.id === targetId ? { ...item, qty } : item))
    .filter((item) => item.qty > 0);

  setCartItems(next);
  return next;
}

export function removeCartItem(productId) {
  const targetId = safeNumber(productId);
  const next = getCartItems().filter((item) => item.id !== targetId);
  setCartItems(next);
  return next;
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
}

export function getCartTotal(items = getCartItems()) {
  return items.reduce((sum, item) => sum + safeNumber(item.price) * safeNumber(item.qty), 0);
}

export const CART_STORAGE_KEY = CART_KEY;
