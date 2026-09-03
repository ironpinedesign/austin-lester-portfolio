# Domain Cutover Phase A - DNS Authority Migration Only

Date: 2026-09-03
Scope: Move authoritative DNS from GoDaddy to Cloudflare while keeping current ChatGPT Sites traffic unchanged.

## Hard Boundary

- Do not attach Worker custom domain yet.
- Do not point apex/www to Worker yet.
- Do not change Access destinations to real domain yet.
- Do not delete old DNS records.

## Final Read-Only DNS Inventory (Public)

Domain: austinlesterstudio.com

### Apex

- A:
  - 162.159.143.30
  - 172.66.3.26
- AAAA: none observed
- CNAME: none observed
- MX: none observed
- TXT: none observed
- CAA: none observed
- SRV: none observed
- NS:
  - ns13.domaincontrol.com.
  - ns14.domaincontrol.com.
- SOA:
  - ns13.domaincontrol.com. dns.jomax.net. 2026090201 28800 7200 604800 600
- DS: none observed

### www

- A:
  - 3.33.251.168
  - 15.197.225.128
- AAAA: none observed
- CNAME:
  - austinlesterstudio.com.
- MX: none observed
- TXT: no dedicated TXT observed (name resolves through CNAME chain)
- CAA: none observed
- SRV: none observed

### DMARC

- _dmarc.austinlesterstudio.com TXT:
  - "v=DMARC1; p=quarantine; adkim=r; aspf=r; rua=mailto:dmarc_rua@onsecureserver.net;"

### Known verification / service records checked

- _domainconnect.austinlesterstudio.com:
  - CNAME _domainconnect.gd.domaincontrol.com.
  - TXT "domainconnect.api.godaddy.com"
- No public TXT/CNAME answers observed for:
  - _acme-challenge
  - _github-challenge
  - google-site-verification
  - atlassian-domain-verification
  - _amazonses
  - _facebook-domain-verification
  - _globalsign-domain-verification
  - selector1._domainkey
  - selector2._domainkey
  - k1._domainkey
  - k2._domainkey

## DNSSEC/DS Status

- DS record is not present at parent lookup.
- DNSSEC migration blocker: none detected from public DS check.

## Required Record Preservation During Phase A

Cloudflare DNS must initially preserve at minimum:

- A @ 172.66.3.26
- A @ 162.159.143.30
- A www 15.197.225.128
- A www 3.33.251.168
- plus every other existing record above (including _dmarc and _domainconnect)

Proxy mode for current website records in this phase:

- Keep DNS only during authority migration unless there is a specific, deliberate reason to proxy.

## Cloudflare Zone Existence Check

- API check from current authenticated Wrangler token returned no visible zones in the current token scope.
- Treat as: zone not yet created in the currently-authenticated account scope.

## Minimal Cloudflare Zone Setup Steps (if not present)

1. Cloudflare Dashboard -> Add a domain.
2. Enter austinlesterstudio.com.
3. Select Free plan (or preferred plan).
4. Import DNS records.
5. Manually ensure imported records exactly match this inventory (do not rely on quick scan alone).
6. Keep preserved apex/www records as DNS only.
7. Save and note the two assigned Cloudflare nameservers.

## Manual Gate Before Nameserver Change

Do not change GoDaddy nameservers until this is true:

- Every Cloudflare DNS record matches the complete GoDaddy record list/inventory exactly.
- Preserved apex/www A records are present and DNS only.
- _dmarc and _domainconnect records are present.

Once matched, proceed to GoDaddy nameserver replacement with the exact two Cloudflare nameservers shown in the zone onboarding screen.
