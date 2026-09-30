export async function onRequestGET(context) {
  return new Response(JSON.stringify({
    status: 'ok',
    timestamp: new Date().toISOString(),
    edge: 'Cloudflare D1'
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
