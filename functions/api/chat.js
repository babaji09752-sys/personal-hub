export async function onRequestGet(context) {
  try {
    const { env } = context;
    const stmt = env.DB.prepare(`SELECT * FROM chat_messages ORDER BY timestamp ASC LIMIT 50`);
    const { results } = await stmt.all();
    return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const stmt = env.DB.prepare(`
      INSERT INTO chat_messages (role, content, model, code_snippet) 
      VALUES (?, ?, ?, ?) RETURNING *
    `).bind(body.role, body.content, body.model, body.code_snippet);
    const result = await stmt.first();
    return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function onRequestDelete(context) {
  try {
    const { env } = context;
    const stmt = env.DB.prepare(`DELETE FROM chat_messages RETURNING id`);
    const { results } = await stmt.all();
    return new Response(JSON.stringify({ success: true, deleted: results.length }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
