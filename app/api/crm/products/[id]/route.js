import { crm, mapProduct, errorResponse } from '@/lib/server/crm';

// GET /api/crm/products/:slug  (includes variants and live stock)
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const res = await crm(`/products/${encodeURIComponent(id)}`);
    return Response.json({ success: true, data: mapProduct(res.data) });
  } catch (err) {
    return errorResponse(err);
  }
}
