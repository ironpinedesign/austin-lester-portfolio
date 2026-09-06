import {
  buildWithProductionBindings,
  printResolvedTargets,
  readResolvedWranglerConfig,
  runCommand,
  verifyExpectedProductionTargets,
} from './release-safety-lib.mjs';

function main() {
  const extraArgs = process.argv.slice(2).filter((arg) => arg !== '--');
  const hasEnvOverride = extraArgs.includes('--env') || extraArgs.some((arg) => arg.startsWith('--env='));

  if (hasEnvOverride) {
    throw new Error('Do not pass --env to deploy:production. This command always deploys env.production.');
  }

  if (extraArgs.includes('--dry-run')) {
    console.log('MODE: DRY RUN');
    console.log('PUBLISH: DISABLED');
    console.log('[deploy:production] Dry-run requested; Wrangler will compile and validate without publishing.');
  }

  console.log('[deploy:production] Building with forced production bindings...');
  buildWithProductionBindings();

  const { config } = readResolvedWranglerConfig();
  const errors = verifyExpectedProductionTargets(config);
  printResolvedTargets(config);

  if (errors.length > 0) {
    console.error('[deploy:production] Binding verification failed:');
    for (const err of errors) {
      console.error(`- ${err}`);
    }
    process.exit(1);
  }

  console.log('[deploy:production] Verified production bindings. Proceeding to wrangler deploy.');
  runCommand('corepack', ['pnpm', 'exec', 'wrangler', 'deploy', '--env', 'production', ...extraArgs], {
    env: { CF_BINDINGS_PROFILE: 'production' },
  });
}

try {
  main();
} catch (error) {
  console.error(String(error instanceof Error ? error.message : error));
  process.exit(1);
}
