# Cloudflare migration plan (Pass 2 prep)

## Current production posture

ChatGPT Sites remains the active production host until a full cutover is verified.
No DNS, domain attachment, or live data mutation is performed by this branch.

## Current architecture (source of truth)

- Runtime: Vinext app router on Worker-compatible runtime
- Storage: D1 binding `DB`, R2 binding `FILES`
- Auth: Sites dispatcher identity headers (`oai-authenticated-user-*`)
- Hosting association: `.openai/hosting.json`

## Target architecture

- Runtime: Vinext on Cloudflare Workers
- Storage: D1 binding `DB`, R2 binding `FILES`
- Auth boundary: Cloudflare Access protecting:
  - `/studio`
  - `/studio/*`
  - `/api/studio/*`
- In-app identity validation: verify `Cf-Access-Jwt-Assertion` JWT claims and signature in Worker

## Confirmed Cloudflare account

- Account name: Austin.lester.media@gmail.com's Account
- Account ID: 2e8092555bad431938650f4256140c20
- Authenticated Wrangler user: austin.lester.media@gmail.com
- Visible accounts: exactly one

## Required Cloudflare resources (not created in this pass)

- Worker script/service (staging first)
- D1 database (staging)
- R2 bucket (staging)
- Cloudflare Access application/policy for Studio/admin API paths

## Repository migration config added

- `wrangler.toml` added with:
  - `account_id = "2e8092555bad431938650f4256140c20"`
  - logical bindings preserved: `DB`, `FILES`
  - placeholder resource fields to fill only after intentional resource creation
- `.openai/hosting.json` preserved for rollback/reference

## Runtime environment values

Required for Access provider deployments:

- `AUTH_PROVIDER=cloudflare-access`
- `CF_ACCESS_TEAM_DOMAIN=<team-domain-host>`
- `CF_ACCESS_AUD=<audience-tag>`

Optional:

- `CF_ACCESS_LOGOUT_URL=<optional logout URL>`

No secrets are committed. Wrangler OAuth credentials/tokens are never copied to source.

## Auth abstraction

New common identity layer:

- `lib/identity/index.ts`
- provider: `openai-sites` (legacy, preserved)
- provider: `cloudflare-access` (new target)

Cloudflare Access provider behavior:

- reads `Cf-Access-Jwt-Assertion`
- validates:
  - signature via Access JWKS (`/cdn-cgi/access/certs`)
  - issuer (`https://<CF_ACCESS_TEAM_DOMAIN>`)
  - audience (`CF_ACCESS_AUD`)
  - expiration / timing claims
  - required claims (`sub`, `email`)
- constructs app identity:
  - stable user ID from `sub`
  - email
  - display/full name when present

## Read-only export plan from existing live Site

Prepared script: `scripts/export-sites-runtime.mjs`

Strict behavior:

- GET only
- never calls write endpoints
- no token/cookie printing

Outputs package:

- `studio-media.json`
- `content-current.csv`
- `content-state.json`
- `manifest.json`
- `media/`

Per media object in manifest:

- media id
- object key
- source filename
- MIME type
- expected bytes
- exported bytes
- local path
- SHA-256
- status and error flags

Validation flags:

- failed downloads
- missing objects
- zero-byte files
- byte mismatches
- duplicate IDs

Storage location recommendation:

- output to ignored `backups/` path

Suggested run (manual sign-in flow):

1. `node scripts/export-sites-runtime.mjs --playwright --out backups/sites-export-YYYYMMDD`
2. Complete sign-in manually in opened browser window.
3. Return to terminal and press Enter to continue export.

Alternative run (advanced):

- `node scripts/export-sites-runtime.mjs --cookie-file <local-cookie-header-file> --out <ignored-dir>`

## Import/reconstruction plan for new staging environment

Prepared planner: `scripts/import-runtime-backup.mjs`

This tool does not contact Cloudflare. It generates:

- `d1-import.sql`
- `r2-upload-plan.json`
- `import-report.json`
- `run-staging-import.sh`

Import model:

- recreates current-visible behavior for:
  - `media`
  - `placements`
  - current content values (`content_state.values_json` from exported entries)
  - contact settings values
  - R2 objects under original object keys
- intentionally does not import `studio_owner`

New owner setup after staging deploy:

- protect Studio/admin endpoints with Cloudflare Access
- sign in as intended owner identity
- claim owner in the new environment using setup code (or seed owner row intentionally outside this tool)

## Exact recreation vs. non-exact history

Required for identical current visible behavior (recreated):

- media records and IDs
- placements
- content current values
- contact values
- R2 object bytes and keys

Historical/recovery metadata not fully recoverable from API export alone:

- `content_state.previous_json` restore history
- `content_migration` table history
- original placement `updated_at` timestamps
- legacy owner identity row from Sites runtime

## Staging deployment plan (when explicitly approved)

1. Create staging Worker/D1/R2 resources.
2. Fill `wrangler.toml` placeholder values.
3. Deploy staging Worker.
4. Apply Access policy to Studio/admin paths.
5. Run export package generation from live Sites owner session.
6. Run import planner and apply generated SQL/object upload to staging.
7. Claim new owner identity in staging.
8. Validate public pages, media visibility rules, Studio auth/authorization, CSV workflow.

## Validation checklist

- anonymous public routes load
- owner-only routes require Access + app authorization
- non-owner receives 403 on `/api/studio/*`
- unassigned and hidden-only media return 404 publicly
- content CSV preview/apply/restore behavior preserved
- no private metadata leaks in public payloads

## Production cutover and DNS migration (not executed in this pass)

1. Run final staging signoff.
2. Freeze live-content window.
3. Run final read-only export.
4. Import to production-target resources.
5. Attach domain/DNS changes intentionally.
6. Verify post-cutover endpoints and media.

## Rollback

- Keep ChatGPT Sites source association and `.openai/hosting.json` reference until Cloudflare production is verified.
- If cutover validation fails, restore traffic to existing ChatGPT Sites host and re-run migration after fixes.
