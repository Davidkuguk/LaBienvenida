import { getStore } from '@netlify/blobs';
import type { Context } from '@netlify/functions';

const storeName = 'site-visitors';
const visitorIdPattern = /^[a-zA-Z0-9-]{16,80}$/;

async function getVisitorCount(): Promise<number> {
  const store = getStore({ name: storeName, consistency: 'strong' });
  const { blobs } = await store.list({ prefix: 'visitor-' });
  return blobs.length;
}

export default async (request: Request, _context: Context): Promise<Response> => {
  const store = getStore({ name: storeName, consistency: 'strong' });

  if (request.method === 'POST') {
    const body = (await request.json().catch(() => null)) as { visitorId?: string } | null;
    const visitorId = body?.visitorId;

    if (!visitorId || !visitorIdPattern.test(visitorId)) {
      return Response.json({ error: 'Identificador de visitante no válido' }, { status: 400 });
    }

    await store.set(`visitor-${visitorId}`, new Date().toISOString(), { onlyIfNew: true });
  } else if (request.method !== 'GET') {
    return new Response('Método no permitido', {
      status: 405,
      headers: { Allow: 'GET, POST' },
    });
  }

  return Response.json(
    { visitors: await getVisitorCount() },
    { headers: { 'Cache-Control': 'no-store' } },
  );
};
