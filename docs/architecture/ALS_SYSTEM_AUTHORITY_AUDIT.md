# Austin Lester Studio System Authority Audit

**Audit date:** 2026-09-16  
**Mode:** Read-only design, implementation, and production audit  
**Figma file:** `Austin Lester Studio — Portfolio` (`p8xUolWIGV7cajcL8Bi9SJ`)  
**Repository baseline:** `main` at `c5216ee`  
**Production:** `https://austinlesterstudio.com/`

This audit compares the designated Figma authority pages, the current repository, and the live Cloudflare-served site. Figma page `10 — LIVE SITE REPLICA` was intentionally excluded. No Figma, application, content, asset, dependency, deployment, or Cloudflare configuration was changed.

**Implementation update — 2026-09-16:** `ALS-AUTH-001`, `ALS-AUTH-002`, `ALS-AUTH-009`, and `ALS-AUTH-010` were implemented and verified in commit `714f66c`. Their evidence records below supersede the original implementation-status assessment; the remaining audit findings are unchanged.

Status vocabulary used throughout: **ALIGNED**, **PARTIALLY ALIGNED**, **NOT ALIGNED**, **NOT IMPLEMENTED**, **FIGMA OUTDATED**, **IMPLEMENTATION OUTDATED**, and **AMBIGUOUS / AUTHORITY NOT YET DEFINED**.

## 1. Executive Summary

The ALS system is **partially aligned**. Its visual fundamentals are stable: the canonical palette, three-font system, restrained motion posture, About social-proof composition, and the large-screen Kryptek layout language agree closely across Figma, code, and production. The repository also has a coherent content/configuration architecture rather than a collection of hard-coded pages.

The principal weakness is not visual quality; it is authority clarity. Figma currently mixes design authority, intended behavior, implementation status, and machine-readable structural sources. The repository is the only reliable authority for what code exists, while production D1 values can supersede checked-in copy. Those boundaries are not documented tightly enough.

This audit records **15 material issues**:

- Three system-wide responsive mismatches: shared rails, the 768 navigation height, and the 1024 sidecar breakpoint.
- Two typography/template mismatches: fluid production type versus breakpoint-controlled Figma type, and a stale About template.
- Four interaction/component gaps: the missing six-state System Browser, overstated “code authority” labels, a partial Media Inspect implementation, and undersized interaction targets.
- Three governance/documentation gaps: arrow conventions, a stale implementation matrix, and ambiguous D1-versus-Git content authority.
- Three layout/media gaps: the approved Editorial Grid 01 is not implemented, media-fit/delivery behavior is under-specified, and the production Kryptek study is too incomplete to validate fully.

The new About Testimonials and Selected Clients systems are a notable exception: their hierarchy, ordering, five responsive modes, logo counts, gutters, controls, and accessibility-sized slider targets are **ALIGNED** in Figma, code, and production.

The Kryptek Identity System page has **material image/content completeness issues**, but no confirmed large-screen grid failure. At the time of inspection only 4 of 18 configured media positions resolved to actual images; 14 rendered as placeholders. Existing large-screen placements are coherent, but mobile crops, caption visibility, focal positioning, and all placeholder-backed sections cannot yet be treated as visually approved production behavior.

## 2. Current Authority Model

The project already uses a practical, but mostly implicit, split-authority model:

| Concern | Current effective authority | Audit finding |
| --- | --- | --- |
| Visual foundations | Figma pages 01–05 and ALS variables/styles | Colors and font families align; responsive typography and some breakpoints do not. |
| Page hierarchy and responsive composition | Figma templates/project sources, with page 99 authoritative for About social proof | Works when a specific source exists; older template pages can become stale. |
| Component existence and runtime behavior | Repository | Figma cannot legitimately declare code authority for components absent from the repository. |
| Case-study schema, section IDs, ordering, and default content | `content/projects.json`, `lib/projects.ts`, and the renderer/layout components | Coherent and typed, but some approved Figma layout families are absent. |
| Editable site copy | Production D1 `content_state`, falling back to checked-in content | Current production text can differ from Git without a required reconciliation record. |
| Media files | R2/API at runtime; configured associations in Git | Association is versioned, but the final assets and fit behavior are not fully governed in Git. |
| Observed release truth | Production site | Production is evidence, not the design or code authority. It is useful for detecting drift. |
| Deployment process | Repository scripts and guarded manual Cloudflare release flow | No release action was performed in this audit. |

The model is sound in principle. The problem is that it is not stated in one binding contract, and some Figma pages use “CODE AUTHORITY” or “READY” to describe intended component structures rather than verified repository implementations.

## 3. Authority Page Audit

| Figma authority page | Node | Status | Findings |
| --- | --- | --- | --- |
| `00 — START HERE` | `67:224` | PARTIALLY ALIGNED | The system map and restrained editorial direction remain accurate. It does not adequately distinguish design authority from repository/runtime authority. |
| `01 — FOUNDATIONS` | `67:225` | PARTIALLY ALIGNED | Canonical colors, font families, radius posture, and reduced-motion intent align. The “explicit breakpoint typography” rule conflicts with widespread `clamp()`/viewport scaling in code. |
| `02 — RESPONSIVE GRID` | `67:226` | NOT ALIGNED | The 390/768/1024/1440/1760 rail contract is not shared globally. Navigation height at 768 differs, and sidecars remain stacked at 1024 even though Figma introduces them there. |
| `03 — GLOBAL COMPONENTS` | `67:227` | PARTIALLY ALIGNED | Navigation/footer structures are recognizable and About uses the correct gutters. Directional-arrow rules are not followed consistently; 768 navigation geometry differs. |
| `04 — CASE STUDY COMPONENTS` | `67:228` | PARTIALLY ALIGNED | Major sidecar, full-bleed, asymmetric-grid, and sequence families exist. `EDITORIAL GRID 01` has no repository implementation, and the 1024 sidecar contract is not honored. |
| `05 — INTERACTION STATES` | `67:229` | PARTIALLY ALIGNED | Reduced-motion handling and basic focus/hover behavior exist. Media Inspect and minimum target behavior are only partial; some exact behavior remains undefined. |
| `06 — PAGE TEMPLATES` | `67:230` | FIGMA OUTDATED | The About template predates Testimonials and Selected Clients. Page 99, code, and production now define the current About hierarchy. |
| `07 — PROJECT SPECIFIC` | `67:231` | PARTIALLY ALIGNED | Correctly separates project content from layout authority and explicitly flags KIS05 for a System Browser update. That required production update is still outstanding. |
| `08 — IMPLEMENTATION MATRIX` | `67:232` | FIGMA OUTDATED | Token names do not match the repository (`--color-bone` versus `--paper`, etc.), footer status is stale, and the component inventory is incomplete. |
| `09 — CHANGELOG` | `67:233` | PARTIALLY ALIGNED | The latest social-proof work and authority additions are represented. Claims that pages 06–07 are verified need qualification because page 06 is stale and KIS05 is not updated. |
| `11 — STRUCTURAL AUTHORITY MAP` | `376:114` | PARTIALLY ALIGNED | Useful as intended structure. System Browser, Chapter Nav, Process Flow, and Sticky Story are not all repository components, so “ready” must not mean implemented. |
| `12 — STRUCTURAL COMPONENT SOURCES` | `397:114` | AMBIGUOUS / AUTHORITY NOT YET DEFINED | Strong machine-readable Figma source definitions, but “AUTHORITY: CODE” is inaccurate for structures with no code counterpart. |
| `13 — INTERACTION PROTOTYPES` | `422:124` | PARTIALLY ALIGNED | Correctly reserves keyboard/focus details for the browser. Demonstrated Media Inspect/System Browser behavior exceeds current production behavior. |
| `99 — ABOUT / SOCIAL PROOF` | `519:114` | ALIGNED | Page hierarchy, five-state slider, 20-logo wall, About-only placement, all five gutters, columns, target sizes, and bounded controls match production. |

Two Figma hygiene observations are important but are not design defects:

- The canonical `ALS/Color`, `ALS/Spacing`, and `ALS/Radius` collections are the useful system variables. The large generated `austinlesterstudio.com` variable/style collection should be explicitly marked non-authoritative and excluded from any future token synchronization.
- Canonical ALS variables currently have no Web code syntax. That makes manual name translation unavoidable and helped the implementation matrix become stale.

## 4. Material Mismatches

### ALS-AUTH-001 — Responsive rails are not one shared system

- **Status:** IMPLEMENTED
- **Contract:** Page 02 and ALS spacing modes specify gutters/rails of `24/342`, `40/688`, `56/912`, `80/1280`, and `80/1600` at 390, 768, 1024, 1440, and 1760.
- **Figma:** The five modes are explicit and page 99 uses them correctly.
- **Code:** Base `.wrap` resolves to 20px per side below 850px and 40px per side on ordinary desktop routes. About has dedicated canonical rules; selected Kryptek rules only override some widths.
- **Production:** Home/work/contact measured 20px at 390 and 40px at 1440. About measured 24/40/56/80/80. Kryptek measured 24px at 390 and 80px at 1440/1760, but 20px at 768 and 40px at 1024.
- **Recommended Authority:** Figma five-mode spacing contract.
- **Reason:** It is specific, already proven by About, and is the intended cross-site system.
- **Required Action:** Replace route-specific rail patches with one canonical responsive container contract, then explicitly opt out only where a component requires full bleed.
- **Affected Source:** `app/globals.css`, `app/components/layouts/CaseLayoutSystem.module.css`.
- **Implementation Evidence:** Commit `714f66c`; `app/globals.css`; identifiers `--als-outer-gutter`, `--als-content-rail`, `.wrap`, and `.about-wrap`; verified by `scripts/check-global-authority.mjs` and `scripts/check-about-social-proof.mjs` at 390/768/1024/1440/1760.

### ALS-AUTH-002 — Navigation height differs at 768

- **Status:** IMPLEMENTED
- **Contract:** ALS spacing modes specify navigation heights `56/64/68/68/68`.
- **Figma:** 768 uses 64px.
- **Code:** Mobile navigation switches directly from 56px to the 68px desktop treatment.
- **Production:** The navigation is 68px at 768.
- **Recommended Authority:** Figma spacing variable.
- **Reason:** This is a discrete system value, not a subjective visual choice.
- **Required Action:** Add the 768 navigation mode and test the menu/brand vertical alignment.
- **Affected Source:** `app/globals.css`, `app/components/SiteNavigation.tsx`.
- **Implementation Evidence:** Commit `714f66c`; `app/globals.css`; identifiers `--als-nav-height`, `.site-nav`, `.filter-bar`, and `.site-nav nav`; verified by `scripts/check-global-authority.mjs` at 390/768/1024/1440/1760.

### ALS-AUTH-003 — Sidecars do not begin at the documented 1024 mode

- **Status:** IMPLEMENTATION OUTDATED
- **Contract:** Page 02 introduces the text/media sidecar at 1024; page 04 defines the sidecar family and intermediate behavior.
- **Figma:** 1024 is a two-column mode.
- **Code:** Case sidecars collapse through `max-width: 1100px`.
- **Production:** Kryptek sidecar sections are stacked at 1024.
- **Recommended Authority:** Figma responsive-grid contract.
- **Reason:** The 1024 rail, text column, media column, and gap values are already defined as a coordinated mode.
- **Required Action:** Move the sidecar breakpoint to the canonical mode and verify text measure/media width at 1024.
- **Affected Source:** `app/components/layouts/CaseLayoutSystem.module.css`.

### ALS-AUTH-004 — Typography scales fluidly where Figma requires explicit modes

- **Status:** AMBIGUOUS / AUTHORITY NOT YET DEFINED
- **Contract:** Page 01 says type is controlled at explicit breakpoints, not proportionally to viewport width.
- **Figma:** Exact canonical styles are defined, but several 768/1024 values remain proposed or implied rather than fully enumerated per component.
- **Code:** Headings and case-study display type use many `clamp(...vw...)` rules.
- **Production:** Type interpolates between widths; for example, the case title measured approximately 58.37px at 768 and 109.44px at 1440.
- **Recommended Authority:** Figma principle, followed by an explicit per-mode type table approved before code changes.
- **Reason:** Replacing fluid type without settled intermediate values would create a new undocumented interpretation.
- **Required Action:** Decide exact 390/768/1024/1440/1760 sizes for each responsive text role, then replace conflicting viewport interpolation selectively.
- **Affected Source:** Page 01 typography contract, `app/globals.css`, `app/components/layouts/CaseLayoutSystem.module.css`.

### ALS-AUTH-005 — The About page template is stale

- **Status:** FIGMA OUTDATED
- **Contract:** Page 06 is intended to document current page composition.
- **Figma:** Page 06 ends the About content model after Capabilities; page 99 defines the approved social-proof continuation.
- **Code:** About renders Opening → Perspective → Approach → Capabilities → Testimonials → Selected Clients → global footer.
- **Production:** Matches page 99 and the code.
- **Recommended Authority:** Page 99 plus repository/production for the current About page.
- **Reason:** This is the explicitly approved and released composition.
- **Required Action:** Update page 06 to reference page 99 and show the full hierarchy; avoid duplicating detailed social-proof geometry there.
- **Affected Source:** Figma page 06 only.

### ALS-AUTH-006 — KIS05 System Browser is approved but not implemented

- **Status:** NOT IMPLEMENTED
- **Contract:** Page 07 requires `SYSTEM STAGE 01 + SPECIMEN FIELD 02 + 6-tab System Browser`; pages 11–13 define its structure and states.
- **Figma:** The six-state browser is an intended project-specific update.
- **Code:** KIS05 renders a static numbered item list, three media positions, Info Disclosure, and Extended Context. No `SystemBrowser` component exists.
- **Production:** The section remains the static implementation.
- **Recommended Authority:** Figma pages 07 and 11–13 for the intended experience; repository remains authority for current state until implemented.
- **Reason:** Page 07 explicitly marks the production update as required.
- **Required Action:** Create a bounded, keyboard-operable six-state component, connect it to typed project configuration, and preserve a useful linear no-JavaScript reading order.
- **Affected Source:** `app/work/case-study-renderer.tsx`, `app/components/layouts/CaseLayoutSystem.tsx`, `content/projects.json`, new component/test files.

### ALS-AUTH-007 — Figma “code authority” labels overstate implementation

- **Status:** AMBIGUOUS / AUTHORITY NOT YET DEFINED
- **Contract:** Pages 11–12 label System Browser, Chapter Nav, Media Inspect, Process Flow, and Sticky Story as ready/code authority.
- **Figma:** Supplies clear structural sources.
- **Code:** Media Inspect exists in partial form. No `SystemBrowser`, `ChapterNav`, `ProcessFlow`, `StickyStory`, or `EditorialGrid` implementation was found.
- **Production:** Those absent components cannot be validated as production systems.
- **Recommended Authority:** Repository for code existence and behavior; Figma for intended structure and visual contract.
- **Reason:** A Figma component cannot be the authority for code that does not exist.
- **Required Action:** Rename the labels to `STRUCTURAL DESIGN AUTHORITY` or add an explicit implementation-status field linked to a real source path and test.
- **Affected Source:** Figma pages 11–12 and page 09 changelog terminology.

### ALS-AUTH-008 — Media Inspect implements only part of the approved behavior

- **Status:** PARTIALLY ALIGNED
- **Contract:** Page 12 defines separately addressable close/media/previous/next/index regions and responsive inline-versus-overlay behavior; page 13 demonstrates the sequence.
- **Figma:** Describes a navigable inspection experience.
- **Code:** The dialog supports open, close, backdrop close, Escape, initial close-button focus, body scroll lock, and focus restoration. It does not trap focus and has no previous/next/index sequence.
- **Production:** Verified that open/close, Escape, scroll lock, and focus restoration work.
- **Recommended Authority:** Figma for target behavior, with browser accessibility behavior documented in code tests.
- **Reason:** Current code is a valid subset, not the complete contract.
- **Required Action:** Either implement the complete sequence/focus contract or narrow the Figma contract and component name to the intentionally simpler viewer.
- **Affected Source:** `app/components/interactions/MediaInspect.tsx`, Figma pages 12–13.

### ALS-AUTH-009 — The 44px interaction-target rule is not system-wide

- **Status:** IMPLEMENTED
- **Contract:** Pages 05 and 12 require accessible targets, including visually compact rows with at least 44px interactive hit areas.
- **Figma:** System Browser and disclosure sources call out 44px behavior.
- **Code:** About slider controls meet 44px. Info Disclosure is explicitly 26px high; other media controls use 34–36px or lack a shared minimum.
- **Production:** The mismatch is present on current case-study interactions.
- **Recommended Authority:** Accessibility contract in Figma, implemented as a shared code primitive/value.
- **Reason:** Target size is functional, measurable, and should not vary accidentally by component.
- **Required Action:** Introduce a reusable minimum interactive target treatment that can preserve smaller visual glyphs while maintaining a 44px hit area.
- **Affected Source:** `app/globals.css`, interaction component styles, `app/components/interactions/*`.
- **Implementation Evidence:** Commit `714f66c`; `app/globals.css`; identifier `--als-interaction-target` applied to the shared navigation, disclosure, carousel, inline-loop, media-detail, and media-inspect controls; rendered button bounds verified by `scripts/check-global-authority.mjs` at 390/768/1024/1440/1760.

### ALS-AUTH-010 — Directional arrows do not follow the global convention

- **Status:** IMPLEMENTED
- **Contract:** Page 03 specifies `→` for outbound/new-page actions, `↓` for in-page progression, and `←` for backward navigation.
- **Figma:** Explicitly identifies diagonal production arrows as cleanup work.
- **Code:** Global footer and homepage use `↗` in several links.
- **Production:** Diagonal arrows remain visible.
- **Recommended Authority:** Page 03.
- **Reason:** The rule is unambiguous and intended to unify global semantics.
- **Required Action:** Replace the inconsistent glyphs and add a small contract test or shared arrow mapping.
- **Affected Source:** `app/layout.tsx`, `app/page.tsx`, any shared link helpers.
- **Implementation Evidence:** Commit `714f66c`; `app/layout.tsx` (`RootLayout` footer forward action) and `app/page.tsx` (`Home` intent navigation); verified by the semantic-arrow assertions in `scripts/check-global-authority.mjs`.

### ALS-AUTH-011 — The implementation matrix is stale

- **Status:** FIGMA OUTDATED
- **Contract:** Page 08 is meant to map design tokens/components to code.
- **Figma:** Refers to token names such as `--color-bone` and leaves parts of the component inventory unresolved.
- **Code:** Current variables are `--paper`, `--ink`, `--clay`, `--line`, `--muted`, and `--panel`; several interaction/layout components are established but not mapped.
- **Production:** Reflects the repository names, not the matrix names.
- **Recommended Authority:** Repository identifiers for code names; Figma variables for design values.
- **Reason:** Renaming stable code solely to match a stale table adds risk without visual value.
- **Required Action:** Update page 08 with actual file paths, exported names, status, and last-verified commit. Mark aspirational entries separately.
- **Affected Source:** Figma page 08.

### ALS-AUTH-012 — Runtime copy can drift from Git without a binding reconciliation rule

- **Status:** AMBIGUOUS / AUTHORITY NOT YET DEFINED
- **Contract:** Project configuration and checked-in copy appear to be the reviewable source, while the application intentionally allows D1 overrides.
- **Figma:** Page 07 treats production configuration as content authority but does not define Git-versus-D1 precedence and promotion.
- **Code:** `lib/content.ts` resolves D1 `content_state.values_json` before checked-in defaults.
- **Production:** The live Kryptek outcome heading differed from `content/projects.json` during this audit, proving runtime drift is possible.
- **Recommended Authority:** D1 is authority for current editable production copy; Git is authority for schema, fallback defaults, and reviewed baseline content.
- **Reason:** This describes the behavior already in use without pretending the two stores are identical.
- **Required Action:** Document a required export/diff/review step before releases and before Figma copy is called verified. Record the production content revision used for each audit.
- **Affected Source:** `lib/content.ts`, `lib/content-registry.ts`, content export/backup scripts, architecture documentation.

### ALS-AUTH-013 — Editorial Grid 01 is approved but has no code counterpart

- **Status:** NOT IMPLEMENTED
- **Contract:** Page 04 approves `EDITORIAL GRID 01`: 2/4/6 compatible assets, two columns only at ≥1280, single-column below, with no interaction or motion.
- **Figma:** The layout contract is sufficiently specific for implementation.
- **Code:** No matching layout ID/component was found in the case-study layout system or renderer.
- **Production:** No current project section exercises this approved layout.
- **Recommended Authority:** Figma page 04 for the design contract; repository when a typed layout ID is added.
- **Reason:** It is an approved capability, but not currently a production regression.
- **Required Action:** Implement only when a project configuration needs it; do not add an unused generic system solely to make inventories match.
- **Affected Source:** Future `lib/projects.ts`, case renderer/layout component, and tests.

### ALS-AUTH-014 — Media fit, focal position, and responsive delivery are under-specified

- **Status:** AMBIGUOUS / AUTHORITY NOT YET DEFINED
- **Contract:** Figma defines geometry and sometimes aspect intent, but does not provide a consistent per-slot crop/focal-position/delivery contract.
- **Figma:** Some sources imply preserved aspect; others are fixed editorial crops. Mobile caption behavior is not consistently declared.
- **Code:** `Media` renders plain `<img>` elements without intrinsic width/height, `srcset`, or `sizes`. Layout images generally use centered `object-fit: cover`; project data cannot select `contain` or a focal point per slot.
- **Production:** Existing images are served at original dimensions. The 390 Kryptek hero and portrait image receive substantial fixed-frame crops; KIS09 captions are hidden on mobile.
- **Recommended Authority:** Typed per-media configuration in Git for semantic fit/focal/caption behavior, with Figma providing the approved composition.
- **Reason:** Asset-specific cropping cannot be inferred safely from a global CSS default.
- **Required Action:** Add optional `fit`, `objectPosition`/focal point, intrinsic dimensions/aspect, mobile caption policy, and responsive source metadata. Keep defaults conservative.
- **Affected Source:** `app/components/Media.tsx`, `lib/projects.ts`, `content/projects.json`, case-study layout styles.

### ALS-AUTH-015 — The production Kryptek study is not media-complete

- **Status:** NOT IMPLEMENTED
- **Contract:** The configured Kryptek narrative includes 18 media positions across KIS02, KIS03, KIS05, KIS08, KIS09, and KIS10.
- **Figma:** Defines composed media-led sections whose final quality depends on real asset proportions and focal content.
- **Code:** Associations exist for the section slots and support safe placeholders.
- **Production:** Only 4 positions resolved to actual images; 14 rendered as placeholders at audit time.
- **Recommended Authority:** Approved production asset associations recorded in Git, with the actual files in R2 and verified in production.
- **Reason:** Placeholder-safe layout is useful, but it cannot validate cropping, visual rhythm, or final narrative hierarchy.
- **Required Action:** Complete and approve the asset set, record source/permission/status, map every final asset, then rerun five-width visual validation before declaring the project page aligned.
- **Affected Source:** Kryptek asset manifest/source library, `content/projects.json`, R2 media, production verification artifacts.

## 5. Missing Contracts

The following decisions should exist before broad implementation correction begins:

1. **One canonical container contract.** State whether the five Figma rails apply to every standard route and case-study section, and list the few permitted full-bleed exceptions.
2. **A complete responsive type table.** Define each semantic role at all five canonical widths. The current principle rejects viewport interpolation but does not fully replace it.
3. **A code-status vocabulary for Figma.** Use `DESIGN AUTHORITY`, `STRUCTURAL SOURCE`, `IMPLEMENTED`, `PARTIAL`, and `NOT IMPLEMENTED`; reserve `CODE AUTHORITY` for a verified repository path.
4. **A component behavior record.** For each interaction, document keyboard operation, focus behavior, target size, reduced motion, responsive form, and no-JavaScript reading order.
5. **A content authority/reconciliation contract.** Define D1 current values, Git defaults, export/diff cadence, approval owner, and how Figma is marked copy-current.
6. **A per-media presentation contract.** Record fit, focal point, aspect/intrinsic dimensions, caption policy, alt text, source permission, and final R2 association.
7. **A breakpoint ownership rule.** Components may change internal layout at defined modes, but should not invent outer gutters independently.
8. **An implementation-evidence rule.** A Figma component can be marked implemented only when it names the source path, test/route, and last verified commit.
9. **A canonical-token namespace rule.** Only the ALS collections should feed implementation mapping; generated replica variables/styles are reference-only.

## 6. Figma Corrections

Apply these corrections in Figma before using it as a stricter implementation handoff:

1. Update page 06 so About includes Testimonials and Selected Clients by reference to page 99.
2. Change pages 11–12 labels from `CODE AUTHORITY`/unqualified `READY` to structural/design authority unless a verified repository path exists.
3. Add implementation status, source path, test/route, and last-verified commit to every component entry on page 08 or its successor.
4. Update page 08 token mappings to the code identifiers actually in use. Treat any future semantic rename as a separate migration decision.
5. Qualify page 09 verification claims: page 99 is verified; page 06 needs refresh; KIS05 remains an approved production update.
6. Complete the five-mode responsive type table before requesting removal of fluid code behavior.
7. Add fit/focal/caption annotations to final project-specific media frames, especially mobile fixed crops.
8. Mark the generated `austinlesterstudio.com` collection and generated styles as non-authoritative/reference-only.
9. Add Web code syntax only after the canonical naming strategy is settled; do not map the generated replica collection.
10. Keep page 10 excluded from authority audits and label that exclusion visibly in the file.

## 7. Implementation Corrections

Corrections should be narrowly sequenced to avoid mixing governance changes with visual regressions:

1. Centralize the five outer-gutter/content-rail values and migrate standard wrappers to them.
2. Add the 64px 768 navigation mode.
3. Align sidecar activation to the approved 1024 mode and verify text measure.
4. Correct the global directional glyph mapping.
5. Introduce a shared 44px minimum interaction target treatment; retain smaller visible controls where appropriate.
6. Decide and implement the full KIS05 System Browser contract with keyboard, focus, reduced-motion, and linear fallback tests.
7. Resolve Media Inspect scope: complete the sequence/focus behavior or formally narrow the Figma component.
8. Add typed, optional per-media fit/focal/dimension/caption fields and responsive image delivery.
9. Complete Kryptek media associations and run visual validation only after real images are available.
10. Replace fluid typography only after the five-mode values are approved.
11. Implement Editorial Grid 01 only when a real project section selects it.

No D1 migration, R2 architecture change, dependency, or framework change is required for these corrections.

## 8. Recommended Long-Term Authority Architecture

Use a small, explicit authority stack that reflects the current application rather than introducing a parallel system:

### Design authority

- Figma owns visual intent, hierarchy, canonical five-mode geometry, component states, and project-specific compositions.
- `ALS/Color`, `ALS/Spacing`, `ALS/Radius`, and the canonical ALS text styles are the only implementation-facing Figma foundations.
- Figma records implementation evidence but does not declare code existence independently.

### Repository authority

- CSS/custom properties own executable token names and values.
- TypeScript types/configuration own component IDs, allowed layout variants, section ordering, media associations, and behavioral options.
- React components own DOM semantics, keyboard/focus mechanics, and runtime state.
- Tests own measurable contracts at 390, 768, 1024, 1440, and 1760.

The smallest useful future structure is:

```text
docs/architecture/
  ALS_SYSTEM_AUTHORITY_AUDIT.md
  ALS_SYSTEM_AUTHORITY.md           # short binding authority/precedence rules
  CONTENT_AUTHORITY.md              # D1 ↔ Git reconciliation workflow

app/
  design-system/
    tokens.css                       # canonical executable values/modes
  globals.css                        # global composition using those values

lib/
  projects.ts                        # retain and extend current typed layout/media schema

tests/
  contracts/
    responsive-authority.spec.ts     # five widths, rails, nav, sidecars, targets
  browser/
    interaction-authority.spec.ts    # keyboard/focus/reduced-motion behavior
```

This does not require Storybook now. The current components depend heavily on route/content context, and production routes plus focused Playwright contracts provide better immediate value. It also does not require an automated Figma token pipeline yet: the Figma file contains generated non-authority collections and lacks settled Web code syntax. Manual, versioned reconciliation is safer until the canonical namespace is clean.

Code Connect should be considered only after component names, source paths, and implemented variants are stable. Connecting aspirational Figma structures to nonexistent code would reinforce the current ambiguity.

### Runtime content authority

- D1 owns the current editable production values.
- Git owns schemas, safe defaults, reviewed baseline content, asset associations, and change history.
- A release/audit must export and diff the relevant D1 values. “Production verified” should name that captured revision.
- R2 remains the media binary store; Git should retain the manifest, permissions/status, normalized production names, and associations.

### Verification authority

- Keep existing lint, type checking, production build, and guarded manual Cloudflare release checks.
- Extend the existing About and Kryptek capture scripts rather than adding a new visual-test platform immediately.
- Make the five canonical widths the shared assertion set for outer rails, navigation, key case layouts, and approved interactions.
- Store focused reference captures only for high-value pages/components, not every route.

## 9. Recommended Implementation Order

1. **Approve the authority rules.** Resolve typography modes, Figma status vocabulary, D1/Git precedence, and media fit/caption policy.
2. **Correct Figma documentation only.** Refresh pages 06, 08, 09, 11, and 12 without redesigning approved components.
3. **Unify low-risk global contracts.** Centralize rails, add the 768 nav height, correct arrows, and enforce interaction target sizing.
4. **Align responsive case geometry.** Move sidecars to the approved 1024 mode and add five-width layout assertions.
5. **Complete Kryptek content/assets.** Resolve the 14 placeholder positions and record final media metadata before judging visual rhythm.
6. **Build the KIS05 System Browser.** Implement the approved bounded six-state behavior against real media/content.
7. **Resolve Media Inspect.** Complete or narrow the component contract after the System Browser establishes shared keyboard/state patterns.
8. **Add typed media presentation fields and responsive delivery.** Validate crop/focal behavior with the final Kryptek set.
9. **Resolve typography.** Replace conflicting fluid rules after every five-mode value is approved.
10. **Add dormant layout families only on demand.** Implement Editorial Grid 01 when a real case-study configuration requires it.
11. **Run release validation.** Five canonical widths, keyboard/focus, reduced motion, content override behavior, lint, type checking, production build, and guarded Cloudflare runtime verification.

## 10. Kryptek Identity System — Image/Layout Audit

### Production inventory

| Section | Configured composition | Production media state | Layout finding |
| --- | --- | --- | --- |
| KIS02 | `FULL BLEED 01`, primary hero | 1 real image (`3000×1316`) | Coherent at 1440/1760. At 390 it is forced into a `342×240` cover frame, producing substantial horizontal crop. No focal-position contract exists. |
| KIS03 | `TEXT SIDECAR 01` + `ASYMMETRIC GRID 02`, four positions | 3 real images; 1 placeholder | Desktop hierarchy is coherent. The portrait dominant image is heavily vertically cropped at 390 because all mobile items use fixed cover frames. The section is stacked at 1024, contrary to the sidecar contract. |
| KIS05 | `SYSTEM STAGE 01` + `SPECIMEN FIELD 02`, six system items and three media positions | 3 placeholders | Layout is placeholder-safe, but the approved six-state System Browser is absent and final media rhythm cannot be evaluated. |
| KIS08 | `MEDIA SIDECAR 01` + `ASYMMETRIC GRID 01` | Placeholders | Structure renders without overflow; final crop, balance, and sidecar relationship are unverified. |
| KIS09 | `FULL BLEED 02` + `EDITORIAL SEQUENCE 01`, four positions | 4 placeholders | The grid geometry itself is coherent: linear at 768, 12-column editorial at 1024, and lead-plus-three-support composition at 1440/1760. Mobile captions are hidden and that policy is not explicitly authorized. |
| KIS10 | `TEXT SIDECAR 01` + `ASYMMETRIC GRID 01` | Placeholders | Structure is stable but final visual behavior is unverified; 1024 remains stacked under the current breakpoint. |

### Canonical-width findings

- **390:** No horizontal overflow. Kryptek correctly uses a 24px outer gutter. Existing real images show aggressive fixed-frame cover crops; captions/metadata are not consistently retained.
- **768:** No horizontal overflow, but Kryptek uses a 20px outer gutter instead of 40px. KIS09 becomes a clear single-column sequence. The navigation is 68px instead of 64px.
- **1024:** No horizontal overflow, but the case wrapper uses 40px instead of 56px. Sidecars remain stacked. KIS09 uses a stable 12-column arrangement.
- **1440:** The main project rail is 80px/1280px and major compositions are coherent. KIS09 uses a 1280px lead followed by three equal support cells; the apparent whitespace seen in an initial full-page capture was caused by placeholder content, not a grid-placement defect.
- **1760:** The 80px/1600px rail and large-screen project compositions align with Figma intent. Existing images preserve a convincing editorial hierarchy.

### Interaction and accessibility observations

- Extended Context expands in production.
- Media Inspect opens, moves initial focus to Close, locks body scroll, closes with Escape, and restores focus.
- Media Inspect does not trap focus or provide the previous/next/index sequence represented in Figma.
- About social proof passes the repository's five-width production check: all 20 logos load, slider controls are bounded, targets are 44px high, and no horizontal overflow occurs.

### Kryptek conclusion

Kryptek has **material image/content completeness and responsive-contract issues**, not a proven catastrophic layout failure. The large-screen grids are structurally sound. The page should not be declared fully aligned until the 14 placeholder media positions are replaced, focal/crop behavior is approved with real images, 768/1024 rails and sidecars are corrected, mobile caption policy is decided, and KIS05 receives its approved System Browser.
