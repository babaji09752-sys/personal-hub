export async function onRequestPOST(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const stmt = env.DB.prepare(`
      INSERT INTO subtasks (todo_id, title, completed) 
      VALUES (?, ?, ?) RETURNING *
    `).bind(body.todo_id, body.title, body.completed ? 1 : 0);
    const result = await stmt.first();
    return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function onRequestPUT(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const body = await request.json();
    const stmt = env.DB.prepare(`
      UPDATE subtasks SET completed = ? WHERE id = ? RETURNING *
    `).bind(body.completed ? 1 : 0, id);
    const result = await stmt.first();
    return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function onRequestDELETE(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const stmt = env.DB.prepare(`DELETE FROM subtasks WHERE id = ? RETURNING id`).bind(id);
    const result = await stmt.first();
    return new Response(JSON.stringify({ success: true, deleted: result }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
