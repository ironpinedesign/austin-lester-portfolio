#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';

function usage() {
  console.log(
    [
      'Usage:',
      '  node scripts/export-sites-runtime.mjs --out backups/sites-export-YYYYMMDD',
      '  node scripts/export-sites-runtime.mjs --playwright --out backups/sites-export-YYYYMMDD',
      '',
      'Options:',
      '  --base-url <url>         Default: https://austinlesterstudio.com',
      '  --out <dir>              Output directory (recommended inside ignored backups/)',
      '  --cookie-file <path>     Raw Cookie header value in a local file (never commit)',
      '  --playwright             Open browser for manual sign-in and reuse that session',
      '',
      'This exporter is strictly read-only. It only performs GET requests.',
    ].join('\n'),
  );
}

function parseArgs(argv) {
  const options = {
    baseUrl: 'https://austinlesterstudio.com',
    outDir: path.resolve('backups', `sites-export-${new Date().toISOString().replace(/[:.]/g, '-')}`),
    cookieFile: '',
    usePlaywright: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--help') return { help: true, options };
    if (arg === '--playwright') options.usePlaywright = true;
    else if (arg === '--base-url') options.baseUrl = argv[++i] || options.baseUrl;
    else if (arg === '--out') options.outDir = path.resolve(argv[++i] || options.outDir);
    else if (arg === '--cookie-file') options.cookieFile = path.resolve(argv[++i] || '');
    else throw new Error(`Unknown argument: ${arg}`);
  }

  return { help: false, options };
}

function extensionFromMime(mime) {
  const map = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/avif': '.avif',
    'video/mp4': '.mp4',
    'video/webm': '.webm',
  };
  return map[mime] || '';
}

function responseOk(response) {
  if (typeof response.ok === 'boolean') return response.ok;
  if (typeof response.ok === 'function') return response.ok();
  return false;
}

function responseStatus(response) {
  if (typeof response.status === 'number') return response.status;
  if (typeof response.status === 'function') return response.status();
  return 0;
}

async function strictGet(fetchLike, url, headers = {}) {
  const response = await fetchLike(url, { method: 'GET', headers });
  if (!responseOk(response)) {
    const body = await response.text().catch(() => '');
    throw new Error(
      `GET ${url} failed (${responseStatus(response)}): ${body.slice(0, 240)}`,
    );
  }
  return response;
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

async function createExportPackage(requestGet, baseUrl, outDir) {
  const mediaDir = path.join(outDir, 'media');
  await mkdir(mediaDir, { recursive: true });

  const [mediaRes, contentStateRes, contentCsvRes] = await Promise.all([
    requestGet(`${baseUrl}/api/studio/media`),
    requestGet(`${baseUrl}/api/studio/content`),
    requestGet(`${baseUrl}/api/studio/content?format=csv`),
  ]);

  const mediaPayload = await mediaRes.json();
  const contentState = await contentStateRes.json();
  const contentCsv = await contentCsvRes.text();

  await writeFile(path.join(outDir, 'studio-media.json'), JSON.stringify(mediaPayload, null, 2));
  await writeFile(path.join(outDir, 'content-state.json'), JSON.stringify(contentState, null, 2));
  await writeFile(path.join(outDir, 'content-current.csv'), contentCsv, 'utf8');

  const media = Array.isArray(mediaPayload.media) ? mediaPayload.media : [];
  const ids = new Set();
  const duplicateIds = [];
  const manifestMedia = [];

  for (const item of media) {
    if (!item?.id) continue;
    if (ids.has(item.id)) duplicateIds.push(item.id);
    ids.add(item.id);

    const ext = extensionFromMime(item.mime);
    const localName = `${item.id}${ext}`;
    const localPath = path.join('media', localName);
    const outputPath = path.join(outDir, localPath);

    let exportedBytes = 0;
    let checksum = '';
    let status = 'ok';
    let error = null;

    try {
      const fileRes = await requestGet(`${baseUrl}/api/media/${item.id}`);
      const bytes = new Uint8Array(await fileRes.arrayBuffer());
      exportedBytes = bytes.byteLength;
      checksum = sha256(bytes);
      await writeFile(outputPath, bytes);

      if (exportedBytes === 0) status = 'zero-byte';
      else if (Number.isFinite(item.bytes) && item.bytes !== exportedBytes) status = 'byte-mismatch';
    } catch (e) {
      status = 'failed';
      error = e instanceof Error ? e.message : String(e);
    }

    manifestMedia.push({
      id: item.id,
      object_key: item.object_key || '',
      filename: item.filename || '',
      mime: item.mime || '',
      expected_bytes: item.bytes ?? null,
      exported_bytes: exportedBytes,
      local_path: localPath,
      sha256: checksum,
      status,
      error,
    });
  }

  const summary = {
    media_records: media.length,
    media_downloaded: manifestMedia.filter((m) => m.status !== 'failed').length,
    failed_downloads: manifestMedia.filter((m) => m.status === 'failed').map((m) => m.id),
    zero_byte_files: manifestMedia.filter((m) => m.status === 'zero-byte').map((m) => m.id),
    byte_mismatches: manifestMedia.filter((m) => m.status === 'byte-mismatch').map((m) => m.id),
    duplicate_ids: duplicateIds,
    missing_media_ids: media
      .map((m) => m.id)
      .filter((id) => !manifestMedia.some((entry) => entry.id === id)),
  };

  const manifest = {
    exporter: 'scripts/export-sites-runtime.mjs',
    mode: 'read-only-get',
    created_at: new Date().toISOString(),
    base_url: baseUrl,
    package_files: [
      'studio-media.json',
      'content-state.json',
      'content-current.csv',
      'manifest.json',
      'media/',
    ],
    summary,
    media: manifestMedia,
  };

  await writeFile(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

  return manifest;
}

async function requestWithCookie(baseUrl, cookieHeader) {
  return {
    async get(url) {
      return strictGet(fetch, url, {
        Cookie: cookieHeader,
        Accept: '*/*',
      });
    },
  };
}

async function requestWithPlaywright(baseUrl) {
  let chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch {
    throw new Error(
      'Playwright is not installed. Install it first or run with --cookie-file.',
    );
  }

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(`${baseUrl}/studio`, { waitUntil: 'domcontentloaded' });

  process.stdout.write(
    '\nComplete sign-in in the opened browser window, then press Enter here to continue export.\n',
  );
  await new Promise((resolve) => process.stdin.once('data', resolve));

  return {
    async get(url) {
      return context.request.get(url, { method: 'GET' });
    },
    async close() {
      await browser.close();
    },
  };
}

async function main() {
  const { help, options } = parseArgs(process.argv.slice(2));
  if (help) {
    usage();
    return;
  }

  const baseUrl = options.baseUrl.replace(/\/$/, '');
  await mkdir(options.outDir, { recursive: true });

  let transport;
  if (options.usePlaywright) {
    transport = await requestWithPlaywright(baseUrl);
  } else {
    if (!options.cookieFile) {
      throw new Error('Provide --cookie-file or use --playwright.');
    }
    const cookieHeader = (await readFile(options.cookieFile, 'utf8')).trim();
    if (!cookieHeader) throw new Error('Cookie file is empty.');
    transport = await requestWithCookie(baseUrl, cookieHeader);
  }

  try {
    const manifest = await createExportPackage(
      (url) => transport.get(url),
      baseUrl,
      options.outDir,
    );

    console.log(`\nExport complete: ${options.outDir}`);
    console.log(`Media records: ${manifest.summary.media_records}`);
    console.log(`Failed downloads: ${manifest.summary.failed_downloads.length}`);
    console.log(`Byte mismatches: ${manifest.summary.byte_mismatches.length}`);
  } finally {
    if (transport.close) await transport.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
