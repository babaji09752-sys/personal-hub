export async function onRequest(context) {
  return new Response(JSON.stringify({
    status: 'ok',
    timestamp: new Date().toISOString(),
    edge: 'Cloudflare D1',
    connected: true
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
