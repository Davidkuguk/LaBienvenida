import { getStore } from '@netlify/blobs';
import type { Context } from '@netlify/functions';

type RequestStatus = 'new' | 'contacted' | 'visit' | 'approved' | 'closed';
interface AdoptionRequest { id: string; animalId: string; animalName: string; name: string; email: string; phone: string; message: string; status: RequestStatus; createdAt: string; }

const store = () => getStore({ name: 'shelter-data', consistency: 'strong' });
const key = 'adoption-requests';
const cookieName = 'la_bienvenida_admin';
const encoder = new TextEncoder();

async function authenticated(request: Request): Promise<boolean> {
  const secret = process.env['ADMIN_PASSWORD']?.trim().normalize('NFC');
  const token = request.headers.get('cookie')?.match(new RegExp(`(?:^|;\\s*)${cookieName}=([^;]+)`))?.[1];
  if (!secret || !token) return false;
  const [expiresAt, signature] = token.split('.');
  if (!expiresAt || !signature || Number(expiresAt) <= Date.now()) return false;
  try {
    const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const normalized = signature.replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')), (character) => character.charCodeAt(0));
    return crypto.subtle.verify('HMAC', key, bytes, encoder.encode(`admin:${expiresAt}`));
  } catch { return false; }
}

async function read(): Promise<AdoptionRequest[]> { return ((await store().get(key, { type: 'json' })) as AdoptionRequest[] | null) ?? []; }
const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });

export default async (request: Request, _context: Context): Promise<Response> => {
  if (request.method === 'POST') {
    const body = await request.json().catch(() => null) as Partial<AdoptionRequest> | null;
    if (!body?.animalId?.trim() || !body.animalName?.trim() || !body.name?.trim() || !body.email?.trim() || !body.phone?.trim() || !body.message?.trim()) return json({ error: 'Completa todos los campos.' }, 400);
    if (!/^\S+@\S+\.\S+$/.test(body.email.trim())) return json({ error: 'Introduce un correo válido.' }, 400);
    const requests = await read();
    const animalId = body.animalId.trim();
    const email = body.email.trim().toLocaleLowerCase();
    const now = new Date().toISOString();
    const matching = requests.filter((item) => item.animalId === animalId && item.email.trim().toLocaleLowerCase() === email);
    const existing = matching.sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())[0];
    const item: AdoptionRequest = existing
      ? { ...existing, animalName: body.animalName.trim(), name: body.name.trim(), email, phone: body.phone.trim(), message: body.message.trim(), createdAt: now }
      : { id: crypto.randomUUID(), animalId, animalName: body.animalName.trim(), name: body.name.trim(), email, phone: body.phone.trim(), message: body.message.trim(), status: 'new', createdAt: now };
    // También limpia posibles duplicados antiguos del mismo correo para este animal.
    const updated = [item, ...requests.filter((candidate) => !matching.includes(candidate))];
    await store().setJSON(key, updated);
    return json({ request: item, updated: Boolean(existing) }, existing ? 200 : 201);
  }
  if (!(await authenticated(request))) return json({ error: 'Sesión de administración no válida' }, 401);
  const requests = await read();
  if (request.method === 'GET') return json({ requests });
  if (request.method === 'PUT') {
    const body = await request.json().catch(() => null) as Partial<AdoptionRequest> | null;
    const statuses: RequestStatus[] = ['new', 'contacted', 'visit', 'approved', 'closed'];
    if (!body?.id || !body.status || !statuses.includes(body.status)) return json({ error: 'Solicitud no válida' }, 400);
    if (!requests.some((item) => item.id === body.id)) return json({ error: 'Solicitud no encontrada' }, 404);
    const updated = requests.map((item) => item.id === body.id ? { ...item, status: body.status as RequestStatus } : item);
    await store().setJSON(key, updated);
    return json({ requests: updated });
  }
  return new Response('Método no permitido', { status: 405, headers: { Allow: 'GET, POST, PUT' } });
};
