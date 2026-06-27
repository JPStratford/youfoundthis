INSERT INTO notes (id, text, origin_location, origin_date) VALUES (
  29,
  'Hello friend, you found my note. In a world where we can connect more readily than ever, we aren''t reaching out to each other. This note was originally left in Venice, Italy - for you, or whoever found it first. Add something. Leave it somewhere. Visit youfoundthis.club/29 to see where it''s been.',
  'Venice, Italy',
  'January 2026'
);

INSERT INTO sightings (note_id, location, name, message, lat, lng) VALUES
  (29, 'Venice, Italy', null, null, 45.4308, 12.3308),
  (29, 'Bologna, Italy', 'Marco', 'Found this on a bench near the Two Towers. Wonderful idea.', 44.4949, 11.3426);