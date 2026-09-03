# Portfolio Interaction System

## 1. Core Principle

STATIC FOR IMPACT.
INTERACTIVE FOR UNDERSTANDING.

Interaction is only valid when it improves comprehension of the work. If static presentation communicates clearly, static stays.

## 2. Interaction Rules

- Function over fashion.
- Interaction must solve a communication problem.
- Never hide essential information required for baseline understanding.
- Never require hover for core behavior.
- Keyboard, touch, visible focus, and reduced-motion support are required.
- Preserve performance and layout stability.
- Avoid scroll hijacking, novelty-only effects, and decorative interaction noise.
- Static presentation remains preferable when interaction does not improve comprehension.

## 3. Reusable Interaction Patterns

### Expandable Narrative

- Problem solved: secondary explanatory text can clutter core scan path.
- Best use cases: strategy and system sections where one paragraph is primary and deeper rationale is optional.
- Intended behavior: summary text remains visible; READ MORE + expands inline; SHOW LESS - collapses inline.
- Mobile behavior: same inline expansion; no overlay or modal.
- Accessibility notes: semantic button, aria-expanded and aria-controls, keyboard operable.
- Performance considerations: native height and opacity transition, no heavy animation dependency.
- When NOT to use: if all text is essential to first-pass understanding.
- Implementation status: BUILT.

### Media Detail / Annotation

- Problem solved: single decision-level explanation needs contextual placement without permanent visual clutter.
- Best use cases: explaining one frame-specific decision, callout, or technical note.
- Intended behavior: plus trigger opens anchored panel; close button and Escape close panel.
- Mobile behavior: panel drops below media frame to avoid covering key visual content.
- Accessibility notes: semantic trigger, keyboard support, Escape support, return focus to trigger.
- Performance considerations: lightweight local state only.
- When NOT to use: if note is obvious from caption or creates visual noise.
- Implementation status: BUILT.

### Media Carousel

- Problem solved: related sequences can overload vertical rhythm when stacked.
- Best use cases: ordered frames, storyboard progressions, campaign families.
- Intended behavior: manual previous/next, keyboard arrows, index 01 / 06, optional caption and credit.
- Mobile behavior: same controls plus swipe gesture support.
- Accessibility notes: focusable viewport, keyboard navigation, labeled controls.
- Performance considerations: non-active distant slides replaced with lightweight placeholders.
- When NOT to use: when seeing multiple assets simultaneously better explains a system.
- Implementation status: BUILT.

### Inline Loop

- Problem solved: stills cannot prove temporal or behavioral behavior.
- Best use cases: interaction demonstrations, motion identity, real-time behavior proof.
- Intended behavior: muted playsInline video; viewport-aware play/pause; manual PAUSE - / PLAY + control.
- Mobile behavior: same behavior; no autoplay audio; touch-friendly toggle.
- Accessibility notes: explicit control, reduced-motion aware behavior.
- Performance considerations: IntersectionObserver, metadata preload, no external media runtime.
- When NOT to use: if a static frame communicates equally well.
- Implementation status: BUILT.

### Media Inspect

- Problem solved: detailed work needs closer inspection without overcrowding page layout.
- Best use cases: guideline pages, detailed layouts, technical diagrams, dense UI.
- Intended behavior: INSPECT + opens fullscreen dialog with close control and optional caption/credit.
- Mobile behavior: full-height panel with scrolling body.
- Accessibility notes: dialog semantics, Escape close, focus to close on open, focus return on close.
- Performance considerations: modal only mounts on open.
- When NOT to use: when there is no meaningful detail beyond default display.
- Implementation status: BUILT.

### Info Disclosure

- Problem solved: secondary information such as credits and production notes can disrupt narrative pacing.
- Best use cases: credits, partner details, secondary process notes.
- Intended behavior: INFO + or CREDITS + reveals local inline panel.
- Mobile behavior: same inline behavior.
- Accessibility notes: semantic relationships with aria-expanded and controls.
- Performance considerations: minimal DOM and state.
- When NOT to use: if the information is core and should remain visible.
- Implementation status: BUILT.

### State Compare

- Problem solved: transformation projects need side-by-side logic, not simple sequential before/after.
- Best use cases: inherited vs governed systems.
- Intended behavior: paired state toggles with persistent explanatory framing.
- Mobile behavior: stacked states with clear labels.
- Accessibility notes: buttons, not hover reveals.
- Performance considerations: defer heavy assets until selected.
- When NOT to use: purely cosmetic differences.
- Implementation status: PROPOSED.

### System Explorer

- Problem solved: layered systems become unreadable in long stacked galleries.
- Best use cases: identity governance, technical architecture.
- Intended behavior: structured section switching with static-first context and optional deeper panels.
- Mobile behavior: accordion or segmented control.
- Accessibility notes: structured landmarking and keyboard navigation.
- Performance considerations: mount only active panel media.
- When NOT to use: simple one-layer stories.
- Implementation status: PROPOSED.

### Expandable Diagram

- Problem solved: process explanation needs compact overview plus optional detailed nodes.
- Best use cases: production pipelines, content systems.
- Intended behavior: baseline static diagram with expandable decision nodes.
- Mobile behavior: linearized nodes.
- Accessibility notes: node controls as buttons.
- Performance considerations: static SVG/CSS preferred.
- When NOT to use: unsupported or speculative process details.
- Implementation status: PROPOSED.

### Archive / Catalog View

- Problem solved: large evidence families become repetitive in linear galleries.
- Best use cases: catalogs, system artifacts, guideline collections.
- Intended behavior: grouped archival index with restrained metadata and optional filtering.
- Mobile behavior: grouped lists with selective disclosure.
- Accessibility notes: list semantics and headings.
- Performance considerations: pagination/windowing when needed.
- When NOT to use: small sets where normal layout is clearer.
- Implementation status: PROPOSED.

### Sticky Narrative / Sequential Evidence

- Problem solved: section context gets lost in long mixed-media stories.
- Best use cases: long technical case studies.
- Intended behavior: sticky context rail with sequential evidence blocks.
- Mobile behavior: non-sticky fallback.
- Accessibility notes: preserve reading order; avoid scroll traps.
- Performance considerations: avoid heavy scroll frameworks.
- When NOT to use: short cases.
- Implementation status: PROPOSED.

## 4. Reference Websites

### Manual - Waabi

Useful:
- Progressive read-more behavior after result summary.
- Scoped detail reveals around technical/brand specimens.
- Numbered visual sequence pattern.
- Motion included where motion itself proves system behavior.

Relevant to:
- TruckVault 3D Configurator.
- Kryptek Identity System.
- Kryptek E-Commerce and Content Engine.

Do not copy:
- Waabi-specific visual branding and styling treatments.
- Exact component aesthetics.

Principle to retain:
- Interaction should reveal another layer of understanding without interrupting the primary visual read.

### Mast - Innovation Endeavors

Useful:
- Strong specimen-first sequencing.
- Explanatory text appears where needed, not everywhere.
- Identity shown as a coordinated system, not isolated mockups.

Relevant to:
- Kryptek Identity System.
- Fieldcraft Survival.

Do not copy:
- Mast typography, voice, or exact compositional styling.

Principle to retain:
- Refinement and restraint make system-level work feel more credible.

### Order - American Landscapes

Useful:
- Editorial static rhythm carries the narrative.
- Project information remains subordinate to work.
- Collaborator and artifact context integrated without card-heavy UI.

Relevant to:
- 2024 Big Game Guide.
- The Public Standard.
- Kryptek Merchandise.

Do not copy:
- Order's typographic identity and archival visual language.

Principle to retain:
- Use minimal interface and deliberate sequencing before adding interaction.

### Young Jerks - Deus Ex Machina

Useful:
- Optional info disclosure keeps sequence visually dominant.
- Supporting context is available without interrupting flow.

Relevant to:
- Flyway Camouflage Launch.
- Fieldcraft Survival.
- Kryptek Paid Media System.

Do not copy:
- Site-specific grunge styling and idiosyncratic iconography.

Principle to retain:
- Optional information should remain discoverable while preserving visual momentum.

### Standards Manual

Useful:
- Archival/catalog framing of related evidence groups.
- Metadata and context integrated into evidence presentation.
- Collections treated as bodies of proof, not repetitive galleries.

Relevant to:
- Kryptek Identity System.
- 2024 Big Game Guide.
- The Public Standard.

Do not copy:
- Commerce/shop mechanics and product-grid design language.

Principle to retain:
- Grouped evidence framing can communicate system breadth with less repetition.

## 5. Project Interaction Map

### TruckVault 3D Configurator

| PROJECT | SECTION | COMMUNICATION PROBLEM | RECOMMENDED INTERACTION | WHY IT IS BETTER THAN STATIC | SOURCE ASSETS IF KNOWN | PRIORITY | STATUS |
|---|---|---|---|---|---|---|---|
| TruckVault 3D Configurator | Strategy | Technical rationale is compressed into prose | Expandable Narrative | Keeps first-pass strategy scannable while preserving deeper explanation | Existing strategy body | High | PROPOSED |
| TruckVault 3D Configurator | System | Pipeline claim needs structured evidence | STATIC IS STRONGER until evidence is complete | Avoids overpromising interaction before proof assets are confirmed | Pipeline evidence currently partial | High | DEFERRED |
| TruckVault 3D Configurator | Work gallery | Related views can be understood as sequence | Media Carousel | Ordered sequence better shows progression than scattered static placement | Render batches and proof clips | Medium | PROPOSED |
| TruckVault 3D Configurator | Execution proof | Motion behavior cannot be proven by stills | Inline Loop | Demonstrates real behavior and temporal response | Three.js proof and animation clips | High | PROPOSED |

### Kryptek Identity System

| PROJECT | SECTION | COMMUNICATION PROBLEM | RECOMMENDED INTERACTION | WHY IT IS BETTER THAN STATIC | SOURCE ASSETS IF KNOWN | PRIORITY | STATUS |
|---|---|---|---|---|---|---|---|
| Kryptek Identity System | Context to System | Difference between inherited equity and governed system can be oversimplified | State Compare | Clarifies what was preserved versus standardized | Legacy and guideline assets | High | PROPOSED |
| Kryptek Identity System | Work evidence | Dense guideline details are hard to parse at default size | Media Inspect | Enables close reading of standards without cluttering page | Guideline pages and manifesto | High | PROPOSED |
| Kryptek Identity System | Credits | Full role detail can disrupt flow | Info Disclosure | Keeps narrative clean while preserving transparent attribution | Existing credits copy | Medium | PROPOSED |
| Kryptek Identity System | Outcome | STATIC IS STRONGER | Current static sequencing already communicates authority clearly | Existing selected assets | Medium | REJECTED for now |

### Kryptek E-Commerce and Content Engine

| PROJECT | SECTION | COMMUNICATION PROBLEM | RECOMMENDED INTERACTION | WHY IT IS BETTER THAN STATIC | SOURCE ASSETS IF KNOWN | PRIORITY | STATUS |
|---|---|---|---|---|---|---|---|
| Kryptek E-Commerce and Content Engine | Strategy and Execution | Dense process context can overwhelm scan path | Expandable Narrative | Keeps narrative concise with optional deep process detail | Existing strategy and execution copy | High | PROPOSED |
| Kryptek E-Commerce and Content Engine | Work | Product-family evidence is repetitive in linear stack | Media Carousel | Sequence and indexing improve comprehension of asset family governance | Product image families | High | PROPOSED |
| Kryptek E-Commerce and Content Engine | Production proof | Workflow behavior and on-set operation are temporal | Inline Loop | Shows process dynamics impossible in stills | BTS clips | High | PROPOSED |
| Kryptek E-Commerce and Content Engine | Outcome metrics | Secondary production notes are useful but not primary | Info Disclosure | Preserves metric readability while allowing context | Outcome and credits notes | Medium | PROPOSED |

### Fieldcraft Survival

| PROJECT | SECTION | COMMUNICATION PROBLEM | RECOMMENDED INTERACTION | WHY IT IS BETTER THAN STATIC | SOURCE ASSETS IF KNOWN | PRIORITY | STATUS |
|---|---|---|---|---|---|---|---|
| Fieldcraft Survival | Multi-channel work | Broad campaign families risk visual repetition | Media Carousel | Groups related campaign artifacts coherently | Campaign and production sets | Medium | PROPOSED |
| Fieldcraft Survival | Narrative depth | Supporting strategy detail competes with hero work | Expandable Narrative | Keeps primary read clean | Existing case copy | Medium | PROPOSED |
| Fieldcraft Survival | Overall case | STATIC IS STRONGER for opener | Strong hero-first framing should remain static | Existing opener assets | Medium | REJECTED for now |

### Flyway Camouflage Launch

| PROJECT | SECTION | COMMUNICATION PROBLEM | RECOMMENDED INTERACTION | WHY IT IS BETTER THAN STATIC | SOURCE ASSETS IF KNOWN | PRIORITY | STATUS |
|---|---|---|---|---|---|---|---|
| Flyway Camouflage Launch | Launch sequence | Need to connect reveal progression | Media Carousel | Clear chronology from teaser to release | Launch imagery and ads | Medium | PROPOSED |
| Flyway Camouflage Launch | Technical pattern explanation | Pattern decisions can be overexplained inline | Media Detail | Contextual callouts reduce extra paragraphs | Pattern detail frames | Low | PROPOSED |
| Flyway Camouflage Launch | Overall case | STATIC IS STRONGER where imagery already carries narrative | Preserves editorial pace | Existing curated imagery | Medium | REJECTED for now |

### 2024 Big Game Guide

| PROJECT | SECTION | COMMUNICATION PROBLEM | RECOMMENDED INTERACTION | WHY IT IS BETTER THAN STATIC | SOURCE ASSETS IF KNOWN | PRIORITY | STATUS |
|---|---|---|---|---|---|---|---|
| 2024 Big Game Guide | Editorial specimen | Dense spread details need close read | Media Inspect | Supports detailed inspection of typography and layout | Guide spreads and exports | High | PROPOSED |
| 2024 Big Game Guide | Archive breadth | Many related pages risk repetitive scrolling | Archive / Catalog View | Better grouping than long linear gallery | Multiple guide artifacts | Medium | PROPOSED |
| 2024 Big Game Guide | Core narrative | STATIC IS STRONGER for opening statement | Strong static editorial opener | Existing content | Medium | REJECTED for now |

### Kryptek Paid Media System

| PROJECT | SECTION | COMMUNICATION PROBLEM | RECOMMENDED INTERACTION | WHY IT IS BETTER THAN STATIC | SOURCE ASSETS IF KNOWN | PRIORITY | STATUS |
|---|---|---|---|---|---|---|---|
| Kryptek Paid Media System | Channel variants | Channel outputs are easier to compare in sequence | Media Carousel | Normalizes frame-by-frame comparison | Paid media mockups | Medium | PROPOSED |
| Kryptek Paid Media System | Performance narrative | Secondary attribution notes can clutter | Info Disclosure | Keeps primary KPI story legible | Existing attribution note | Medium | PROPOSED |
| Kryptek Paid Media System | Technical mechanics | STATIC IS STRONGER unless process evidence is explicit | Avoid pseudo-technical interactivity | Current assets | Medium | DEFERRED |

### The Public Standard

| PROJECT | SECTION | COMMUNICATION PROBLEM | RECOMMENDED INTERACTION | WHY IT IS BETTER THAN STATIC | SOURCE ASSETS IF KNOWN | PRIORITY | STATUS |
|---|---|---|---|---|---|---|---|
| The Public Standard | Film/motion evidence | Movement is core evidence | Inline Loop | Preserves in-context motion without heavy player UI | Existing video assets | Medium | PROPOSED |
| The Public Standard | Supporting context | Credits and production notes can distract | Info Disclosure | Keeps work-forward hierarchy | Existing copy | Low | PROPOSED |
| The Public Standard | Overall rhythm | STATIC IS STRONGER for major still sequences | Better editorial control than over-interaction | Existing case | Medium | REJECTED for now |

### Kryptek Merchandise

| PROJECT | SECTION | COMMUNICATION PROBLEM | RECOMMENDED INTERACTION | WHY IT IS BETTER THAN STATIC | SOURCE ASSETS IF KNOWN | PRIORITY | STATUS |
|---|---|---|---|---|---|---|---|
| Kryptek Merchandise | SKU family breadth | Related merchandise variants can feel repetitive | Media Carousel | Ordered family grouping improves scan efficiency | Merchandise images | Medium | PROPOSED |
| Kryptek Merchandise | Detail craftsmanship | Fine print and stitch details need closer view | Media Inspect | Allows targeted detail inspection | Product detail shots | Medium | PROPOSED |
| Kryptek Merchandise | Core brand impression | STATIC IS STRONGER for hero-led opener | Preserves impact-first storytelling | Existing hero assets | Medium | REJECTED for now |

## 6. Flagship Ideas

### Kryptek Identity System

Governing System / System Explorer:
- Potential structure: FOUNDATION -> IDENTITY -> LANGUAGE -> ICONOGRAPHY -> APPLICATION.
- Purpose: reveal layered governance without stacking many screenshots.
- Status: PROPOSED, not implemented in this pass.

Inherited vs Governed State Comparison:
- Purpose: show valuable existing equity becoming coherent governance.
- Status: PROPOSED, not implemented in this pass.

### TruckVault 3D Configurator

Interactive Technical/System Explanation:
- Potential areas: PRODUCT LOGIC, REALTIME 3D, FIT / CONFIGURATION, MATERIAL SYSTEM, WEB OPTIMIZATION.
- Purpose: connect visual outcomes to technical and system reasoning.
- Status: PROPOSED, not implemented in this pass.

Realtime 3D Proof Loop:
- Purpose: show behavior static renders cannot prove.
- Status: PROPOSED, foundation supported through Inline Loop.

Production Pipeline Diagram:
- Conceptual sequence (evidence-dependent): MODEL -> MATERIAL -> OPTIMIZE -> EXPORT -> BROWSER.
- Constraint: do not fabricate unsupported pipeline details.
- Status: PROPOSED, deferred pending stronger source evidence.

### Kryptek E-Commerce and Content Engine

Content Engine Process Explorer:
- Potential structure: PRODUCT PLAN -> CAPTURE -> PROCESS -> ASSET LIBRARY -> ECOMMERCE -> CAMPAIGN / CHANNEL.
- Purpose: connect production architecture with customer-facing outcomes.
- Status: PROPOSED, not implemented in this pass.

Product Library Specimen / Contact Sheet:
- Potential selectable dimensions: PRODUCT, ANGLES, COLORWAYS.
- Purpose: prove repeatable governance without dumping redundant imagery.
- Status: PROPOSED, not implemented in this pass.

## 7. Future / Parking Lot

- Long-case sticky section index for specific very long projects.
- Advanced sequential evidence choreography where section context persistence is needed.
- Archive filtering modes when artifact count justifies it.
- Selective metadata overlays on focus/tap for specimen-heavy cases.
- Additional state-comparison templates only after a concrete communication need appears.

Items leave Parking Lot only when they solve a confirmed communication problem.

## 8. Implementation Status

| Pattern | Proposed | Built | Tested | Used | Deferred | Rejected |
|---|---|---|---|---|---|---|
| Expandable Narrative | Yes | Yes | Final local QA pass complete | No | No | No |
| Media Detail / Annotation | Yes | Yes | Final local QA pass complete | No | No | No |
| Media Carousel | Yes | Yes | Final local QA pass complete | No | No | No |
| Inline Loop | Yes | Yes | Final local QA pass complete | No | No | No |
| Media Inspect | Yes | Yes | Final local QA pass complete | No | No | No |
| Info Disclosure | Yes | Yes | Final local QA pass complete | No | No | No |
| State Compare | Yes | No | No | No | Yes | No |
| System Explorer | Yes | No | No | No | Yes | No |
| Expandable Diagram | Yes | No | No | No | Yes | No |
| Archive / Catalog View | Yes | No | No | No | Yes | No |
| Sticky Narrative / Sequential Evidence | Yes | No | No | No | Yes | No |

Notes:
- Foundation components are implemented and optional.
- No existing case-study content or media assignments were changed in this pass.
- Activation decisions remain pending project-specific curation.

## 9. Final Local QA Checkpoint

Environment:
- Local route tested: /work/interaction-lab (internal only, noindex).
- Viewports tested: 375x812, 768x1024, 1440x900.
- Input modes tested: mouse, keyboard, touch-style swipe gesture.
- Motion preference tested: prefers-reduced-motion reduce.

Verified outcomes:
- Expandable Narrative: READ MORE + and SHOW LESS - toggle correctly with aria-expanded updates and keyboard support.
- Media Detail: opens/closes via click, keyboard, close button, and Escape with focus return.
- Media Carousel: previous/next controls, arrow key navigation, visible index updates, caption updates, and swipe gesture navigation all verified.
- Inline Loop: local fixture source resolves, auto-play runs when visible, pauses out of viewport, manual pause/play works, and reduced-motion suppresses autoplay.
- Media Inspect: opens, closes with Escape, closes with close button and overlay, and returns focus.
- Info Disclosure: toggle and accessibility state verified by click and keyboard.
- Responsive checks: no horizontal overflow, no major control collisions, and usable panel/dialog layouts across tested widths.

QA notes and limitations:
- Intermittent net::ERR_ABORTED logs were observed for the loop fixture during rapid scripted navigations. Direct fixture requests and in-page playback remained successful.
- Scroll-jump signals in earlier scripts were caused by automation click behavior, not by component layout instability; deterministic checks with direct DOM click flow showed stable scroll positions.
