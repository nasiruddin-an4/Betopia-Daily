import { crm, mapOrder, errorResponse } from '@/lib/server/crm';
import { getEmployee, AuthError, authErrorResponse } from '@/lib/server/msIdentity';

const MAX_ORDERS = 50;

// POST /api/crm/orders/lookup  { orders: [{ reference, phone }] }
// Guest orders can only be read back by reference + phone, so the browser keeps
// the references of the orders it placed and refreshes their status here.
export async function POST(request) {
  try {
    await getEmployee(request);
    const body = await request.json().catch(() => ({}));
    const wanted = (Array.isArray(body.orders) ? body.orders : [])
      .filter((o) => typeof o?.reference === 'string' && typeof o?.phone === 'string')
      .slice(0, MAX_ORDERS);

    const results = await Promise.all(
      wanted.map((o) =>
        crm('/orders/lookup', { method: 'POST', body: { reference: o.reference, phone: o.phone } })
          .then((r) => mapOrder(r.data))
          .catch((err) => (err.status === 404 ? null : Promise.reject(err)))
      )
    );

    const orders = results.filter(Boolean).sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
    return Response.json({ success: true, data: orders });
  } catch (err) {
    return err instanceof AuthError ? authErrorResponse(err) : errorResponse(err);
  }
}
