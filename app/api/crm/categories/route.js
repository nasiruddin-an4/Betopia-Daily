import { crm, mapCategory, errorResponse } from '@/lib/server/crm';

// The CRM category list has no product counts, so count each category with a
// 1-item product query. Cached briefly because the home page asks on every visit.
const TTL_MS = 60 * 1000;
let cached = null;

async function loadCategories() {
  const { data = [] } = await crm('/categories');
  const counts = await Promise.all(
    data.map((c) =>
      crm(`/products?per_page=1&category=${encodeURIComponent(c.slug)}`)
        .then((r) => r.pagination?.total ?? 0)
        .catch(() => null)
    )
  );
  return data.map((c, i) => mapCategory(c, counts[i]));
}

// GET /api/crm/categories
export async function GET() {
  try {
    if (!cached || cached.expires < Date.now()) {
      cached = { data: await loadCategories(), expires: Date.now() + TTL_MS };
    }
    return Response.json({ success: true, data: cached.data });
  } catch (err) {
    return errorResponse(err);
  }
}
