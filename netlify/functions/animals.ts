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

function publicAnimal(animal: AnimalRecord): AnimalRecord {
  return {
    ...animal,
    photos: animal.photos.map(
      (_, index) => `/.netlify/functions/animals?id=${encodeURIComponent(animal.id)}&photo=${index}`,
    ),
  };
}

function catalogAnimal(animal: AnimalRecord) {
  const { id, name, species, age, ageUnit, sex, size, status, urgent, arrivalDate, photoFocusX, photoFocusY } = animal;
  return { id, name, species, age, ageUnit, sex, size, status, urgent, arrivalDate, photoFocusX, photoFocusY, photos: publicAnimal(animal).photos };
}

function photoResponse(photo: string | undefined): Response {
  if (!photo) return Response.json({ error: 'Foto no encontrada' }, { status: 404 });
  if (/^https?:\/\//i.test(photo)) return Response.redirect(photo, 302);

  const match = /^data:([^;,]+)(;base64)?,(.*)$/s.exec(photo);
  if (!match) return Response.json({ error: 'Formato de foto no válido' }, { status: 415 });

  try {
    const bytes = match[2]
      ? Uint8Array.from(atob(match[3]), (character) => character.charCodeAt(0))
      : new TextEncoder().encode(decodeURIComponent(match[3]));
    return new Response(bytes, {
      headers: {
        'Content-Type': match[1],
        'Cache-Control': 'public, max-age=3600, must-revalidate',
      },
    });
  } catch {
    return Response.json({ error: 'No se pudo leer la foto' }, { status: 500 });
  }
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
      animal.age! >= 0 &&
      (animal.ageUnit === undefined || animal.ageUnit === 'years' || animal.ageUnit === 'months') &&
      Array.isArray(animal.photos),
  );
}

export default async (request: Request, _context: Context): Promise<Response> => {
  const resource = new URL(request.url).searchParams.get('resource');
  if (request.method === 'GET') {
    if (resource === 'settings') return Response.json({ settings: ((await store().get(settingsKey, { type: 'json' })) as typeof defaultSettings | null) ?? defaultSettings });
    const animals = await readAnimals();
    const url = new URL(request.url);
    const trash = url.searchParams.get('trash') === 'true';
    if (trash && !(await isAuthenticated(request))) return Response.json({ error: 'Sesión de administración no válida' }, { status: 401 });
    const activeAnimals = animals.filter((animal) => trash ? Boolean(animal.deletedAt) : !animal.deletedAt);
    const id = url.searchParams.get('id');
    if (id && !trash) {
      const animal = activeAnimals.find((item) => item.id === id);
      if (!animal) return Response.json({ error: 'Animal no encontrado' }, { status: 404 });
      const photoIndex = url.searchParams.get('photo');
      if (photoIndex !== null) return photoResponse(animal.photos[Number(photoIndex)]);
      return Response.json({ animal: publicAnimal(animal) }, { headers: { 'Cache-Control': 'public, max-age=60, must-revalidate' } });
    }
    if (url.searchParams.get('view') === 'catalog') {
      const species = url.searchParams.get('species');
      const catalog = activeAnimals
        .filter((animal) => !species || species === 'all' || animal.species.toLowerCase() === species)
        .sort((left, right) => Number(Boolean(right.urgent)) - Number(Boolean(left.urgent)));
      const limitValue = Number(url.searchParams.get('limit'));
      const paginated = url.searchParams.has('limit');
      const limit = Number.isInteger(limitValue) && limitValue > 0 ? Math.min(limitValue, 50) : 10;
      const offsetValue = Number(url.searchParams.get('offset'));
      const offset = Number.isInteger(offsetValue) && offsetValue >= 0 ? offsetValue : 0;
      const page = paginated ? catalog.slice(offset, offset + limit) : catalog;
      return Response.json(
        { animals: page.map(catalogAnimal), total: catalog.length, hasMore: paginated && offset + page.length < catalog.length },
        { headers: { 'Cache-Control': 'public, max-age=60, must-revalidate' } },
      );
    }
    return Response.json({ animals: activeAnimals }, { headers: { 'Cache-Control': 'no-store' } });
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
