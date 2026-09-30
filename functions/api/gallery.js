export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    
    let stmt;
    if (category) {
      stmt = env.DB.prepare(`SELECT * FROM gallery_photos WHERE category = ? ORDER BY date DESC`).bind(category);
    } else {
      stmt = env.DB.prepare(`SELECT * FROM gallery_photos ORDER BY date DESC`);
    }
    
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
      INSERT INTO gallery_photos (title, url, category, camera, shutter, colors) 
      VALUES (?, ?, ?, ?, ?, ?) RETURNING *
    `).bind(body.title, body.url, body.category, body.camera, body.shutter, JSON.stringify(body.colors || []));
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
    
    let stmt;
    if (body.action === 'like') {
      stmt = env.DB.prepare(`UPDATE gallery_photos SET likes = likes + 1 WHERE id = ? RETURNING *`).bind(id);
    } else if (body.action === 'favorite') {
      stmt = env.DB.prepare(`UPDATE gallery_photos SET is_favorite = ? WHERE id = ? RETURNING *`).bind(body.is_favorite ? 1 : 0, id);
    } else {
      stmt = env.DB.prepare(`UPDATE gallery_photos SET title = ?, url = ?, category = ?, camera = ?, shutter = ?, colors = ? WHERE id = ? RETURNING *`)
        .bind(body.title, body.url, body.category, body.camera, body.shutter, JSON.stringify(body.colors || []), id);
    }
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
    const stmt = env.DB.prepare(`DELETE FROM gallery_photos WHERE id = ? RETURNING id`).bind(id);
    const result = await stmt.first();
    return new Response(JSON.stringify({ success: true, deleted: result }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
