export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const pinned = url.searchParams.get('pinned');
    
    let query = `SELECT * FROM diary_entries`;
    if (pinned === '1') {
      query += ` WHERE is_pinned = 1`;
    }
    query += ` ORDER BY date DESC`;
    
    const { results } = await env.DB.prepare(query).all();
    const entries = (results || []).map((e) => {
      let tags = [];
      if (Array.isArray(e.tags)) {
        tags = e.tags;
      } else if (typeof e.tags === 'string') {
        try {
          tags = JSON.parse(e.tags);
        } catch {
          tags = e.tags.split(',').map((t) => t.trim()).filter(Boolean);
        }
      }
      return { ...e, tags };
    });
    return new Response(JSON.stringify(entries), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const stmt = env.DB.prepare(`
      INSERT INTO diary_entries (title, content, mood, weather, tags) 
      VALUES (?, ?, ?, ?, ?) RETURNING *
    `).bind(body.title, body.content, body.mood, body.weather, JSON.stringify(body.tags || []));
    const result = await stmt.first();
    return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function onRequestPut(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const body = await request.json();
    const stmt = env.DB.prepare(`
      UPDATE diary_entries SET title = ?, content = ?, mood = ?, weather = ?, tags = ?, is_pinned = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *
    `).bind(body.title, body.content, body.mood, body.weather, JSON.stringify(body.tags || []), body.is_pinned ? 1 : 0, id);
    const result = await stmt.first();
    return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function onRequestDelete(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const stmt = env.DB.prepare(`DELETE FROM diary_entries WHERE id = ? RETURNING id`).bind(id);
    const result = await stmt.first();
    return new Response(JSON.stringify({ success: true, deleted: result }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
