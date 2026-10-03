import { getStore } from '@netlify/blobs'

export default async (request: Request) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204 })
  }

  const store = getStore('cairn')

  if (request.method === 'GET') {
    const data = await store.get('state', { type: 'json' })
    return Response.json(data ?? null)
  }

  if (request.method === 'PUT') {
    const body = await request.json()
    await store.set('state', JSON.stringify(body), { metadata: { updatedAt: new Date().toISOString() } })
    return Response.json({ ok: true })
  }

  return new Response('Method not allowed', { status: 405 })
}

export const config = {
  path: '/api/state',
}
