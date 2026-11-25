// Server-side client for the Betopia ERP e-commerce API (Odoo, /api/ecom/v1).
// Only import this from route handlers in app/api — the store key must never reach the browser.
//
// Env:
//   CRM_API_URL  e.g. https://dev.erp.betopialimited.com/api/ecom/v1
//   CRM_API_KEY  store key, sent as X-Store-Key

const API_URL = (process.env.CRM_API_URL || '').replace(/\/+$/, '');
const API_KEY = process.env.CRM_API_KEY;

export class CrmError extends Error {
  constructor(message, status = 502, code = 'crm_error') {
    super(message);
    this.status = status;
    this.code = code;
  }
}

/**
 * Calls the CRM API. Returns the parsed JSON body; throws CrmError on non-2xx
 * with the CRM's own error message (e.g. out_of_stock).
 */
export async function crm(path, { method = 'GET', body, headers = {}, raw = false } = {}) {
  if (!API_URL || !API_KEY) throw new CrmError('CRM is not configured. Set CRM_API_URL and CRM_API_KEY.', 500, 'not_configured');

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'X-Store-Key': API_KEY,
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  if (raw) {
    if (!res.ok) throw new CrmError(`CRM HTTP ${res.status}`, res.status === 404 ? 404 : 502);
    return res;
  }

  const text = await res.text();
  let json = {};
  try { json = text ? JSON.parse(text) : {}; } catch { /* HTML error page */ }

  if (!res.ok) {
    const err = json.error || {};
    // Pass client-side problems (stock, validation, not found) through; hide server faults
    const status = res.status >= 500 ? 502 : res.status;
    throw new CrmError(err.message || `CRM HTTP ${res.status}`, status, err.code || 'crm_error');
  }
  return json;
}

// ---------- Mapping CRM records to the shape the storefront uses ----------

const LOW_STOCK_THRESHOLD = 5;
const IMAGE_PREFIX = '/api/ecom/v1/images/';

/** CRM image paths need the store key, so they are served through /api/crm/images/... */
export function proxiedImage(url) {
  if (!url || typeof url !== 'string') return null;
  const i = url.indexOf(IMAGE_PREFIX);
  return i === -1 ? null : `/api/crm/images/${url.slice(i + IMAGE_PREFIX.length)}`;
}

// available_quantity is null when the CRM doesn't track stock for the product
const knownQty = (v) => (v?.available_quantity == null ? null : Number.isFinite(Number(v.available_quantity)) ? Number(v.available_quantity) : null);

function stockStatus(variant) {
  if (!variant) return 'In stock';
  if (variant.in_stock === false || variant.can_fulfill === false) return 'Out of stock';
  const qty = knownQty(variant);
  return qty !== null && qty <= LOW_STOCK_THRESHOLD ? 'Limited' : 'In stock';
}

export function mapProduct(p) {
  const price = Number(p.price) || 0;
  const compareAt = Number(p.compare_at_price) || 0;
  const onSale = compareAt > price;
  const variants = Array.isArray(p.variants) ? p.variants : null;
  const variant = variants?.find((v) => v.can_fulfill !== false) || variants?.[0] || null;
  const image = proxiedImage(p.image_url);
  const gallery = (Array.isArray(p.gallery) ? p.gallery : [])
    .map((g) => proxiedImage(typeof g === 'string' ? g : g?.image_url))
    .filter(Boolean);
  const images = [image, ...gallery].filter(Boolean).map((src, i) => ({ id: i + 1, image: src }));

  return {
    id: String(p.id),
    slug: p.slug,
    name: p.name,
    // Storefront convention: `price` is the regular price, `discounted_price` the sale price
    price: onSale ? compareAt : price,
    discounted_price: onSale ? price : null,
    discount_amount: onSale ? Math.round((compareAt - price) * 100) / 100 : 0,
    currency: p.currency || 'BDT',
    unit: '',
    short_description: p.short_description || '',
    description: p.description_html || p.short_description || '',
    first_image: image,
    images,
    // Only on the detail endpoint
    variant_id: variant?.variant_id ?? null,
    sku: variant?.sku ?? null,
    stock_qty: knownQty(variant),
    stock_status: stockStatus(variant),
    category: null,
    tags: [],
  };
}

export function mapCategory(c, productCount = null) {
  return {
    id: c.slug,
    slug: c.slug,
    name: c.name,
    description: c.description || '',
    icon: proxiedImage(c.image_url),
    parent_slug: c.parent_slug || null,
    product_count: productCount,
  };
}

const STATUS_LABEL = {
  new: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  done: 'Delivered',
  cancelled: 'Cancelled',
  canceled: 'Cancelled',
};

const titleCase = (s) => String(s || '').replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());

export function mapOrder(o) {
  return {
    order_id: o.reference,
    order_number: o.number,
    reference: o.reference,
    status: STATUS_LABEL[o.status] || titleCase(o.status),
    payment_state: o.payment_state,
    payment_method: o.payment_method === 'cash' ? 'Cash on Delivery' : titleCase(o.payment_method),
    created_at: o.placed_at,
    currency: o.currency,
    subtotal: Number(o.subtotal) || 0,
    tax: Number(o.tax) || 0,
    total_amount: Number(o.total) || 0,
    items: (o.lines || []).map((l) => ({
      variant_id: l.variant_id,
      // CRM prefixes names with "[SKU] "
      product_name: String(l.name || '').replace(/^\[[^\]]*\]\s*/, ''),
      product_image: l.variant_id ? `/api/crm/images/variant/${l.variant_id}` : null,
      quantity: Number(l.quantity) || 0,
      price: Number(l.unit_price) || 0,
      subtotal: Number(l.subtotal) || 0,
    })),
  };
}

/**
 * Cart lines from the browser carry the product slug (and variant_id when known).
 * Resolves each to a CRM variant_id; throws a 409 if a product can no longer be sold.
 */
export async function resolveLines(rawLines) {
  const lines = (Array.isArray(rawLines) ? rawLines : [])
    .map((l) => ({
      slug: typeof l.slug === 'string' ? l.slug : null,
      variantId: parseInt(l.variant_id) || null,
      quantity: Math.floor(Number(l.quantity)),
    }))
    .filter((l) => (l.slug || l.variantId) && l.quantity > 0 && l.quantity <= 999);

  if (!lines.length) throw new CrmError('Your cart is empty.', 400, 'empty_cart');

  const unknown = [...new Set(lines.filter((l) => !l.variantId).map((l) => l.slug))];
  const variantBySlug = new Map();
  await Promise.all(unknown.map(async (slug) => {
    try {
      const { data } = await crm(`/products/${encodeURIComponent(slug)}`);
      const v = data?.variants?.find((x) => x.can_fulfill !== false) || data?.variants?.[0];
      if (v) variantBySlug.set(slug, v.variant_id);
    } catch (err) {
      if (err.status !== 404) throw err;
    }
  }));

  const missing = lines.filter((l) => !l.variantId && !variantBySlug.has(l.slug));
  if (missing.length) {
    throw new CrmError('Some products in your cart are no longer available. Please remove them and try again.', 409, 'unavailable');
  }

  // Merge duplicate variants
  const merged = new Map();
  for (const l of lines) {
    const id = l.variantId || variantBySlug.get(l.slug);
    merged.set(id, (merged.get(id) || 0) + l.quantity);
  }
  return [...merged].map(([variant_id, quantity]) => ({ variant_id, quantity }));
}

export function errorResponse(err) {
  const known = err instanceof CrmError;
  if (!known || err.status >= 500) console.error('[crm]', err.message);
  return Response.json(
    { success: false, code: known ? err.code : 'server_error', message: known ? err.message : 'Server error', data: null },
    { status: known ? err.status : 500 }
  );
}
