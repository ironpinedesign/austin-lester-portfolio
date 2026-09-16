# Figma AI Prompt — ALS Authority Reconciliation

Update the existing **Austin Lester Studio — Portfolio** Figma file (`p8xUolWIGV7cajcL8Bi9SJ`) to reconcile its authority documentation with the verified repository state. This is an authority/documentation maintenance task only. **Do not redesign the website, restyle the established system, alter approved page compositions, or create a parallel design system.**

## Governing model

Preserve the existing restrained ALS editorial visual system and use this authority model consistently:

- **Figma** is `DESIGN AUTHORITY` for approved visual intent, layout composition, canonical responsive modes, typography specifications, component visual states, and interaction intent.
- **Git** is implementation authority for executable tokens, responsive behavior, component existence, DOM and interaction semantics, and automated tests.
- **D1** is the current editable runtime content state.
- **R2** stores deployed media binaries; Git governs their associations and metadata.
- **Production** is verification evidence, not design or code authority.

Use only the approved status vocabulary below:

- `DESIGN AUTHORITY`
- `STRUCTURAL SOURCE`
- `IMPLEMENTED`
- `PARTIAL`
- `NOT IMPLEMENTED`
- `CODE AUTHORITY` only where a verified repository-backed implementation and evidence record exist

Do not use unqualified `READY` as an implementation status. If workflow readiness must be retained, write `READY FOR DESIGN REVIEW` or `READY FOR IMPLEMENTATION`.

## Scope and required updates

### Page 06 — PAGE TEMPLATES (`67:230`)

Update the About template documentation so it references and includes the approved continuation already defined on page 99:

`Opening → Perspective → Approach → Capabilities → Testimonials → Selected Clients → Contact`

Treat page 99 as the approved source for the Testimonials and Selected Clients continuation. Preserve its five-state bounded testimonial slider, 20-logo client wall, About-only placement, responsive behavior, and hierarchy. Do not redesign or reinterpret those sections.

### Page 08 — IMPLEMENTATION MATRIX (`67:232`)

Replace stale or hypothetical implementation mappings with the actual repository identifiers below. Add explicit fields for implementation status, source/evidence, and last verified commit.

Record these verified items:

| Issue | Status | Repository source / stable identifiers | Verification | Verified commit |
| --- | --- | --- | --- | --- |
| `ALS-AUTH-001` | `IMPLEMENTED` | `app/globals.css`: `--als-outer-gutter`, `--als-content-rail`, `.wrap`, `.about-wrap` | `scripts/check-global-authority.mjs` and `scripts/check-about-social-proof.mjs` at 390/768/1024/1440/1760 | `714f66c` |
| `ALS-AUTH-002` | `IMPLEMENTED` | `app/globals.css`: `--als-nav-height`, `.site-nav`, `.filter-bar`, `.site-nav nav` | `scripts/check-global-authority.mjs` at all five canonical widths | `714f66c` |
| `ALS-AUTH-003` | `IMPLEMENTED` | `app/components/layouts/CaseLayoutSystem.module.css`: `.textSidecar01`, `.mediaSidecar01`, `.mediaSidecar02`, `@media(max-width:1023px)` | Representative Kryptek text/media sidecars in `scripts/check-global-authority.mjs` at all five canonical widths | `222fa0f` |
| `ALS-AUTH-009` | `IMPLEMENTED` | `app/globals.css`: `--als-interaction-target` and shared navigation/disclosure/media-control selectors | Rendered clickable/focusable bounding boxes in `scripts/check-global-authority.mjs` at all five canonical widths | `714f66c` |
| `ALS-AUTH-010` | `IMPLEMENTED` | `app/layout.tsx`: `RootLayout` footer action; `app/page.tsx`: `Home` intent navigation | Semantic-arrow assertions in `scripts/check-global-authority.mjs` | `714f66c` |

Use the actual code token names. Do not retain obsolete mappings such as `--color-bone` where the repository identifier is `--paper`. Do not imply that a Figma component has a code counterpart unless the matrix includes verifiable repository evidence.

### Page 09 — CHANGELOG (`67:233`)

Correct verification and status claims so the changelog distinguishes approved Figma structure from verified implementation. Add a concise 2026-09-16 reconciliation entry for the five implemented issues listed above, with their commits and focused verification script. Qualify earlier claims that pages 06–07 were verified: page 06 required the About continuation update, and the KIS05 System Browser remains unimplemented.

### Pages 11–12 — STRUCTURAL AUTHORITY MAP / STRUCTURAL COMPONENT SOURCES (`376:114`, `397:114`)

Preserve these pages as useful structural documentation, but replace inaccurate `CODE AUTHORITY` and unqualified `READY` labels:

- Use `STRUCTURAL SOURCE` for approved hierarchy, anatomy, or machine-readable Figma structure that does not have verified repository evidence.
- Use `DESIGN AUTHORITY` for approved visual or interaction intent.
- Use `NOT IMPLEMENTED` when the approved structure has no repository counterpart.
- Use `PARTIAL` when only part of the recorded contract exists in Git.
- Use `IMPLEMENTED` only when repository source and verification evidence are recorded.
- Reserve `CODE AUTHORITY` for verified repository-backed implementations; the repository remains the underlying authority.

Do not describe System Browser, Chapter Nav, Process Flow, or Sticky Story as implemented merely because structural sources exist. Specifically, **do not mark the KIS05 System Browser implemented**.

## Variable and page hygiene

- Mark the generated `austinlesterstudio.com` variables and styles as **NON-AUTHORITATIVE / REFERENCE ONLY**. Exclude them from token synchronization and implementation mapping.
- Keep the canonical `ALS/Color`, `ALS/Spacing`, and `ALS/Radius` collections as the useful system variables.
- Keep page 10 — LIVE SITE REPLICA explicitly outside the authority system. It is observational reference, not design or implementation authority.
- Preserve page 99 — ABOUT / SOCIAL PROOF. It is already aligned; only link/reference it from the appropriate authority documentation.
- Do not modify application screens, approved component sources, project compositions, or page 99 while performing this documentation reconciliation.

## Claims that must remain unresolved

Do not invent, infer, or mark complete any unresolved contract:

- Do not invent missing responsive typography values or convert proposed values into authority.
- Do not invent per-media fit, focal-position, responsive-delivery, or mobile-caption rules.
- Do not mark KIS05 System Browser implemented.
- Do not claim Media Inspect is complete; retain `PARTIAL` or the existing unresolved status where appropriate.
- Do not mark Editorial Grid 01, unused layout families, Kryptek asset completeness, D1 reconciliation, or R2/media governance complete unless the existing authority documents already provide repository-backed evidence.

## Completion audit

Before finishing, verify that:

1. Page 06 references the page 99 About continuation without redesigning it.
2. Page 08 uses actual repository identifiers and includes status, evidence, verification, and commit fields.
3. Page 09 no longer overstates verification.
4. Pages 11–12 use the approved authority vocabulary and do not equate Figma structure with implementation.
5. `ALS-AUTH-001`, `ALS-AUTH-002`, `ALS-AUTH-003`, `ALS-AUTH-009`, and `ALS-AUTH-010` are consistently marked `IMPLEMENTED` with the evidence above.
6. Generated `austinlesterstudio.com` variables/styles are visibly labeled reference-only.
7. Page 10 remains outside the authority system and page 99 remains unchanged.
8. No unresolved typography, media, System Browser, or Media Inspect claim has been invented or upgraded.

Return a concise change summary listing the updated pages, the authority/status corrections made, and any item you could not reconcile without a human decision.
