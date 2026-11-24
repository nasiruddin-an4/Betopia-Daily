// Verifies the signed-in employee on the server by asking Microsoft Graph who owns the
// SSO access token. The browser never gets to choose which email an order is placed under.
//
// Optional env:
//   ALLOWED_EMAIL_DOMAINS  comma-separated, e.g. "betopiagroup.com,betopia.com"

const CACHE_MS = 5 * 60 * 1000;
const cache = new Map(); // token -> { identity, expires }

export class AuthError extends Error {
  constructor(message, status = 401) {
    super(message);
    this.status = status;
  }
}

const allowedDomains = (process.env.ALLOWED_EMAIL_DOMAINS || '')
  .split(',')
  .map((d) => d.trim().toLowerCase())
  .filter(Boolean);

export async function getEmployee(request) {
  const header = request.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) throw new AuthError('Please sign in with Betopia SSO.');

  const cached = cache.get(token);
  if (cached && cached.expires > Date.now()) return cached.identity;

  const res = await fetch('https://graph.microsoft.com/v1.0/me?$select=id,displayName,mail,userPrincipalName,mobilePhone', {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) throw new AuthError('Your session has expired. Please sign in again.');

  const me = await res.json();
  const email = (me.mail || me.userPrincipalName || '').toLowerCase();
  if (!email) throw new AuthError('No email on this Microsoft account.', 403);

  if (allowedDomains.length && !allowedDomains.includes(email.split('@')[1])) {
    throw new AuthError('This account is not allowed to order.', 403);
  }

  const identity = { id: me.id, email, name: me.displayName || email.split('@')[0], phone: me.mobilePhone || '' };
  cache.set(token, { identity, expires: Date.now() + CACHE_MS });
  if (cache.size > 500) cache.delete(cache.keys().next().value);
  return identity;
}

export function authErrorResponse(err) {
  return Response.json({ success: false, message: err.message, data: null }, { status: err.status || 401 });
}
