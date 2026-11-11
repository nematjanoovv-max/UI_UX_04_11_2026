const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

async function fetchJson(endpoint, options = {}, retries = 1) {
  const url = `${API_BASE}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  try {
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
  } catch (err) {
    if (err.name === 'AbortError') {
      throw err;
    }
    if (retries > 0) {
      // Notify UI that server is warming up or reconnecting
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sd-server-wake', {
          detail: { message: "Server bilan aloqa o'rnatilmoqda, iltimos kuting..." }
        }));
      }
      await new Promise(r => setTimeout(r, 1500));
      return fetchJson(endpoint, options, retries - 1);
    }
    // Format error message cleanly for end users
    if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
      throw new Error("Internet aloqasini tekshiring yoki birozdan so'ng qayta urinib ko'ring.");
    }
    throw err;
  }
}

export const api = {
  // Health
  getHealth: (options = {}) => fetchJson('/health', options),

  // Categories
  getCategories: (options = {}) => fetchJson('/categories', options),
  createCategory: (data, options = {}) => fetchJson('/categories', {
    ...options,
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Products
  getProducts: (params = {}, options = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetchJson(`/products${qs ? `?${qs}` : ''}`, options);
  },
  createProduct: (data, options = {}) => fetchJson('/products', {
    ...options,
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateProduct: (id, data, options = {}) => fetchJson(`/products/${id}`, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteProduct: (id, options = {}) => fetchJson(`/products/${id}`, {
    ...options,
    method: 'DELETE'
  }),

  // Orders
  getOrders: (params = {}, options = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetchJson(`/orders${qs ? `?${qs}` : ''}`, options);
  },
  trackOrder: (query, options = {}) => fetchJson(`/orders/track/${encodeURIComponent(query)}`, options),
  createOrder: (orderData, options = {}) => fetchJson('/orders', {
    ...options,
    method: 'POST',
    body: JSON.stringify(orderData)
  }),
  updateOrderStatus: (id, status, options = {}) => fetchJson(`/orders/${id}/status`, {
    ...options,
    method: 'PATCH',
    body: JSON.stringify({ status })
  }),
  assignCourier: (orderId, courierId, options = {}) => fetchJson(`/orders/${orderId}/assign-courier`, {
    ...options,
    method: 'PATCH',
    body: JSON.stringify({ courier_id: courierId })
  }),

  // Couriers
  getCouriers: (params = {}, options = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetchJson(`/couriers${qs ? `?${qs}` : ''}`, options);
  },
  createCourier: (data, options = {}) => fetchJson('/couriers', {
    ...options,
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateCourierStatus: (id, status, options = {}) => fetchJson(`/couriers/${id}/status`, {
    ...options,
    method: 'PATCH',
    body: JSON.stringify({ status })
  }),

  // Stats
  getStats: (options = {}) => fetchJson('/stats', options),

  // Promocodes
  getPromos: (options = {}) => fetchJson('/promocodes', options),
  validatePromo: (code, amount, options = {}) => fetchJson('/promocodes/validate', {
    ...options,
    method: 'POST',
    body: JSON.stringify({ code, amount })
  }),
  createPromo: (data, options = {}) => fetchJson('/promocodes', {
    ...options,
    method: 'POST',
    body: JSON.stringify(data)
  }),
  deletePromo: (id, options = {}) => fetchJson(`/promocodes/${id}`, {
    ...options,
    method: 'DELETE'
  }),

  // Cashback
  getUserCashback: (params = {}, options = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetchJson(`/users/cashback${qs ? `?${qs}` : ''}`, options);
  },

  // Reviews
  getReviews: (options = {}) => fetchJson('/reviews', options),
  submitReview: (data, options = {}) => fetchJson('/reviews', {
    ...options,
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // SMS & Telegram 6-Digit OTP Verification
  sendOtp: (data, options = {}) => fetchJson('/auth/send-otp', {
    ...options,
    method: 'POST',
    body: JSON.stringify(data)
  }),
  verifyOtp: (data, options = {}) => fetchJson('/auth/verify-otp', {
    ...options,
    method: 'POST',
    body: JSON.stringify(data)
  }),
  checkOtpStatus: (params = {}, options = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetchJson(`/auth/check-otp-status${qs ? `?${qs}` : ''}`, options);
  },
  // Backward compatibility
  sendTelegramOtp: (data, options = {}) => fetchJson('/auth/send-otp', {
    ...options,
    method: 'POST',
    body: JSON.stringify(data)
  }),
  verifyTelegramOtp: (data, options = {}) => fetchJson('/auth/verify-otp', {
    ...options,
    method: 'POST',
    body: JSON.stringify(data)
  })
};
