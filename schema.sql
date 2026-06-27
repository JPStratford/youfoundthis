CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY,
  text TEXT NOT NULL,
  origin_location TEXT NOT NULL,
  origin_date TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sightings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  note_id INTEGER NOT NULL,
  location TEXT NOT NULL,
  name TEXT,
  message TEXT,
  photo_key TEXT,
  lat REAL,
  lng REAL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (note_id) REFERENCES notes(id)
);