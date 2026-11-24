const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://server.betopiadaily.shop/api/v1/';

async function fetchAPI(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint.slice(1) : endpoint}`;
  
  try {
    const res = await fetch(url, options);
    
    // Check if the response has content
    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (err) {
      data = { text };
    }
    
    // Check for HTTP errors that might not be wrapped in the standard envelope
    if (!res.ok && !data.success && !data.errors) {
      return {
        success: false,
        message: `HTTP error ${res.status}`,
        data: null,
        errors: data,
        meta: {}
      };
    }
    
    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    return {
      success: false,
      message: 'Network error or server down',
      data: null,
      errors: { network: [error.message] },
      meta: {}
    };
  }
}

function withQuery(endpoint, params = {}) {
  const searchParams = new URLSearchParams();
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      searchParams.append(key, params[key]);
    }
  });
  const qs = searchParams.toString();
  return `${endpoint}${qs ? `?${qs}` : ''}`;
}

// Product data is owned by the CRM; the storefront only reads it.
export const api = {
  getBrands: () => fetchAPI('brands/'),
  getCategories: () => fetchAPI('categories/'),
  getProducts: (params = {}) => fetchAPI(withQuery('products/', params)),
  getProduct: (slug) => fetchAPI(`products/${slug}/`),
  getHotDeals: (params = {}) => fetchAPI(withQuery('hot-deals/', params)),
};
