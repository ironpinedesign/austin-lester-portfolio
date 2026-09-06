import fs from 'node:fs';
import path from 'node:path';
import {
  buildWithProductionBindings,
  printResolvedTargets,
  readResolvedWranglerConfig,
  runCommand,
  verifyExpectedProductionTargets,
} from './release-safety-lib.mjs';

const SCRIPT_EXTENSIONS = ['*.ts', '*.tsx', '*.js', '*.jsx', '*.mjs', '*.cjs'];

function printCheck(name) {
  console.log(`\n[release:preflight] ${name}`);
}

function branchInfo() {
  const currentBranch = runCommand('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { capture: true });
  const originMain = runCommand('git', ['rev-parse', 'origin/main'], { capture: true });
  const localMain = runCommand('git', ['rev-parse', 'main'], { capture: true });

  return { currentBranch, localMain, originMain };
}

function ensureCleanWorkingTree() {
  const status = runCommand('git', ['status', '--porcelain'], { capture: true });
  if (status.trim().length > 0) {
    throw new Error('Working tree is not clean. Commit/stash/discard changes before release preflight.');
  }
}

function checkCurrentBranchAlignment(currentBranch) {
  let upstream = '';
  try {
    upstream = runCommand('git', ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'], {
      capture: true,
    }).trim();
  } catch {
    upstream = '';
  }

  if (currentBranch === 'main') {
    if (!upstream) {
      throw new Error('main must have an upstream configured.');
    }
    const counts = runCommand('git', ['rev-list', '--left-right', '--count', `${upstream}...HEAD`], {
      capture: true,
    }).split(/\s+/);
    const behind = Number.parseInt(counts[0] || '0', 10);
    const ahead = Number.parseInt(counts[1] || '0', 10);
    console.log(`- Current branch: ${currentBranch}`);
    console.log(`- Upstream: ${upstream}`);
    console.log(`- Divergence: behind=${behind}, ahead=${ahead}`);
    if (behind > 0 && ahead > 0) {
      throw new Error(`main diverged from upstream ${upstream} (behind=${behind}, ahead=${ahead}).`);
    }
    if (behind > 0) {
      throw new Error(`main is behind upstream ${upstream} by ${behind} commit(s).`);
    }
    try {
      runCommand('git', ['merge-base', '--is-ancestor', 'origin/main', 'HEAD']);
    } catch {
      throw new Error('main does not contain current origin/main as an ancestor.');
    }
    if (ahead > 0) {
      console.log(`- STATUS: local main ahead of origin/main by ${ahead} commit; acceptable before push`);
    } else {
      console.log('- STATUS: local main synchronized with origin/main');
    }
    return;
  }

  if (upstream) {
    const counts = runCommand('git', ['rev-list', '--left-right', '--count', `${upstream}...HEAD`], {
      capture: true,
    }).split(/\s+/);
    const behind = Number.parseInt(counts[0] || '0', 10);
    const ahead = Number.parseInt(counts[1] || '0', 10);
    console.log(`- Current branch: ${currentBranch}`);
    console.log(`- Upstream: ${upstream}`);
    console.log(`- Divergence: behind=${behind}, ahead=${ahead}`);
    if (behind > 0) {
      throw new Error(`Current branch is behind upstream by ${behind} commit(s).`);
    }
    return;
  }

  console.log(`- Current branch: ${currentBranch}`);
  console.log('- UPSTREAM: not configured');
  console.log('- STATUS: acceptable for first pre-push validation');

  const baselineCounts = runCommand('git', ['rev-list', '--left-right', '--count', 'origin/main...HEAD'], {
    capture: true,
  }).split(/\s+/);
  const behindMain = Number.parseInt(baselineCounts[0] || '0', 10);
  const aheadMain = Number.parseInt(baselineCounts[1] || '0', 10);
  console.log(`- Baseline divergence vs origin/main: behind=${behindMain}, ahead=${aheadMain}`);

  try {
    runCommand('git', ['merge-base', '--is-ancestor', 'origin/main', 'HEAD']);
  } catch {
    throw new Error('Current branch does not contain current origin/main as an ancestor (stale or unexpectedly diverged base).');
  }

  if (behindMain > 0) {
    throw new Error(`Current branch is behind origin/main by ${behindMain} commit(s). Rebase/merge main first.`);
  }
}

function lintRelevantChanges() {
  const filesFromMainRange = runCommand(
    'git',
    ['diff', '--name-only', 'origin/main...HEAD', '--', ...SCRIPT_EXTENSIONS],
    { capture: true },
  );
  let files = filesFromMainRange
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (files.length === 0) {
    const filesFromHead = runCommand('git', ['show', '--name-only', '--pretty=format:', 'HEAD', '--', ...SCRIPT_EXTENSIONS], {
      capture: true,
    });
    files = filesFromHead
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  }

  if (files.length === 0) {
    console.log('- No changed TS/JS files relative to origin/main; skipping targeted lint.');
    return;
  }

  console.log(`- Linting ${files.length} changed TS/JS file(s) relative to origin/main...`);
  runCommand('corepack', ['pnpm', 'exec', 'eslint', ...files]);
}

function checkForTempOrSecretArtifacts() {
  const changedFilesRaw = runCommand('git', ['diff', '--name-only', 'origin/main...HEAD'], { capture: true });
  const changedFiles = changedFilesRaw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const suspiciousNamePattern = /(\.env(\.|$)|\.pem$|\.key$|\.p12$|\.pfx$|\.sqlite$|\.db$|\.tmp$|\.bak$|~$)/i;
  const suspiciousFiles = changedFiles.filter((file) => suspiciousNamePattern.test(file));

  if (suspiciousFiles.length > 0) {
    throw new Error(`Suspicious changed filename(s): ${suspiciousFiles.join(', ')}`);
  }

  if (changedFiles.length === 0) {
    return;
  }

  const absoluteFiles = changedFiles
    .map((file) => path.resolve(process.cwd(), file))
    .filter((filePath) => fs.existsSync(filePath));

  const contentPattern = /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----|AKIA[0-9A-Z]{16}|xox[baprs]-[A-Za-z0-9-]{10,}|ghp_[A-Za-z0-9]{30,}/;

  for (const absolutePath of absoluteFiles) {
    const text = fs.readFileSync(absolutePath, 'utf8');
    if (contentPattern.test(text)) {
      throw new Error(`Potential secret material detected in changed file: ${path.relative(process.cwd(), absolutePath)}`);
    }
  }
}

async function reportPlaceholderWarning() {
  const baseUrl = process.env.RELEASE_PLACEHOLDER_BASE_URL || 'https://austinlesterstudio.com';
  const contentPath = path.resolve(process.cwd(), 'content/projects.json');
  if (!fs.existsSync(contentPath)) {
    console.log('- Placeholder warning skipped: content/projects.json not found.');
    return;
  }

  try {
    const projects = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
    const published = Array.isArray(projects) ? projects.filter((p) => p && p.published && p.slug) : [];
    let totalPlaceholders = 0;

    for (const project of published) {
      const url = `${baseUrl.replace(/\/$/, '')}/work/${project.slug}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      const html = await res.text();
      const count = (html.match(/media-placeholder/g) || []).length;
      totalPlaceholders += count;
    }

    if (totalPlaceholders > 0) {
      console.log(`- Warning: published project pages currently render ${totalPlaceholders} media placeholders in total.`);
    } else {
      console.log('- Placeholder scan: no media placeholders detected on published project pages.');
    }
  } catch (error) {
    console.log(`- Placeholder warning skipped due to fetch/read failure: ${String(error instanceof Error ? error.message : error)}`);
  }
}

async function main() {
  printCheck('Fetching origin refs (read-only)');
  runCommand('git', ['fetch', 'origin', '--prune']);

  printCheck('Working tree state');
  ensureCleanWorkingTree();
  console.log('- Working tree is clean.');

  printCheck('Branch and origin alignment');
  const { currentBranch, localMain, originMain } = branchInfo();
  console.log(`- local main: ${localMain}`);
  console.log(`- origin/main: ${originMain}`);
  checkCurrentBranchAlignment(currentBranch);

  printCheck('TypeScript');
  runCommand('corepack', ['pnpm', 'exec', 'tsc', '--noEmit']);

  printCheck('Production build with forced bindings profile');
  buildWithProductionBindings();

  printCheck('Diff whitespace integrity');
  runCommand('git', ['diff', '--check']);

  printCheck('Relevant lint');
  lintRelevantChanges();

  printCheck('Production binding resolution and target verification');
  const { config } = readResolvedWranglerConfig();
  printResolvedTargets(config);
  const bindingErrors = verifyExpectedProductionTargets(config);
  if (bindingErrors.length > 0) {
    throw new Error(bindingErrors.join('\n'));
  }

  printCheck('Accidental local/staging binding references');
  const d1 = (config.d1_databases || []).map((entry) => entry.database_name).join(',');
  const r2 = (config.r2_buckets || []).map((entry) => entry.bucket_name).join(',');
  if (/local-dev|staging/i.test(`${d1}\n${r2}`)) {
    throw new Error('Resolved D1/R2 targets contain local/staging references.');
  }
  console.log('- Resolved D1/R2 targets are production-only.');

  printCheck('Obvious secret/temp artifact leakage');
  checkForTempOrSecretArtifacts();
  console.log('- No obvious temp/secret leakage detected in changed files.');

  printCheck('Published placeholder warning (non-blocking)');
  await reportPlaceholderWarning();

  console.log('\n[release:preflight] PASS');
}

main().catch((error) => {
  console.error(`\n[release:preflight] FAIL: ${String(error instanceof Error ? error.message : error)}`);
  process.exit(1);
});
