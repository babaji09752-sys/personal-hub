export async function onRequestGet(context) {
  try {
    const { env } = context;
    const stmt = env.DB.prepare(`
      SELECT t.*, json_group_array(
        json_object('id', s.id, 'title', s.title, 'completed', s.completed)
      ) as subtasks
      FROM todos t
      LEFT JOIN subtasks s ON t.id = s.todo_id
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `);
    const { results } = await stmt.all();
    
    // Parse the subtasks JSON string back to an array
    const todos = results.map(t => {
      let subtasks = [];
      if (t.subtasks) {
        const parsed = JSON.parse(t.subtasks);
        // filter out nulls produced by LEFT JOIN if no subtasks exist
        subtasks = parsed.filter(s => s.id !== null);
      }
      return { ...t, subtasks };
    });

    return new Response(JSON.stringify(todos), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    
    const stmt = env.DB.prepare(`
      INSERT INTO todos (title, category, priority, due_date, completed) 
      VALUES (?, ?, ?, ?, ?) RETURNING *
    `).bind(
      body.title || '',
      body.category || 'inbox',
      body.priority || 'medium',
      body.due_date || null,
      body.completed ? 1 : 0
    );
    
    const result = await stmt.first();
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });
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
      UPDATE todos 
      SET title = ?, category = ?, priority = ?, due_date = ?, completed = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? RETURNING *
    `).bind(
      body.title,
      body.category,
      body.priority,
      body.due_date,
      body.completed ? 1 : 0,
      id
    );
    
    const result = await stmt.first();
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function onRequestDelete(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    const stmt = env.DB.prepare(`DELETE FROM todos WHERE id = ? RETURNING id`).bind(id);
    const result = await stmt.first();
    
    return new Response(JSON.stringify({ success: true, deleted: result }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
