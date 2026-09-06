import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

export const EXPECTED_PRODUCTION = {
  workerName: 'austin-lester-portfolio-production',
  d1Name: 'austin-lester-portfolio-production-db',
  r2Name: 'austin-lester-portfolio-production-files',
  d1Binding: 'DB',
  r2Binding: 'FILES',
};

export function runCommand(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: options.capture ? 'pipe' : 'inherit',
    env: { ...process.env, ...(options.env || {}) },
    cwd: options.cwd || process.cwd(),
    encoding: 'utf8',
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    const detail = options.capture
      ? `${result.stdout || ''}${result.stderr || ''}`.trim()
      : '';
    throw new Error(
      `${command} ${args.join(' ')} failed with exit code ${result.status}${detail ? `\n${detail}` : ''}`,
    );
  }

  return options.capture ? (result.stdout || '').trim() : '';
}

export function ensureFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Required file not found: ${filePath}`);
  }
}

export function buildWithProductionBindings() {
  runCommand('corepack', ['pnpm', 'build'], {
    env: { CF_BINDINGS_PROFILE: 'production' },
  });
}

export function readResolvedWranglerConfig(repoRoot = process.cwd()) {
  const wranglerJsonPath = path.join(repoRoot, 'dist/server/wrangler.json');
  ensureFile(wranglerJsonPath);
  const text = fs.readFileSync(wranglerJsonPath, 'utf8');
  return { path: wranglerJsonPath, config: JSON.parse(text) };
}

export function verifyExpectedProductionTargets(config) {
  const errors = [];

  if (config.name !== EXPECTED_PRODUCTION.workerName) {
    errors.push(
      `Worker name mismatch: expected "${EXPECTED_PRODUCTION.workerName}", got "${String(config.name)}"`,
    );
  }

  const d1 = Array.isArray(config.d1_databases) ? config.d1_databases : [];
  const r2 = Array.isArray(config.r2_buckets) ? config.r2_buckets : [];

  if (d1.length !== 1) {
    errors.push(`Expected exactly 1 D1 binding in resolved config, found ${d1.length}`);
  }

  if (r2.length !== 1) {
    errors.push(`Expected exactly 1 R2 binding in resolved config, found ${r2.length}`);
  }

  const d1Entry = d1[0] || {};
  const r2Entry = r2[0] || {};

  if (d1Entry.binding !== EXPECTED_PRODUCTION.d1Binding) {
    errors.push(
      `D1 binding mismatch: expected "${EXPECTED_PRODUCTION.d1Binding}", got "${String(d1Entry.binding)}"`,
    );
  }

  if (d1Entry.database_name !== EXPECTED_PRODUCTION.d1Name) {
    errors.push(
      `D1 database mismatch: expected "${EXPECTED_PRODUCTION.d1Name}", got "${String(d1Entry.database_name)}"`,
    );
  }

  if (r2Entry.binding !== EXPECTED_PRODUCTION.r2Binding) {
    errors.push(
      `R2 binding mismatch: expected "${EXPECTED_PRODUCTION.r2Binding}", got "${String(r2Entry.binding)}"`,
    );
  }

  if (r2Entry.bucket_name !== EXPECTED_PRODUCTION.r2Name) {
    errors.push(
      `R2 bucket mismatch: expected "${EXPECTED_PRODUCTION.r2Name}", got "${String(r2Entry.bucket_name)}"`,
    );
  }

  const disallowed = [
    String(d1Entry.database_name || ''),
    String(r2Entry.bucket_name || ''),
    String(d1Entry.database_id || ''),
  ].join('\n');

  if (/local-dev|staging|00000000-0000-4000-8000-000000000000/i.test(disallowed)) {
    errors.push('Resolved production targets include local/staging sentinel values. Refusing release.');
  }

  return errors;
}

export function printResolvedTargets(config) {
  const d1Entry = (Array.isArray(config.d1_databases) ? config.d1_databases[0] : null) || {};
  const r2Entry = (Array.isArray(config.r2_buckets) ? config.r2_buckets[0] : null) || {};

  console.log('Resolved production targets:');
  console.log(`- Worker: ${String(config.name)}`);
  console.log(`- D1: ${String(d1Entry.database_name || '')}`);
  console.log(`- R2: ${String(r2Entry.bucket_name || '')}`);
}
