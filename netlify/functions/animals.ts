import { getStore } from '@netlify/blobs';
import type { Context } from '@netlify/functions';
import { initialAnimals, type AnimalRecord } from '../lib/animals';

const store = () => getStore({ name: 'shelter-data', consistency: 'strong' });
const key = 'animals';
const settingsKey = 'shelter-settings';
const defaultSettings = { name: 'La Bienvenida', email: 'petercanespejos@gmail.com', phone: '', address: '', hours: '', instagram: '', facebook: '' };
const cookieName = 'la_bienvenida_admin';
const encoder = new TextEncoder();

function fromBase64Url(value: string): Uint8Array {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function isAuthenticated(request: Request): Promise<boolean> {
  const secret = process.env['ADMIN_PASSWORD']?.trim().normalize('NFC');
  const token = request.headers.get('cookie')?.match(new RegExp(`(?:^|;\\s*)${cookieName}=([^;]+)`))?.[1];
  if (!secret || !token) return false;
  const [expiresAt, signature] = token.split('.');
  if (!expiresAt || !signature || Number(expiresAt) <= Date.now()) return false;
  try {
    const signingKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    );
    return crypto.subtle.verify(
      'HMAC',
      signingKey,
      fromBase64Url(signature),
      encoder.encode(`admin:${expiresAt}`),
    );
  } catch {
    return false;
  }
}

async function readAnimals(): Promise<AnimalRecord[]> {
  const current = await store().get(key, { type: 'json' });
  if (Array.isArray(current)) return current as AnimalRecord[];
  await store().setJSON(key, initialAnimals, { onlyIfNew: true });
  return ((await store().get(key, { type: 'json' })) as AnimalRecord[] | null) ?? initialAnimals;
}

function validAnimal(value: unknown): value is AnimalRecord {
  if (!value || typeof value !== 'object') return false;
  const animal = value as Partial<AnimalRecord>;
  return Boolean(
    animal.id &&
      animal.name?.trim() &&
      animal.species?.trim() &&
      animal.breed?.trim() &&
      Number.isFinite(animal.age) &&
      Array.isArray(animal.photos),
  );
}

export default async (request: Request, _context: Context): Promise<Response> => {
  const resource = new URL(request.url).searchParams.get('resource');
  if (request.method === 'GET') {
    if (resource === 'settings') return Response.json({ settings: ((await store().get(settingsKey, { type: 'json' })) as typeof defaultSettings | null) ?? defaultSettings });
    const animals = await readAnimals();
    const trash = new URL(request.url).searchParams.get('trash') === 'true';
    if (trash && !(await isAuthenticated(request))) return Response.json({ error: 'Sesión de administración no válida' }, { status: 401 });
    return Response.json({ animals: animals.filter((animal) => trash ? Boolean(animal.deletedAt) : !animal.deletedAt) }, { headers: { 'Cache-Control': 'no-store' } });
  }
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    return new Response('Método no permitido', { status: 405, headers: { Allow: 'GET, POST, PUT, PATCH, DELETE' } });
  }
  if (!(await isAuthenticated(request))) {
    return Response.json({ error: 'Sesión de administración no válida' }, { status: 401 });
  }

  const animals = await readAnimals();
  if (request.method === 'PATCH') {
    const id = new URL(request.url).searchParams.get('id');
    if (!id || !animals.some((animal) => animal.id === id && animal.deletedAt)) return Response.json({ error: 'Animal no encontrado' }, { status: 404 });
    const updated = animals.map((animal) => animal.id === id ? { ...animal, deletedAt: undefined } : animal);
    await store().setJSON(key, updated);
    return Response.json({ animals: updated.filter((animal) => !animal.deletedAt) });
  }

  if (resource === 'settings' && request.method === 'PUT') {
    const input = await request.json().catch(() => null) as Partial<typeof defaultSettings> | null;
    if (!input?.name?.trim() || !input.email?.trim()) return Response.json({ error: 'Nombre y correo son obligatorios.' }, { status: 400 });
    const settings = { ...defaultSettings, ...input, name: input.name.trim(), email: input.email.trim() };
    await store().setJSON(settingsKey, settings);
    return Response.json({ settings });
  }
  if (request.method === 'DELETE') {
    const id = new URL(request.url).searchParams.get('id');
    if (!id || !animals.some((animal) => animal.id === id)) {
      return Response.json({ error: 'Animal no encontrado' }, { status: 404 });
    }
    const updated = animals.map((animal) => animal.id === id ? { ...animal, deletedAt: new Date().toISOString() } : animal);
    await store().setJSON(key, updated);
    return Response.json({ animals: updated.filter((animal) => !animal.deletedAt) });
  }

  const animal = await request.json().catch(() => null);
  if (!validAnimal(animal)) {
    return Response.json({ error: 'Los datos del animal no son válidos' }, { status: 400 });
  }
  const exists = animals.some((current) => current.id === animal.id);
  if (request.method === 'POST' && exists) {
    return Response.json({ error: 'Ya existe un animal con ese identificador' }, { status: 409 });
  }
  if (request.method === 'PUT' && !exists) {
    return Response.json({ error: 'Animal no encontrado' }, { status: 404 });
  }
  const updated =
    request.method === 'POST'
      ? [animal, ...animals]
      : animals.map((current) => (current.id === animal.id ? animal : current));
  await store().setJSON(key, updated);
  return Response.json({ animals: updated });
};
