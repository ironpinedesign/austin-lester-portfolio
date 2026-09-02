const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const cp = require('node:child_process');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-migration-tools-'));
const input = path.join(tmp, 'export');
const out = path.join(tmp, 'plan');
fs.mkdirSync(path.join(input, 'media'), { recursive: true });

const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j0ioAAAAASUVORK5CYII=',
  'base64',
);

const mediaId = 'test-media-id';
const objectKey = `portfolio/${mediaId}`;
const mediaFile = `${mediaId}.png`;

fs.writeFileSync(path.join(input, 'media', mediaFile), png);

fs.writeFileSync(
  path.join(input, 'studio-media.json'),
  JSON.stringify(
    {
      media: [
        {
          id: mediaId,
          object_key: objectKey,
          filename: 'fixture.png',
          mime: 'image/png',
          bytes: png.length,
          alt: 'fixture',
          created_at: new Date().toISOString(),
        },
      ],
      placements: [{ slot: 'home.hero.image', media_id: mediaId }],
    },
    null,
    2,
  ),
);

fs.writeFileSync(
  path.join(input, 'content-state.json'),
  JSON.stringify(
    {
      revision: 7,
      canRestore: true,
      entries: [
        {
          id: 'home.hero.headline',
          value: 'Fixture headline',
          editable: true,
          slot: false,
        },
        {
          id: 'contact.direct.email',
          value: 'owner@example.com',
          editable: true,
          slot: false,
        },
      ],
    },
    null,
    2,
  ),
);

fs.writeFileSync(path.join(input, 'content-current.csv'), 'content_id,value\n"home.hero.headline","Fixture headline"\n');

fs.writeFileSync(
  path.join(input, 'manifest.json'),
  JSON.stringify(
    {
      summary: {
        duplicate_ids: [],
      },
      media: [
        {
          id: mediaId,
          object_key: objectKey,
          local_path: `media/${mediaFile}`,
          mime: 'image/png',
          expected_bytes: png.length,
          exported_bytes: png.length,
          sha256: 'fixture',
          status: 'ok',
        },
      ],
    },
    null,
    2,
  ),
);

cp.execFileSync('node', ['scripts/import-runtime-backup.mjs', '--input', input, '--out', out], {
  stdio: 'inherit',
});

const sql = fs.readFileSync(path.join(out, 'd1-import.sql'), 'utf8');
assert.match(sql, /CREATE TABLE IF NOT EXISTS media/);
assert.doesNotMatch(sql, /INSERT INTO studio_owner/);
assert.match(sql, /INSERT INTO content_state/);

const plan = JSON.parse(fs.readFileSync(path.join(out, 'r2-upload-plan.json'), 'utf8'));
assert.equal(plan.length, 1);
assert.equal(plan[0].object_key, objectKey);

const report = JSON.parse(fs.readFileSync(path.join(out, 'import-report.json'), 'utf8'));
assert.ok(Array.isArray(report.exact_reconstruction_for_visible_behavior));
assert.ok(Array.isArray(report.not_fully_recoverable_from_api_export));

console.log('PASS: migration import planner generated SQL and upload plan safely.');
