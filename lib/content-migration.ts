import legacy from '../content/legacy-slots.json';
// This explicit historical map is immutable. Never derive it from current section order.
export const contentSetupSql=[
 "CREATE TABLE IF NOT EXISTS content_state (id INTEGER PRIMARY KEY, revision INTEGER NOT NULL DEFAULT 0, values_json TEXT NOT NULL DEFAULT '{}', previous_json TEXT, updated_at TEXT NOT NULL DEFAULT '')",
 'CREATE TABLE IF NOT EXISTS content_migration (name TEXT PRIMARY KEY NOT NULL)',
 "INSERT OR IGNORE INTO content_state (id,values_json) SELECT 1,json_object('contact.direct.email',contact_email,'contact.direct.location',location,'contact.direct.linkedin',linkedin) FROM settings WHERE id=1",
 "INSERT OR IGNORE INTO content_state (id,values_json) VALUES (1,'{}')",
];
export const slotMigrationSql=[
 ...legacy.map(({old,new:key})=>`INSERT OR IGNORE INTO placements (slot,media_id,updated_at) SELECT '${key}',media_id,updated_at FROM placements WHERE slot='${old}' AND NOT EXISTS (SELECT 1 FROM content_migration WHERE name='semantic_slots_v1')`),
 `DELETE FROM placements WHERE slot IN (${[...new Set(legacy.map(s=>s.old))].map(s=>`'${s}'`).join(',')}) AND NOT EXISTS (SELECT 1 FROM content_migration WHERE name='semantic_slots_v1')`,
 "INSERT OR IGNORE INTO content_migration (name) VALUES ('semantic_slots_v1')",
];
