CREATE TABLE IF NOT EXISTS sighting_photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sighting_id INTEGER NOT NULL,
  photo_key TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (sighting_id) REFERENCES sightings(id)
);

INSERT INTO sighting_photos (sighting_id, photo_key)
SELECT id, photo_key FROM sightings WHERE photo_key IS NOT NULL;

ALTER TABLE sightings DROP COLUMN photo_key;