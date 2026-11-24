import { randomUUID } from 'node:crypto';
import { crm, mapOrder, resolveLines, errorResponse, CrmError } from '@/lib/server/crm';
import { getEmployee, AuthError, authErrorResponse } from '@/lib/server/msIdentity';

const IDEMPOTENCY_RE = /^[A-Za-z0-9_-]{8,128}$/;

// POST /api/crm/orders  { lines: [{ slug, variant_id?, quantity }], phone, idempotency_key }
// Places a cash order in the CRM as a guest order under the SSO-verified employee.
// The CRM holds the quantity immediately; its team confirms and processes the order.
export async function POST(request) {
  try {
    const employee = await getEmployee(request);
    const body = await request.json().catch(() => ({}));

    const phone = String(body.phone || employee.phone || '').trim().slice(0, 40);
    if (!phone) throw new CrmError('Please add your phone number before placing an order.', 400, 'phone_required');

    const lines = await resolveLines(body.lines);
    const idempotencyKey = IDEMPOTENCY_RE.test(body.idempotency_key || '') ? body.idempotency_key : `bd-${randomUUID()}`;

    const res = await crm('/orders', {
      method: 'POST',
      headers: { 'Idempotency-Key': idempotencyKey },
      body: {
        lines,
        guest: { name: employee.name, email: employee.email, phone },
        payment_method: 'cash',
      },
    });

    // The phone is needed later to look the order up again
    return Response.json({ success: true, data: { ...mapOrder(res.data), lookup_phone: phone } }, { status: 201 });
  } catch (err) {
    return err instanceof AuthError ? authErrorResponse(err) : errorResponse(err);
  }
}
