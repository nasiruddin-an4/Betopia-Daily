import { crm } from '@/lib/server/crm';

// GET /api/crm/images/product/37 | category/15 | variant/38
// CRM images require the store key, so the browser loads them through here.
export async function GET(request, { params }) {
  const { path } = await params;
  const [kind, id] = path || [];
  if (path?.length !== 2 || !['product', 'category', 'variant'].includes(kind) || !/^\d+$/.test(id)) {
    return new Response(null, { status: 404 });
  }

  try {
    const res = await crm(`/images/${kind}/${id}`, { raw: true });
    const type = res.headers.get('content-type') || 'application/octet-stream';
    if (!type.startsWith('image/')) return new Response(null, { status: 404 });

    return new Response(res.body, {
      headers: {
        'Content-Type': type,
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        // SVGs could carry script; never let them run
        'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
