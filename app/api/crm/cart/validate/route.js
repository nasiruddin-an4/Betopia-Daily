import { crm, resolveLines, errorResponse } from '@/lib/server/crm';
import { getEmployee, AuthError, authErrorResponse } from '@/lib/server/msIdentity';

// POST /api/crm/cart/validate  { lines: [{ slug, variant_id?, quantity }], phone }
// Live prices, tax and totals from the CRM; nothing is saved.
export async function POST(request) {
  try {
    const employee = await getEmployee(request);
    const body = await request.json().catch(() => ({}));
    const lines = await resolveLines(body.lines);
    const phone = String(body.phone || employee.phone || '').trim().slice(0, 40);

    const res = await crm('/cart/validate', {
      method: 'POST',
      body: {
        lines,
        guest: { name: employee.name, email: employee.email, ...(phone ? { phone } : {}) },
        payment_method: 'cash',
      },
    });

    const d = res.data || {};
    return Response.json({
      success: true,
      data: { currency: d.currency, subtotal: Number(d.subtotal) || 0, tax: Number(d.tax) || 0, total: Number(d.total) || 0 },
    });
  } catch (err) {
    return err instanceof AuthError ? authErrorResponse(err) : errorResponse(err);
  }
}
