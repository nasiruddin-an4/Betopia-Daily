import { crm, mapProduct, errorResponse } from '@/lib/server/crm';

// Storefront sort names -> CRM sort names
const SORTS = {
  price_low: 'price_asc',
  price_high: 'price_desc',
  newest: 'newest',
  name: 'name_asc',
};

// GET /api/crm/products?search=&category=&page=1&page_size=20&sort=price_low
export async function GET(request) {
  try {
    const sp = new URL(request.url).searchParams;
    const page = Math.max(1, parseInt(sp.get('page')) || 1);
    const perPage = Math.min(100, Math.max(1, parseInt(sp.get('page_size')) || 24));

    const qs = new URLSearchParams({ page: String(page), per_page: String(perPage) });
    const search = (sp.get('search') || '').trim();
    const category = (sp.get('category') || '').trim();
    const sort = SORTS[sp.get('sort')];
    if (search) qs.set('q', search); // the CRM's search parameter is `q`
    if (category) qs.set('category', category);
    if (sort) qs.set('sort', sort);

    const res = await crm(`/products?${qs}`);
    return Response.json({
      success: true,
      data: (res.data || []).map(mapProduct),
      meta: {
        count: res.pagination?.total ?? 0,
        page: res.pagination?.page ?? page,
        page_size: res.pagination?.per_page ?? perPage,
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
