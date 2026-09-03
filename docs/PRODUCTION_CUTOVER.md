# Production Cutover and Rollback

Date: 2026-09-02
Status: Planning only. No DNS or domain changes executed.

## Read-Only DNS Audit (Current)

Domain: austinlesterstudio.com

- NS:
  - ns14.domaincontrol.com.
  - ns13.domaincontrol.com.
- SOA:
  - ns13.domaincontrol.com. dns.jomax.net. 2026090201 28800 7200 604800 600
- Apex A:
  - 172.66.3.26
  - 162.159.143.30
- Apex AAAA:
  - none observed
- Apex CNAME:
  - none observed
- www A:
  - 15.197.225.128
  - 3.33.251.168
- www AAAA:
  - none observed
- www CNAME:
  - none observed
- Apex TXT:
  - none observed
- Apex CAA:
  - none observed

Interpretation:

- Apex currently resolves to Cloudflare edge IPs.
- www currently resolves to non-Cloudflare A records.
- Authoritative DNS remains at GoDaddy nameservers (domaincontrol.com).

## Cutover Checklist

### Prerequisites

- Confirm production Worker health on workers.dev:
  - https://austin-lester-portfolio-production.austinlester.workers.dev
- Confirm latest production pre-cutover validation is fully green.
- Keep current DNS records documented so rollback is immediate.
- Ensure Cloudflare zone for austinlesterstudio.com exists and account access is available.
- Ensure Access policies are ready to update from workers.dev destination host to production domain host.

### GoDaddy / DNS authority decision

Choose exactly one path:

1. Keep GoDaddy nameservers authoritative:
- Continue managing DNS records in GoDaddy.
- Use Cloudflare for proxied Worker routing only if domain is moved under Cloudflare DNS authority later.

2. Move nameservers to Cloudflare (recommended for Worker custom domain + Access at zone level):
- In GoDaddy, replace NS with Cloudflare-assigned nameservers for the zone.
- Wait for delegation to complete before DNS record edits in Cloudflare are authoritative.

### Records to preserve before any edits

- Preserve existing apex A records:
  - 172.66.3.26
  - 162.159.143.30
- Preserve existing www A records:
  - 15.197.225.128
  - 3.33.251.168
- Preserve current NS/SOA evidence and TTL context.

### Attach austinlesterstudio.com to production Worker

After DNS authority is in Cloudflare and zone is active:

1. Attach apex domain route to Worker:
- In Cloudflare Workers routes/custom domains, bind austinlesterstudio.com to worker austin-lester-portfolio-production.

2. Handle www explicitly (choose one):
- Preferred: create redirect rule www -> apex (301), then only apex serves app.
- Alternative: attach www.austinlesterstudio.com as additional custom domain to same Worker.

3. TLS/edge:
- Confirm certificate status active for apex and www endpoint(s).

### Update Cloudflare Access destinations

- Existing Access destination currently points to:
  - austin-lester-portfolio-production.austinlester.workers.dev
- Update Access application destination hostname to:
  - austinlesterstudio.com
  - and www.austinlesterstudio.com if served directly (not redirected)
- Keep same policy intent for /studio and /api/studio/* protections.
- Re-test anonymous access behavior after destination update.

### Immediate post-cutover tests

- Public checks:
  - /
  - /work
  - /about
  - /contact
  - all published case studies
  - /robots.txt
  - /sitemap.xml
  - /api/media/{known-public-id}
- Access checks (anonymous):
  - /studio -> Access login redirect
  - /api/studio/media -> Access login redirect
- Access spoof-resistance:
  - spoofed x-openai-* headers still do not bypass
- Authenticated owner checks:
  - Studio dashboard loads
  - Content Registry loads
  - Site Map loads
  - Media Studio loads
  - Thumbnails load
  - Save workflow persists to D1

## Rollback Checklist

Goal: restore traffic back to current ChatGPT Sites deployment quickly if cutover regressions appear.

### Preserve rollback capability

- Do not delete current ChatGPT Sites DNS target records until stabilization window passes.
- Keep a recorded snapshot of pre-cutover DNS values.
- Do not remove previous www target until apex and www checks remain green for agreed window.

### Rollback steps

1. Revert DNS for apex and www to pre-cutover values recorded during audit.
2. If nameservers were changed, ensure authoritative DNS path matches where rollback records are edited.
3. Remove or disable Worker custom-domain route(s) for apex/www if they conflict with rollback targets.
4. Re-run smoke tests on ChatGPT Sites destination:
- public pages
- robots/sitemap
- expected media behavior
5. Keep Cloudflare Access configuration available but disable or retarget app destination as needed so studio auth behavior is predictable during rollback.

### DNS values needed for rollback (from current audit)

- Apex A:
  - 172.66.3.26
  - 162.159.143.30
- www A:
  - 15.197.225.128
  - 3.33.251.168
- NS (if preserving current authority model):
  - ns14.domaincontrol.com.
  - ns13.domaincontrol.com.

## Stop Condition

- If any post-cutover validation fails for public availability, Access boundary, or owner workflow persistence, stop rollout and execute rollback immediately.
