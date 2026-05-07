// Cloudflare Worker for the footer visitor counter.
//
// Deployment notes:
// 1. Create a Workers KV namespace and bind it as VISITOR_COUNTER.
// 2. Set ALLOWED_ORIGIN to your GitHub Pages origin, for example:
//    https://si3rraquack.github.io
// 3. Deploy this Worker, then paste its /visit URL into
//    index.html -> data-counter-endpoint.

export default {
  async fetch(request, env) {
    const corsOrigin = getCorsOrigin(request, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: getCorsHeaders(corsOrigin),
      });
    }

    const url = new URL(request.url);
    if (url.pathname !== '/visit') {
      return jsonResponse({ error: 'Not found' }, 404, corsOrigin);
    }

    if (request.method !== 'GET' && request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405, corsOrigin);
    }

    if (!env.VISITOR_COUNTER) {
      return jsonResponse({ error: 'VISITOR_COUNTER binding is missing' }, 500, corsOrigin);
    }

    const total = await incrementCounter(env.VISITOR_COUNTER, 'total');

    return jsonResponse({ total }, 200, corsOrigin);
  },
};

async function incrementCounter(store, key) {
  const current = Number.parseInt(await store.get(key), 10);
  const next = Number.isFinite(current) ? current + 1 : 1;
  await store.put(key, String(next));
  return next;
}

function getCorsOrigin(request, env) {
  const allowedOrigin = env.ALLOWED_ORIGIN || '*';
  if (allowedOrigin === '*') return '*';

  const requestOrigin = request.headers.get('Origin');
  return requestOrigin === allowedOrigin ? requestOrigin : allowedOrigin;
}

function getCorsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

function jsonResponse(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...getCorsHeaders(origin),
    },
  });
}
