import type { Config, Context } from '@netlify/edge-functions';

const cookieName = 'la_bienvenida_admin';
const sessionDurationMs = 24 * 60 * 60 * 1000;
const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(value: string): ArrayBuffer {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0)).buffer;
}

async function getSigningKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

async function createSession(secret: string): Promise<{ token: string; expires: Date }> {
  const expires = new Date(Date.now() + sessionDurationMs);
  const expiresAt = expires.getTime().toString();
  const key = await getSigningKey(secret);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(`admin:${expiresAt}`));
  return {
    token: `${expiresAt}.${toBase64Url(new Uint8Array(signature))}`,
    expires,
  };
}

async function isValidSession(token: string | undefined, secret: string): Promise<boolean> {
  if (!token) {
    return false;
  }

  const [expiresAt, signature] = token.split('.');
  const expiration = Number(expiresAt);
  if (!expiresAt || !signature || !Number.isFinite(expiration) || expiration <= Date.now()) {
    return false;
  }

  try {
    const key = await getSigningKey(secret);
    return await crypto.subtle.verify(
      'HMAC',
      key,
      fromBase64Url(signature),
      encoder.encode(`admin:${expiresAt}`),
    );
  } catch {
    return false;
  }
}

function secureEqual(left: string, right: string): boolean {
  const leftBytes = encoder.encode(left);
  const rightBytes = encoder.encode(right);
  const length = Math.max(leftBytes.length, rightBytes.length);
  let difference = leftBytes.length ^ rightBytes.length;

  for (let index = 0; index < length; index += 1) {
    difference |= (leftBytes[index] ?? 0) ^ (rightBytes[index] ?? 0);
  }

  return difference === 0;
}

function loginPage(error = '', status = 200): Response {
  const errorMessage = error
    ? `<p class="error" role="alert">${error}</p>`
    : '<p class="hint">Introduce la contraseña compartida de administración.</p>';

  return new Response(
    `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <title>Acceso de administración · La Bienvenida</title>
  <style>
    :root{--ink:#16332d;--green:#1f5548;--cream:#f5f0e6;--orange:#e96b3b;--paper:#fffdf8}
    *{box-sizing:border-box}
    body{min-height:100vh;margin:0;display:grid;place-items:center;padding:24px;color:var(--ink);background:var(--cream);font-family:Arial,sans-serif}
    main{width:min(440px,100%);padding:42px;border:1px solid #d8d1c4;background:var(--paper);box-shadow:0 24px 60px rgb(22 51 45 / 12%)}
    .brand{display:flex;align-items:center;gap:14px;margin-bottom:34px}
    .brand img{width:64px;height:64px;border-radius:50%}
    .brand strong,.brand span{display:block}.brand strong{font-family:Georgia,serif;font-size:22px}.brand span{margin-top:3px;color:#66756f;font-size:11px;text-transform:uppercase;letter-spacing:1.3px}
    .eyebrow{color:var(--orange);font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1.8px}
    h1{margin:12px 0 10px;font-family:Georgia,serif;font-size:38px;line-height:1.05}
    .hint,.error{margin:0 0 24px;line-height:1.5}.hint{color:#65736d}.error{padding:11px 13px;color:#8b342d;background:#f9e0d8}
    label{display:grid;gap:8px;font-size:13px;font-weight:750}
    input{width:100%;height:48px;border:1px solid #c9c3b7;padding:0 13px;color:var(--ink);background:#fff;font:inherit;outline:none}
    input:focus{border-color:var(--orange);box-shadow:0 0 0 3px rgb(233 107 59 / 14%)}
    button{width:100%;height:48px;margin-top:18px;border:0;color:#fff;background:var(--orange);font:700 15px Arial,sans-serif;cursor:pointer}
    button:hover{background:#cc5127}
    a{display:block;margin-top:22px;color:var(--green);font-size:13px;text-align:center}
    @media(max-width:520px){main{padding:30px 24px}h1{font-size:32px}}
  </style>
</head>
<body>
  <main>
    <div class="brand">
      <img src="/protectora-la-bienvenida-netlify/assets/logo-la-bienvenida.svg" alt="">
      <div><strong>La Bienvenida</strong><span>Protectora de animales</span></div>
    </div>
    <span class="eyebrow">Área privada</span>
    <h1>Acceso al dashboard</h1>
    ${errorMessage}
    <form method="post" action="/admin">
      <label>Contraseña
        <input name="password" type="password" autocomplete="current-password" required autofocus>
      </label>
      <button type="submit">Acceder</button>
    </form>
    <a href="/">Volver a la web pública</a>
  </main>
</body>
</html>`,
    {
      status,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Frame-Options': 'DENY',
        'Referrer-Policy': 'no-referrer',
        'X-Content-Type-Options': 'nosniff',
      },
    },
  );
}

export default async (request: Request, context: Context): Promise<Response | void> => {
  const password = Netlify.env.get('ADMIN_PASSWORD');

  if (!password) {
    return loginPage('El acceso todavía no está configurado en Netlify.', 503);
  }

  const url = new URL(request.url);

  if (url.pathname === '/admin/logout') {
    context.cookies.delete({ name: cookieName, path: '/admin' });
    return Response.redirect(new URL('/admin', request.url), 303);
  }

  const authenticated = await isValidSession(context.cookies.get(cookieName), password);
  if (authenticated) {
    return;
  }

  if (request.method === 'POST') {
    const form = await request.formData();
    const submittedPassword = String(form.get('password') ?? '');

    if (secureEqual(submittedPassword, password)) {
      const session = await createSession(password);
      context.cookies.set({
        name: cookieName,
        value: session.token,
        path: '/admin',
        expires: session.expires,
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
      });
      return Response.redirect(new URL('/admin', request.url), 303);
    }

    return loginPage('La contraseña no es correcta.', 401);
  }

  return loginPage();
};

export const config: Config = {
  path: ['/admin', '/admin/*'],
};
