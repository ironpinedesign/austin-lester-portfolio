# Production Pre-Cutover Validation

Date: 2026-09-02
Branch: migration/cloudflare

## Scope and Guardrails

- No DNS changes were performed.
- No GoDaddy, nameserver, or custom-domain changes were performed.
- No ChatGPT Sites production resources were modified.
- No merge to main was performed.

## Production Architecture

- Worker service name: austin-lester-portfolio-production
- Worker URL: https://austin-lester-portfolio-production.austinlester.workers.dev
- Current Worker version: 53c3eb56-7567-484d-9dbf-dac41e30ad36 (latest observed deployment entry; source: Secret Change)
- D1 database: austin-lester-portfolio-production-db
- D1 database ID: 324f6fe6-6280-4731-bf7b-4f19dd19a537
- R2 bucket: austin-lester-portfolio-production-files
- Auth mode: Cloudflare Access in front of Studio pages and Studio API paths

## D1 State Validation (Remote Production)

- studio_owner: 1
- media: 2
- placements: 1
- content_state: 1
- Contact email present in content_state: yes (austinlesterstudio@gmail.com)
- LinkedIn present in content_state: yes (https://www.linkedin.com/in/austin-lester-435095202/)

Note: contact values are sourced from content_state JSON. The legacy settings table is not the authoritative source for these fields in current app behavior.

## Route and Access Validation

### Public routes (anonymous)

- / -> 200
- /work -> 200
- /about -> 200
- /contact -> 200
- /work/truckvault-3d-configurator -> 200
- /work/kryptek-identity-system -> 200
- /work/kryptek-ecommerce-content-engine -> 200
- /work/fieldcraft-survival -> 200
- /work/flyway-camouflage-launch -> 200
- /work/2024-big-game-guide -> 200
- /work/kryptek-paid-media-system -> 200
- /work/the-public-standard -> 200
- /work/kryptek-merchandise -> 200
- /robots.txt -> 200
- /sitemap.xml -> 200

### Studio protection (anonymous)

- /studio -> 302 to Cloudflare Access login
- /api/studio/media -> 302 to Cloudflare Access login

### Spoofed OpenAI headers test (anonymous)

- /studio with spoofed x-openai-* headers -> still 302 to Cloudflare Access login
- /api/studio/media with spoofed x-openai-* headers -> still 302 to Cloudflare Access login
- Result: spoofing these headers does not bypass Access.

## Studio Functional Validation

- Authenticated Studio dashboard: verified in-session (owner claim complete)
- Content Registry screen loads: verified in-session
- Site Map screen loads: verified in-session
- Media Studio screen loads: verified in-session
- Media upload/save path: verified in-session (new media row observed in production D1)
- Thumbnail rendering for current media: verified in-session

## Media Integrity Validation

Known migrated production media asset checked via public endpoint:

- Media ID: 46385166-e413-482a-8bf6-fb6dbf364725
- Endpoint: /api/media/46385166-e413-482a-8bf6-fb6dbf364725
- Status: 200
- Bytes: 758329
- SHA256: 2b55a02e8cec9b39f29dafd0ecdeba4c4e24515a7947440cb0423b03d09de0ee
- Result: matches expected bytes/checksum from migration baseline.

Additional newer media row exists in D1 and is not publicly exposed by the public endpoint unless placed on an active public slot.

## Source Validation

- TypeScript: corepack pnpm exec tsc --noEmit -> pass
- Build: corepack pnpm build -> pass
- Auth check: corepack pnpm run check:access-jwt -> pass
- Migration check: corepack pnpm run check:migration-tools -> pass

## Outstanding Attention Before Domain Cutover

- Custom domain is not attached yet (intentionally). Production currently serves from workers.dev.
- Access application destination(s) still reference the temporary workers.dev host and must be updated to real domain hostnames at cutover.
- Rollback readiness depends on preserving current DNS records for ChatGPT Sites until post-cutover validation is complete.
