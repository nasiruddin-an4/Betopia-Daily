// Storefront data client. Everything goes through this app's own /api/crm routes,
// which talk to the CRM on the server (see lib/server/crm.js).

async function fetchAPI(endpoint, options = {}) {
  try {
    const res = await fetch(`/api/crm/${endpoint}`, options);
    const data = await res.json().catch(() => ({}));
    if (!res.ok && data.success === undefined) {
      return { success: false, message: `HTTP error ${res.status}`, data: null };
    }
    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    return { success: false, message: 'Network error', data: null };
  }
}

function withQuery(endpoint, params = {}) {
  const searchParams = new URLSearchParams();
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      searchParams.append(key, params[key]);
    }
  });
  const qs = searchParams.toString();
  return `${endpoint}${qs ? `?${qs}` : ''}`;
}

const authed = (token, body) => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify(body),
});

export const api = {
  getCategories: () => fetchAPI('categories'),
  // params: search, category (slug), page, page_size, sort (price_low | price_high | newest | name)
  getProducts: (params = {}) => fetchAPI(withQuery('products', params)),
  getProduct: (slug) => fetchAPI(`products/${encodeURIComponent(slug)}`),

  // payload: { lines: [{ slug, variant_id, quantity }], phone }
  validateCart: (token, payload) => fetchAPI('cart/validate', authed(token, payload)),
  // payload: { lines, phone, idempotency_key }
  createOrder: (token, payload) => fetchAPI('orders', authed(token, payload)),
  // refs: [{ reference, phone }]
  lookupOrders: (token, refs) => fetchAPI('orders/lookup', authed(token, { orders: refs })),
};
