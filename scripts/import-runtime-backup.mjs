#!/usr/bin/env node
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

function parseArgs(argv) {
  const options = {
    inputDir: '',
    outDir: path.resolve('outputs', `migration-import-${Date.now()}`),
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--input') options.inputDir = path.resolve(argv[++i] || '');
    else if (arg === '--out') options.outDir = path.resolve(argv[++i] || options.outDir);
    else if (arg === '--help') {
      options.help = true;
      return options;
    } else throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function usage() {
  console.log(
    [
      'Usage:',
      '  node scripts/import-runtime-backup.mjs --input backups/sites-export-... --out outputs/migration-plan',
      '',
      'This command is local-only planning. It does not contact Cloudflare.',
      'It generates SQL and an upload plan for a future intentional staging import.',
    ].join('\n'),
  );
}

function toSqlText(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function valuesFromContentState(contentState) {
  const entries = Array.isArray(contentState.entries) ? contentState.entries : [];
  const values = {};

  for (const entry of entries) {
    if (!entry || entry.slot || !entry.editable) continue;
    values[entry.id] = typeof entry.value === 'string' ? entry.value : '';
  }

  return values;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) return usage();
  if (!options.inputDir) throw new Error('Missing --input directory.');

  const manifest = JSON.parse(
    await readFile(path.join(options.inputDir, 'manifest.json'), 'utf8'),
  );
  const mediaPayload = JSON.parse(
    await readFile(path.join(options.inputDir, 'studio-media.json'), 'utf8'),
  );
  const contentState = JSON.parse(
    await readFile(path.join(options.inputDir, 'content-state.json'), 'utf8'),
  );

  const manifestMedia = Array.isArray(manifest.media) ? manifest.media : [];
  const media = Array.isArray(mediaPayload.media) ? mediaPayload.media : [];
  const placements = Array.isArray(mediaPayload.placements) ? mediaPayload.placements : [];

  const values = valuesFromContentState(contentState);
  const revision = Number.isFinite(contentState.revision) ? contentState.revision : 0;

  await mkdir(options.outDir, { recursive: true });

  const checks = {
    failed_downloads: manifestMedia.filter((m) => m.status === 'failed').map((m) => m.id),
    zero_byte_files: manifestMedia.filter((m) => m.status === 'zero-byte').map((m) => m.id),
    byte_mismatches: manifestMedia.filter((m) => m.status === 'byte-mismatch').map((m) => m.id),
    duplicate_manifest_ids: manifest.summary?.duplicate_ids || [],
    media_records: media.length,
    placement_records: placements.length,
  };

  const createTablesSql = [
    'CREATE TABLE IF NOT EXISTS studio_owner (id INTEGER PRIMARY KEY, user_id TEXT NOT NULL, created_at TEXT NOT NULL);',
    "CREATE TABLE IF NOT EXISTS media (id TEXT PRIMARY KEY NOT NULL, object_key TEXT NOT NULL UNIQUE, filename TEXT NOT NULL, mime TEXT NOT NULL, bytes INTEGER NOT NULL, alt TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL);",
    'CREATE TABLE IF NOT EXISTS placements (slot TEXT PRIMARY KEY NOT NULL, media_id TEXT NOT NULL REFERENCES media(id), updated_at TEXT NOT NULL);',
    "CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY, contact_email TEXT NOT NULL DEFAULT '', location TEXT NOT NULL DEFAULT '', linkedin TEXT NOT NULL DEFAULT '');",
    "CREATE TABLE IF NOT EXISTS content_state (id INTEGER PRIMARY KEY NOT NULL, revision INTEGER NOT NULL DEFAULT 0, values_json TEXT NOT NULL DEFAULT '{}', previous_json TEXT, updated_at TEXT NOT NULL DEFAULT '');",
    'CREATE TABLE IF NOT EXISTS content_migration (name TEXT PRIMARY KEY NOT NULL);',
  ];

  const mediaSql = media.map((m) =>
    `INSERT INTO media (id, object_key, filename, mime, bytes, alt, created_at) VALUES (${toSqlText(m.id)}, ${toSqlText(m.object_key)}, ${toSqlText(m.filename)}, ${toSqlText(m.mime)}, ${Number(m.bytes || 0)}, ${toSqlText(m.alt || '')}, ${toSqlText(m.created_at || new Date().toISOString())}) ON CONFLICT(id) DO UPDATE SET object_key=excluded.object_key, filename=excluded.filename, mime=excluded.mime, bytes=excluded.bytes, alt=excluded.alt, created_at=excluded.created_at;`,
  );

  const placementSql = placements.map((p) =>
    `INSERT INTO placements (slot, media_id, updated_at) VALUES (${toSqlText(p.slot)}, ${toSqlText(p.media_id)}, ${toSqlText(new Date().toISOString())}) ON CONFLICT(slot) DO UPDATE SET media_id=excluded.media_id, updated_at=excluded.updated_at;`,
  );

  const settings = {
    contact_email: values['contact.direct.email'] || '',
    location: values['contact.direct.location'] || '',
    linkedin: values['contact.direct.linkedin'] || '',
  };

  const stateSql = [
    `INSERT INTO settings (id, contact_email, location, linkedin) VALUES (1, ${toSqlText(settings.contact_email)}, ${toSqlText(settings.location)}, ${toSqlText(settings.linkedin)}) ON CONFLICT(id) DO UPDATE SET contact_email=excluded.contact_email, location=excluded.location, linkedin=excluded.linkedin;`,
    `INSERT INTO content_state (id, revision, values_json, previous_json, updated_at) VALUES (1, ${Math.max(0, revision)}, ${toSqlText(JSON.stringify(values))}, NULL, ${toSqlText(new Date().toISOString())}) ON CONFLICT(id) DO UPDATE SET revision=excluded.revision, values_json=excluded.values_json, previous_json=NULL, updated_at=excluded.updated_at;`,
  ];

  const sql = [
    '-- Generated by scripts/import-runtime-backup.mjs',
    '-- This plan intentionally does not import studio_owner.',
    '-- Owner must be claimed by the authenticated Cloudflare Access identity in staging.',
    'BEGIN TRANSACTION;',
    ...createTablesSql,
    ...mediaSql,
    ...placementSql,
    ...stateSql,
    'COMMIT;',
    '',
  ].join('\n');

  const uploadPlan = manifestMedia.map((m) => ({
    id: m.id,
    object_key: m.object_key,
    local_path: m.local_path,
    mime: m.mime,
    expected_bytes: m.expected_bytes,
    exported_bytes: m.exported_bytes,
    sha256: m.sha256,
    status: m.status,
  }));

  const runbook = `#!/usr/bin/env bash
set -euo pipefail

# Fill these intentionally when staging resources are ready.
DB_NAME="REPLACE_WITH_STAGING_D1_NAME"
BUCKET="REPLACE_WITH_STAGING_R2_BUCKET"
EXPORT_DIR="${options.inputDir}"
PLAN_DIR="${options.outDir}"

# 1) Import D1 metadata/state (no studio_owner row imported).
corepack pnpm exec wrangler d1 execute "$DB_NAME" --remote --file "$PLAN_DIR/d1-import.sql"

# 2) Upload R2 objects preserving object keys.
while IFS=$'\t' read -r object_key local_path; do
  corepack pnpm exec wrangler r2 object put "$BUCKET/$object_key" --file "$EXPORT_DIR/$local_path"
done < <(node -e 'const p=require(process.argv[1]);for(const m of p){if(m.status==="ok"||m.status==="byte-mismatch"||m.status==="zero-byte")console.log(m.object_key+"\\t"+m.local_path)}' "$PLAN_DIR/r2-upload-plan.json")
`;

  const report = {
    generated_at: new Date().toISOString(),
    input_dir: options.inputDir,
    output_dir: options.outDir,
    exact_reconstruction_for_visible_behavior: [
      'media table rows (id/object_key/filename/mime/bytes/alt/created_at)',
      'placements table mappings (slot -> media_id)',
      'current content values derived from content-state editable non-slot entries',
      'settings fields derived from content values',
      'R2 binary objects keyed by original object_key',
    ],
    intentionally_not_imported: [
      'studio_owner row (must be claimed by new Cloudflare Access identity)',
    ],
    not_fully_recoverable_from_api_export: [
      'content_state.previous_json restore history',
      'content_migration table history unless separately exported at database level',
      'original update timestamps for placements (API only returns slot/media_id)',
    ],
    validation: checks,
  };

  await writeFile(path.join(options.outDir, 'd1-import.sql'), sql);
  await writeFile(path.join(options.outDir, 'r2-upload-plan.json'), JSON.stringify(uploadPlan, null, 2));
  await writeFile(path.join(options.outDir, 'import-report.json'), JSON.stringify(report, null, 2));
  await writeFile(path.join(options.outDir, 'run-staging-import.sh'), runbook);

  console.log(`Import plan generated: ${options.outDir}`);
  console.log(`Media rows: ${media.length}`);
  console.log(`Placement rows: ${placements.length}`);
  console.log(`Failed media downloads in export: ${checks.failed_downloads.length}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
