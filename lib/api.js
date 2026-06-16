const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://10.10.30.105:8000/api/v1/';

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

export const api = {
  // Brands
  getBrands: () => fetchAPI('brands/'),
  createBrand: (formData) => fetchAPI('brands/', { method: 'POST', body: formData }),
  getBrand: (slug) => fetchAPI(`brands/${slug}/`),
  updateBrand: (slug, formData) => fetchAPI(`brands/${slug}/`, { method: 'PUT', body: formData }),
  deleteBrand: (slug) => fetchAPI(`brands/${slug}/`, { method: 'DELETE' }),
  getBrandProducts: (slug) => fetchAPI(`brands/${slug}/products/`),

  // Categories
  getCategories: () => fetchAPI('categories/'),
  createCategory: (formData) => fetchAPI('categories/', { method: 'POST', body: formData }),
  getCategory: (slug) => fetchAPI(`categories/${slug}/`),
  updateCategory: (slug, formData) => fetchAPI(`categories/${slug}/`, { method: 'PUT', body: formData }),
  deleteCategory: (slug) => fetchAPI(`categories/${slug}/`, { method: 'DELETE' }),

  // Tags
  getTags: () => fetchAPI('tags/'),
  createTag: (data) => fetchAPI('tags/', { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify(data) 
  }),
  getTag: (uuid) => fetchAPI(`tags/${uuid}/`),
  updateTag: (uuid, data) => fetchAPI(`tags/${uuid}/`, { 
    method: 'PUT', 
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify(data) 
  }),
  deleteTag: (uuid) => fetchAPI(`tags/${uuid}/`, { method: 'DELETE' }),

  // Products
  getProducts: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        searchParams.append(key, params[key]);
      }
    });
    const qs = searchParams.toString();
    return fetchAPI(`products/${qs ? `?${qs}` : ''}`);
  },
  createProduct: (formData) => fetchAPI('products/', { method: 'POST', body: formData }),
  getProduct: (slug) => fetchAPI(`products/${slug}/`),
  updateProduct: (slug, formData) => fetchAPI(`products/${slug}/`, { method: 'PUT', body: formData }),
  deleteProduct: (slug) => fetchAPI(`products/${slug}/`, { method: 'DELETE' }),

  // Product Images
  addProductImages: (slug, formData) => fetchAPI(`products/${slug}/images/`, { method: 'POST', body: formData }),
  deleteProductImage: (slug, imageId) => fetchAPI(`products/${slug}/images/`, { 
    method: 'DELETE', 
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify({ image_id: imageId }) 
  }),
  setPrimaryProductImage: (slug, imageId) => fetchAPI(`products/${slug}/images/${imageId}/set-primary/`, { method: 'POST' }),

  // Hot Deals
  getHotDeals: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        searchParams.append(key, params[key]);
      }
    });
    const qs = searchParams.toString();
    return fetchAPI(`hot-deals/${qs ? `?${qs}` : ''}`);
  },

  // Site Settings
  getHeroImages: () => fetchAPI('site-settings/hero/'),

};
