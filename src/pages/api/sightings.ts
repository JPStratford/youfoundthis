import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { getSightingsForNote } from '../../lib/sightings';

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

  const sightings = await getSightingsForNote(db, noteId);

  return new Response(JSON.stringify({ note, sightings }), {
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
  const photoFiles = data.getAll('photos') as File[];

  if (!noteId || !location) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  for (const file of photoFiles) {
    if (file && file.size > 5 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: 'Each photo must be under 5MB' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  const insertResult = await db.prepare(
    'INSERT INTO sightings (note_id, location, name, message, lat, lng) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(noteId, location, name, message, lat, lng).run();

  const sightingId = insertResult.meta.last_row_id;

  for (const file of photoFiles) {
    if (!file || file.size === 0) continue;

    const ext = file.name.split('.').pop() || 'jpg';
    const photoKey = `sightings/${noteId}/${crypto.randomUUID()}.${ext}`;

    await photos.put(photoKey, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type },
    });

    await db.prepare(
      'INSERT INTO sighting_photos (sighting_id, photo_key) VALUES (?, ?)'
    ).bind(sightingId, photoKey).run();
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};