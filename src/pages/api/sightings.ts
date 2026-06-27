import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const GET: APIRoute = async ({ request }) => {
  const db = env.DB;
  const url = new URL(request.url);
  const noteId = url.searchParams.get('note');

  if (!noteId) {
    return new Response(JSON.stringify({ error: 'Missing note ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const note = await db.prepare(
    'SELECT * FROM notes WHERE id = ?'
  ).bind(noteId).first();

  if (!note) {
    return new Response(JSON.stringify({ error: 'Note not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const sightings = await db.prepare(
    'SELECT * FROM sightings WHERE note_id = ? ORDER BY created_at ASC'
  ).bind(noteId).all();

  return new Response(JSON.stringify({ note, sightings: sightings.results }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request }) => {
  const db = env.DB;
  const photos = env.PHOTOS;
  const data = await request.formData();

  const noteId = data.get('note');
  const location = data.get('location');
  const name = data.get('name') || null;
  const message = data.get('message') || null;
  const lat = data.get('lat') || null;
  const lng = data.get('lng') || null;
  const photo = data.get('photo') as File | null;

  if (!noteId || !location) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Handle photo upload to R2
  let photoKey: string | null = null;

  if (photo && photo.size > 0) {
    if (photo.size > 5 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: 'Photo must be under 5MB' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const ext = photo.name.split('.').pop() || 'jpg';
    photoKey = `sightings/${noteId}/${crypto.randomUUID()}.${ext}`;

    await photos.put(photoKey, await photo.arrayBuffer(), {
      httpMetadata: { contentType: photo.type },
    });
  }

  await db.prepare(
    'INSERT INTO sightings (note_id, location, name, message, photo_key, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(noteId, location, name, message, photoKey, lat, lng).run();

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};