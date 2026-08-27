import { getStore } from '@netlify/blobs';
import type { Context } from '@netlify/functions';

type FosterStatus = 'pending' | 'active' | 'finished';
interface Foster { id: string; animalId: string; animalName: string; carerName: string; phone: string; email: string; address: string; startDate: string; endDate: string; status: FosterStatus; notes: string; }
const store = () => getStore({ name: 'shelter-data', consistency: 'strong' });
const key = 'fosters';
const cookieName = 'la_bienvenida_admin';
const encoder = new TextEncoder();

async function authenticated(request: Request): Promise<boolean> {
  const secret = process.env['ADMIN_PASSWORD']?.trim().normalize('NFC');
  const token = request.headers.get('cookie')?.match(new RegExp(`(?:^|;\\s*)${cookieName}=([^;]+)`))?.[1];
  if (!secret || !token) return false;
  const [expiresAt, signature] = token.split('.');
  if (!expiresAt || !signature || Number(expiresAt) <= Date.now()) return false;
  try {
    const signingKey = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const value = signature.replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(value.padEnd(Math.ceil(value.length / 4) * 4, '=')), (character) => character.charCodeAt(0));
    return crypto.subtle.verify('HMAC', signingKey, bytes, encoder.encode(`admin:${expiresAt}`));
  } catch { return false; }
}

export default async (request: Request, _context: Context): Promise<Response> => {
  if (!(await authenticated(request))) return Response.json({ error: 'Sesión de administración no válida' }, { status: 401 });
  const fosters = ((await store().get(key, { type: 'json' })) as Foster[] | null) ?? [];
  if (request.method === 'GET') return Response.json({ fosters });
  if (!['POST', 'PUT'].includes(request.method)) return new Response('Método no permitido', { status: 405, headers: { Allow: 'GET, POST, PUT' } });
  const body = await request.json().catch(() => null) as Partial<Foster> | null;
  if (!body?.animalId || !body.carerName?.trim() || !body.phone?.trim() || !body.address?.trim() || !body.startDate || !body.status) return Response.json({ error: 'Completa los campos obligatorios de la acogida.' }, { status: 400 });
  const record: Foster = { id: body.id || crypto.randomUUID(), animalId: body.animalId, animalName: body.animalName || '', carerName: body.carerName.trim(), phone: body.phone.trim(), email: body.email?.trim() || '', address: body.address.trim(), startDate: body.startDate, endDate: body.endDate || '', status: body.status, notes: body.notes?.trim() || '' };
  const exists = fosters.some((foster) => foster.id === record.id);
  if (request.method === 'PUT' && !exists) return Response.json({ error: 'Acogida no encontrada' }, { status: 404 });
  const updated = request.method === 'POST' ? [record, ...fosters] : fosters.map((foster) => foster.id === record.id ? record : foster);
  await store().setJSON(key, updated);
  return Response.json({ fosters: updated });
};
