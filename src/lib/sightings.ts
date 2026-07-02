export interface SightingWithPhotos {
  id: number;
  note_id: number;
  location: string;
  name: string | null;
  message: string | null;
  lat: number | null;
  lng: number | null;
  created_at: string | null;
  photos: string[];
}

export async function getSightingsForNote(db: any, noteId: string | number): Promise<SightingWithPhotos[]> {
  const result = await db.prepare(
    `SELECT sightings.id, sightings.note_id, sightings.location, sightings.name,
            sightings.message, sightings.lat, sightings.lng, sightings.created_at,
            sighting_photos.photo_key
     FROM sightings
     LEFT JOIN sighting_photos ON sighting_photos.sighting_id = sightings.id
     WHERE sightings.note_id = ?
     ORDER BY sightings.created_at ASC, sighting_photos.id ASC`
  ).bind(noteId).all();

  const rows = result.results as any[];
  const sightingsMap = new Map<number, SightingWithPhotos>();

  for (const row of rows) {
    if (!sightingsMap.has(row.id)) {
      sightingsMap.set(row.id, {
        id: row.id,
        note_id: row.note_id,
        location: row.location,
        name: row.name,
        message: row.message,
        lat: row.lat,
        lng: row.lng,
        created_at: row.created_at,
        photos: [],
      });
    }
    if (row.photo_key) {
      sightingsMap.get(row.id)!.photos.push(row.photo_key);
    }
  }

  return Array.from(sightingsMap.values());
}