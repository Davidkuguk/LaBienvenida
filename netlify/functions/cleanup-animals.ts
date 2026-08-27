import { getStore } from '@netlify/blobs';
import type { Config, Context } from '@netlify/functions';
import type { AnimalRecord } from '../lib/animals';

const retentionMs = 48 * 60 * 60 * 1000;

export default async (_request: Request, _context: Context): Promise<Response> => {
  const store = getStore({ name: 'shelter-data', consistency: 'strong' });
  const animals = ((await store.get('animals', { type: 'json' })) as AnimalRecord[] | null) ?? [];
  const cutoff = Date.now() - retentionMs;
  const retained = animals.filter((animal) => !animal.deletedAt || new Date(animal.deletedAt).getTime() > cutoff);
  if (retained.length !== animals.length) await store.setJSON('animals', retained);
  return Response.json({ removed: animals.length - retained.length });
};

export const config: Config = { schedule: '0 * * * *' };
