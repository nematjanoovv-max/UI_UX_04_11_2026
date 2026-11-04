const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

async function fetchJson(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  });

  if (!response.ok) {
    let errorMsg = `Server xatosi: ${response.status}`;
    try {
      const errData = await response.json();
      if (errData && errData.error) errorMsg = errData.error;
    } catch (_) {}
    throw new Error(errorMsg);
  }

  return await response.json();
}

export const api = {
  // Health
  getHealth: () => fetchJson('/health'),

  // Categories
  getCategories: () => fetchJson('/categories'),
  createCategory: (data) => fetchJson('/categories', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Products
  getProducts: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetchJson(`/products${qs ? `?${qs}` : ''}`);
  },
  createProduct: (data) => fetchJson('/products', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateProduct: (id, data) => fetchJson(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteProduct: (id) => fetchJson(`/products/${id}`, {
    method: 'DELETE'
  }),

  // Orders
  getOrders: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetchJson(`/orders${qs ? `?${qs}` : ''}`);
  },
  trackOrder: (query) => fetchJson(`/orders/track/${encodeURIComponent(query)}`),
  createOrder: (orderData) => fetchJson('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData)
  }),
  updateOrderStatus: (id, status) => fetchJson(`/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  }),
  assignCourier: (orderId, courierId) => fetchJson(`/orders/${orderId}/assign-courier`, {
    method: 'PATCH',
    body: JSON.stringify({ courier_id: courierId })
  }),

  // Couriers
  getCouriers: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetchJson(`/couriers${qs ? `?${qs}` : ''}`);
  },
  createCourier: (data) => fetchJson('/couriers', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateCourierStatus: (id, status) => fetchJson(`/couriers/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  }),

  // Stats
  getStats: () => fetchJson('/stats'),
};
