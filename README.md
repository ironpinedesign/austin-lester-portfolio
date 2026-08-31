# Austin Lester portfolio

The existing portfolio and owner-only Media Studio, Content/CSV, and Site Map. The public design and modular case studies are preserved. This repository backs up **source code**, not the complete live environment.

## Run locally

Prerequisites: Node.js 22.13 or newer, pnpm 11, and Python 3 for integration checks. Use a supported Node LTS release. The pnpm lockfile is committed; retain the security overrides in `pnpm-workspace.yaml`.

```sh
pnpm install --frozen-lockfile
cp .env.example .env
# Set STUDIO_SETUP_CODE to a private local-only value in .env.
pnpm dev --hostname 127.0.0.1
```

Open the printed local address. `/studio` starts the Sites plugin's **local development sign-in**, which identifies a fake local user (`local_seedy`). Enter your local setup code once to claim this local database. This is not production authentication. Never expose the development server or its local sign-in to the Internet.

```sh
pnpm exec tsc --noEmit
pnpm build
```

The build produces a Cloudflare Worker-compatible server and static assets in `dist/`. Local D1/R2 emulation lives in ignored `.wrangler/` state. An ordinary Node server alone does not supply these bindings. `pnpm start` is not a replacement for configuring the Sites/Cloudflare runtime.

## Structure and routes

| Location | Purpose |
| --- | --- |
| `app/` | Public pages, shared components, Studio pages, HTTP endpoints |
| `content/projects.json` | Nine original project records and modular case sections |
| `content/site-copy.ts` | Default editable site copy |
| `lib/content-registry.ts` | Permanent semantic IDs for copy and media positions |
| `lib/content-csv.ts` / `lib/content.ts` | CSV parsing/validation and D1 content overrides |
| `lib/storage.ts` / `lib/studio-auth.ts` | D1/R2 access, public media filtering, owner authorization |
| `db/schema.ts` / `drizzle/` | Schema and checked-in migrations |
| `scripts/` | Local-only workflow and security regression checks |
| `.openai/hosting.json` / `vite.config.ts` | Non-secret Sites association and logical runtime bindings |

Public routes: `/`, `/work`, `/about`, `/contact`, `/work/[slug]` for each published case study, and `/api/media/[id]` for media used by visible published locations. Contact has email/profile links; **no visitor submission form exists**.

Owner routes: `/studio`, `/studio/content`, `/studio/map`. Server endpoints under `/api/studio/` handle `claim`, `media`, `placements`, `settings`, and `content`. Anonymous requests are denied; another signed-in account receives no owner privileges. Sign-in, sign-out, and callback routes belong to the Sites dispatcher, not this application.

## Editorial workflow

At `/studio/content`: **Export current CSV → edit → Import → Preview → Apply**. Columns are `content_id,page,section,field,type,value`; only permanent `content_id` plus `value` addresses updates. Orientation columns and row order are not authoritative. Lists use one item per line, booleans use `true`/`false`, and text supports limited emphasis/line breaks, never executable HTML.

Unknown IDs, duplicate IDs, malformed rows, unsafe destinations, invalid types, and blank required values block applying the batch. An unchanged export/import reports zero changes. One-step restore recovers the immediately previous copy state; revision checks reject stale previews. CSV is a copy interface, not an image-management interface. Adding projects or changing section structure still requires a source update.

At `/studio`: upload files or drag files/folders from Finder, then assign assets to named positions. Formats: JPEG, PNG, WebP, GIF, AVIF, MP4, WebM; 25 MiB per file and up to 500 files per browser batch. The server checks size and signatures/container brands. There is no malware scanner, full media decoder, or video transcoding; use standard browser-compatible exports and retain originals separately. Filenames never determine storage paths; UUIDs do.

Assets have persistent IDs separate from slots and R2 keys. An asset can be reused, swapped, or unassigned without deleting its library record. Usage is listed before deletion. Unassigned assets and assets used only in hidden locations are owner-only. Assets used in any visible published position can be read anonymously at the application layer. Publishing a file makes it downloadable; later hiding it cannot revoke someone else's saved copy.

At `/studio/map`: browse page → section → field/slot, see current values/types and COMPLETE, MISSING, PLACEHOLDER, or inactive states. Registry IDs are stable even when display names or ordering change. The existing one-time legacy-slot migration preserves older assignments.

## Authentication and trust boundary

Production authentication uses Sites' dispatch-owned Sign in with ChatGPT. The dispatcher supplies trusted `oai-authenticated-user-*` headers; the server compares the stable, site-scoped user ID against the D1 `studio_owner` row. Email/name are display information, not authorization. The first owner claim requires the runtime `STUDIO_SETUP_CODE`; once claimed, the endpoint cannot transfer ownership. Preserve the existing owner row and secret configuration during deployment.

Each administrative API checks owner identity independently before reading private data or mutating storage. Mutations also require an exact same-origin `Origin`. The browser's hidden controls are not the authorization boundary. Content/CSV/Map data, private asset metadata, and setup secrets must not appear in public client payloads.

**Platform dependency:** the Sites dispatcher must strip/overwrite client-supplied identity headers, and the underlying worker must not have an untrusted direct public ingress. The application cannot independently authenticate arbitrary raw headers. Do not deploy it unchanged behind a generic reverse proxy. See `SECURITY.md` for the required anonymous production checks before public launch.

## What is outside Git

| Data | Current location | Backup/recovery approach |
| --- | --- | --- |
| Uploaded bytes | Sites-managed R2 binding `FILES` | Keep original exports separately. Owner-authorized `/api/media/[id]` reads can retrieve library files by ID. Preserve an ID-to-file manifest outside Git. |
| Media metadata and slot assignments | D1 `media` and `placements` tables | Owner `GET /api/studio/media` returns the current catalog/assignments. Save privately with the matching media files; do not commit this runtime export. |
| Current copy, publication flags, prior restore point, revisions | D1 `content_state` | Export current CSV from Content. CSV preserves registered current values, not the restore history or database revision. |
| Owner identity, legacy settings, migration markers | D1 `studio_owner`, `settings`, `content_migration` | A full consistent database backup must include these tables. The available Sites connector can inspect paginated table rows, but this is not an atomic database backup/restore service. Arrange a supported platform database export for full recovery. |
| Runtime setup secret and Sites access/auth configuration | Sites runtime/control plane | Record secret names and recovery instructions in a private password manager; obtain values through authorized secret management. Never put real values in Git. |

The `.env.example` contains names only. `.gitignore` excludes environment files, private keys, build outputs, dependencies, local databases/caches, logs, and private backup artifacts. Do not assume `.gitignore` removes files already committed. The baseline and prior source history were reviewed for known token/key patterns and local environment values before backup.

No automated live-data export is added by this security task. Catalog JSON plus asset files plus current CSV is useful recovery material, but is not equivalent to a tested database snapshot. Full restoration and object-ID preservation require an authorized migration procedure; do not assume the normal upload/import UI restores every original ID.

## Hosting and migration

Current hosting uses Vinext/Vite plus `@openai/sites-vite-plugin`, Sites-managed D1/R2, dispatch-owned authentication, runtime secret injection, and the Sites publishing control plane. `.openai/hosting.json` contains only a non-secret project association and logical bindings. Source can run locally with the included emulator; Git alone cannot recreate production data, authentication, storage, domain/access policy, or secrets.

Current deployment is an explicit Sites workflow: build, associate source/version, package server/static assets/migrations, and publish through Sites. **No GitHub deployment workflow is configured. The security review does not publish or change the live Site.** Deployment of the reviewed changes requires the owner's separate approval.

To move hosts, supply equivalent storage/database bindings or replace `lib/storage.ts` and database access, migrate live rows and blobs, replace the Sites identity adapter with trusted server-side authentication/owner mapping, configure secrets, and replace the Sites build/deployment wiring. A new Site gets different site-scoped user IDs, so owner mapping needs deliberate migration. Keep semantic content IDs and slot mappings intact. Preserve the ordinary-anchor `SiteLink` adapter, which avoids a known production navigation failure in this pinned Vinext version.

## Verification

```sh
pnpm exec tsc --noEmit
pnpm exec tsc lib/content-csv.ts lib/content-registry.ts lib/content-migration.ts lib/media-drop.ts lib/media-validation.ts lib/request-body.ts --outDir /tmp/portfolio-tests/compiled --module commonjs --target es2022 --resolveJsonModule --esModuleInterop --skipLibCheck
node scripts/check-content.cjs /tmp/portfolio-tests/compiled
node scripts/check-media-drop.cjs /tmp/portfolio-tests/compiled/lib/media-drop.js
node scripts/check-security.cjs /tmp/portfolio-tests/compiled
# With the local server running and local owner claimed:
python3 scripts/check-site.py
python3 scripts/check-cms.py
python3 scripts/check-security.py
pnpm build
pnpm audit
```

Run integration scripts one at a time against disposable/local emulator state only. They restore content and remove their test uploads. `check-security.py` temporarily swaps only the verified `local_seedy` owner row to exercise signed-in non-owner denial, restoring it in `finally`; do not interrupt that test or run against production data. Local sign-in emulates one identity and is not a production OAuth test. See `SECURITY.md` for findings, dependency review, and launch limitations.
