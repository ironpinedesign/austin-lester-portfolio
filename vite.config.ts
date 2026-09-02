import tailwindcss from '@tailwindcss/postcss';
import vinext from 'vinext';
import { defineConfig } from 'vite';

const D1_BINDING = 'DB';
const R2_BINDING = 'FILES';
const STAGING_D1_NAME = 'austin-lester-portfolio-staging-db';
const STAGING_D1_ID = '50dfe17e-196a-468b-8c42-262f5074b145';
const STAGING_R2_NAME = 'austin-lester-portfolio-staging-files';

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === 'seatbelt';

const localBindingConfig = {
  main: 'vinext/server/app-router-entry',
  compatibility_flags: ['nodejs_compat'],
  d1_databases: [
    {
      binding: D1_BINDING,
      database_name: 'local-dev-d1',
      database_id: '00000000-0000-4000-8000-000000000000',
    },
  ],
  r2_buckets: [
    {
      binding: R2_BINDING,
      bucket_name: 'local-dev-r2',
    },
  ],
};

const stagingBindingConfig = {
  main: 'vinext/server/app-router-entry',
  compatibility_flags: ['nodejs_compat'],
  d1_databases: [
    {
      binding: D1_BINDING,
      database_name: STAGING_D1_NAME,
      database_id: STAGING_D1_ID,
    },
  ],
  r2_buckets: [
    {
      binding: R2_BINDING,
      bucket_name: STAGING_R2_NAME,
    },
  ],
};

export default defineConfig(async () => {
  const bindingProfile = process.env.CF_BINDINGS_PROFILE === 'staging'
    ? stagingBindingConfig
    : localBindingConfig;

  // Keep Wrangler and Miniflare state project-local. These are non-secret tool
  // settings; application environment belongs in ignored `.env*` files.
  process.env.WRANGLER_WRITE_LOGS ??= 'false';
  process.env.WRANGLER_LOG_PATH ??= '.wrangler/logs';
  process.env.MINIFLARE_REGISTRY_PATH ??= '.wrangler/registry';

  // Wrangler snapshots its log path while the Cloudflare plugin is imported.
  const { cloudflare } = await import('@cloudflare/vite-plugin');

  return {
    css: { postcss: { plugins: [tailwindcss()] } },
    server: isCodexSeatbeltSandbox
      ? { watch: { useFsEvents: false, usePolling: true } }
      : undefined,
    plugins: [
      vinext(),
      cloudflare({
        viteEnvironment: { name: 'rsc', childEnvironments: ['ssr'] },
        config: bindingProfile,
      }),
    ],
  };
});
