# Austin Lester Studio System Authority

**Status:** Binding architecture contract  
**Applies to:** Design, implementation, content, media, verification, and future ALS work  
**Source audit:** [`ALS_SYSTEM_AUTHORITY_AUDIT.md`](./ALS_SYSTEM_AUTHORITY_AUDIT.md)

## Purpose

This document defines which source controls each part of Austin Lester Studio and how disagreements are resolved. It is intentionally small. It does not replace detailed design specifications, source code, tests, or content records.

The governing principle is:

> Authority follows the nature of the claim. Figma defines intended design; Git defines implemented behavior; D1 defines current editable production content; R2 stores deployed media; production provides verification evidence.

No source inherits another source's authority merely because it is newer or visible in production.

## Authority hierarchy

### Figma — Design Authority

Figma owns:

- visual intent;
- layout composition;
- canonical responsive modes;
- typography specifications;
- component visual states;
- project-specific composition; and
- interaction intent and prototypes.

Figma does **not** establish that code exists. A Figma component may be marked `IMPLEMENTED` or `CODE AUTHORITY` only when its repository implementation has been verified and the required evidence is recorded.

Generated replicas, imported variables, and non-canonical styles are reference material unless explicitly promoted. Only the canonical ALS foundations and approved authority frames are implementation-facing design authority.

### Git — Implementation Authority

Git owns:

- executable design tokens and CSS/custom properties;
- responsive behavior;
- component existence and variants;
- TypeScript schemas and layout identifiers;
- DOM and interaction semantics;
- keyboard and focus behavior;
- media configuration and associations;
- checked-in content defaults;
- implementation history; and
- automated tests.

Repository source is authoritative for what is actually implemented. Documentation and Figma must not claim that a component, variant, or behavior exists when no corresponding repository source exists.

### D1 — Runtime Content State

D1 owns the currently editable production content state. The application may resolve D1 values ahead of checked-in defaults.

D1 must not become an unreconciled second canonical content system. Git remains the reviewed, version-controlled baseline for content schemas and defaults.

The required reconciliation flow is:

> D1 change → export and diff → review → reconcile approved state with Git.

Every production content audit must record the D1 state or export inspected. The detailed workflow is defined in [`CONTENT_AUTHORITY.md`](./CONTENT_AUTHORITY.md).

### R2 — Media Binary Store

R2 owns deployed media binaries. Git owns the configuration and metadata necessary to understand and reproduce their use.

Where applicable, Git should record:

- project/section association;
- normalized filename or R2 key;
- intended slot;
- fit behavior and focal position;
- intrinsic dimensions or aspect;
- alt text;
- usage permission and approval status; and
- caption policy.

An R2 object existing in production does not by itself approve its association, crop, accessibility text, or presentation.

### Production — Verification Evidence

Production is evidence of what a visitor currently receives. It is not design authority and is not implementation authority.

A difference between production and Figma, Git, D1 records, or R2 metadata triggers investigation and reconciliation. Production must not be treated as automatically correct merely because it is live.

## Status vocabulary

Use these terms in Figma and architecture documentation:

| Status | Meaning |
| --- | --- |
| `DESIGN AUTHORITY` | Approved visual or interaction intent. It does not claim implementation. |
| `STRUCTURAL SOURCE` | Approved hierarchy, anatomy, or machine-readable design structure. It does not claim implementation. |
| `IMPLEMENTED` | A repository-backed implementation exists and the minimum evidence record is complete. |
| `PARTIAL` | Some approved structure or behavior exists in Git, but the recorded contract is incomplete. |
| `NOT IMPLEMENTED` | Approved or proposed design exists without a repository implementation. |
| `CODE AUTHORITY` | Reserved for a documented, verified repository-backed implementation. The repository remains the underlying authority. |

Do not use `READY` as a substitute for implementation status. If retained for workflow planning, qualify it as `READY FOR DESIGN REVIEW` or `READY FOR IMPLEMENTATION`.

## Precedence rules

### Figma versus Git

When Figma documents an intended component and Git has no corresponding implementation:

- Figma is `DESIGN AUTHORITY` or `STRUCTURAL SOURCE`;
- Git is authority for the current implemented state;
- status is `NOT IMPLEMENTED`; and
- the Figma structure must not be called `CODE AUTHORITY`.

When Git implements only part of the approved contract, status is `PARTIAL`. Record the missing behavior rather than implying equivalence.

### Git versus production

When production differs from checked-in implementation, investigate deployment, runtime configuration, caching, content overrides, and release state. Do not silently modify Git to match production.

After the cause is known:

- correct the deployment/runtime state when Git is intended;
- update Git through normal review when an intentional implementation change is approved; or
- document the difference as unresolved.

### D1 versus Git content

D1 may temporarily contain newer approved production copy. D1 is authoritative for what the current editable production content state contains; Git is authoritative for schemas, defaults, and the reviewed baseline.

The difference is acceptable only while it is exported, diffable, attributable, and queued for reconciliation. Follow [`CONTENT_AUTHORITY.md`](./CONTENT_AUTHORITY.md).

### Old Figma contract versus newer approved implementation

If evidence shows that an implementation was intentionally approved after a Figma contract, mark Figma outdated and reconcile the design documentation. Do not modify correct, approved code solely to reproduce stale Figma documentation.

The evidence must identify the approval/change, source path, and verified commit. An unexplained production difference is not sufficient evidence.

### Conflicting Figma sources

Use the newest explicitly approved authority source for the same scope. A project-specific authority source overrides a generic template only for that documented project/component scope. Record the supersession rather than leaving both sources apparently current.

## Canonical responsive modes

ALS uses five canonical responsive widths:

| Mode | Width | Outer gutter | Content rail |
| --- | ---: | ---: | ---: |
| Mobile | 390px | 24px | 342px |
| Tablet | 768px | 40px | 688px |
| Compact desktop | 1024px | 56px | 912px |
| Desktop | 1440px | 80px | 1280px |
| Wide desktop | 1760px | 80px | 1600px |

These values are the canonical outer-container contract identified by `ALS-AUTH-001`. Components may change their internal composition at canonical modes, but must not invent different outer gutters unless an approved full-bleed or project-specific exception is documented.

Responsive typography is **DECISION REQUIRED** under `ALS-AUTH-004`. Do not infer or invent missing values. Until a complete five-mode type table is approved, existing code remains implementation authority and Figma remains authority for the approved values it explicitly defines.

## Contract evidence

Before Figma or documentation may describe an item as `IMPLEMENTED` or `CODE AUTHORITY`, record at minimum:

| Evidence | Requirement |
| --- | --- |
| Repository source | Exact repository-relative source path. |
| Identifier | Component export, layout ID, token group, or other stable identifier. |
| Route or test | Relevant route and/or test when behavior is measurable. Use `N/A` only with a reason. |
| Last verified commit | Full or unambiguous abbreviated Git commit. |
| Status | `IMPLEMENTED` or `PARTIAL`, based on the approved contract. |

For an interactive component, the evidence should also name the verified keyboard/focus behavior, reduced-motion behavior where relevant, and canonical widths exercised.

Missing evidence means the item remains `DESIGN AUTHORITY`, `STRUCTURAL SOURCE`, `PARTIAL`, or `NOT IMPLEMENTED` as appropriate.

## Change protocol

For design-led or feature work:

1. Design or propose in Figma when visual exploration is required.
2. Mark the item `DESIGN AUTHORITY` and/or `STRUCTURAL SOURCE`.
3. Approve the contract, including responsive and interaction behavior.
4. Implement in Git.
5. Add or update tests where behavior is measurable.
6. Verify the released result in production.
7. Record the implementation evidence in Figma and/or architecture documentation.
8. Change status to `IMPLEMENTED`, or `PARTIAL` when the full contract is not present.

For implementation-led maintenance that does not alter visual intent, Git may lead. Figma reconciliation is required only when the documented visual or interaction contract changes. Bug fixes must still be tested and verified before documentation claims are updated.

Content-only changes follow [`CONTENT_AUTHORITY.md`](./CONTENT_AUTHORITY.md). Media changes must reconcile both the R2 binary and the Git-held association/metadata.

## Implementation evidence

| Issue | Status | Repository source and stable identifier | Verification | Last verified commit |
| --- | --- | --- | --- | --- |
| `ALS-AUTH-001` | `IMPLEMENTED` | `app/globals.css`: `--als-outer-gutter`, `--als-content-rail`, `.wrap`, `.about-wrap` | `scripts/check-global-authority.mjs`; `scripts/check-about-social-proof.mjs`; five canonical widths | `714f66c` |
| `ALS-AUTH-002` | `IMPLEMENTED` | `app/globals.css`: `--als-nav-height`, `.site-nav`, `.filter-bar`, `.site-nav nav` | `scripts/check-global-authority.mjs`; five canonical widths | `714f66c` |
| `ALS-AUTH-003` | `IMPLEMENTED` | `app/components/layouts/CaseLayoutSystem.module.css`: `.textSidecar01`, `.mediaSidecar01`, `.mediaSidecar02`, `@media(max-width:1023px)` | Representative Kryptek text/media sidecars in `scripts/check-global-authority.mjs`; five canonical widths | `222fa0f` |
| `ALS-AUTH-009` | `IMPLEMENTED` | `app/globals.css`: `--als-interaction-target` and shared navigation/disclosure/media-control selectors | Rendered clickable bounds in `scripts/check-global-authority.mjs`; five canonical widths | `714f66c` |
| `ALS-AUTH-010` | `IMPLEMENTED` | `app/layout.tsx`: `RootLayout`; `app/page.tsx`: `Home` intent navigation | Semantic-arrow assertions in `scripts/check-global-authority.mjs` | `714f66c` |

## Decisions still open

This contract intentionally does not resolve the following audit decisions:

- the complete five-mode responsive typography table (`ALS-AUTH-004`);
- the final Media Inspect scope (`ALS-AUTH-008`);
- per-slot media fit, focal position, responsive delivery, and mobile caption rules (`ALS-AUTH-014`);
- final Kryptek media approval and completeness (`ALS-AUTH-015`); and
- whether approved but unused layout families should be implemented before a project needs them (`ALS-AUTH-013`).

These require explicit approval or implementation work. They must not be filled in by assumption.
