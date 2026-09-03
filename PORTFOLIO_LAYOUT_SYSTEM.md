# Portfolio Layout System

## 1. Purpose

This document defines a finite, reusable spatial vocabulary for case-study composition.

It is intentionally independent from project-specific components and independent from interaction behavior.

## 2. Core Separation

Layout:
- Determines where narrative, media, metadata, and support content live.

Media Presentation:
- Determines how one or more assets occupy the media region.

Interaction:
- Determines what the viewer can do with content already placed in layout and media regions.

Reference interaction system:
- See PORTFOLIO_INTERACTION_SYSTEM.md for behavior patterns and usage criteria.

## 3. Stable Layout IDs

Spatial Layout IDs:
- FULL BLEED 01
- FULL BLEED 02
- TEXT SIDECAR 01
- MEDIA SIDECAR 01
- MEDIA SIDECAR 02
- STICKY NARRATIVE 01
- STICKY NARRATIVE 02
- STATE COMPARE 01
- SYSTEM STAGE 01
- ANNOTATED STAGE 01

Media Layout IDs:
- ASYMMETRIC GRID 01
- ASYMMETRIC GRID 02
- SPECIMEN FIELD 01
- SPECIMEN FIELD 02
- EDITORIAL SEQUENCE 01
- ARCHIVE GRID 01
- ARCHIVE GRID 02

## 4. Layout Catalog

### FULL BLEED 01

ID:
- FULL BLEED 01

COMMUNICATION PROBLEM:
- A single dominant visual should carry the section with minimal interface chrome.

VISUAL STRUCTURE:
- One dominant media region.
- No required caption rail.

BEST USES:
- Case-study hero moments.
- Signature application proof where one frame is enough.

MOBILE TRANSFORMATION:
- Preserve dominance with a stable aspect ratio and safe center crop.

ACCESSIBILITY NOTES:
- Narrative context remains in semantic order before media where applicable.

WHEN NOT TO USE:
- When supporting context is required for interpretation.

IMPLEMENTATION STATUS:
- BUILT in layout system and demonstrated in /work/layout-lab.

### FULL BLEED 02

ID:
- FULL BLEED 02

COMMUNICATION PROBLEM:
- Dominant visual needs attached context without diluting visual impact.

VISUAL STRUCTURE:
- One dominant media region.
- Restrained caption and metadata rail.

BEST USES:
- Guideline pages, editorial proof, featured application with source notes.

MOBILE TRANSFORMATION:
- Caption rail stacks under media in reading order.

ACCESSIBILITY NOTES:
- Caption remains physically and semantically adjacent to media.

WHEN NOT TO USE:
- When caption content is long-form narrative better placed in sidecar layouts.

IMPLEMENTATION STATUS:
- BUILT in layout system and demonstrated in /work/layout-lab.

### TEXT SIDECAR 01

ID:
- TEXT SIDECAR 01

COMMUNICATION PROBLEM:
- Narrative must lead while visual evidence remains substantial.

VISUAL STRUCTURE:
- Approximately 30-35 percent narrative and 65-70 percent media on desktop.

BEST USES:
- Context, insight, strategy framing with one major evidence region.

MOBILE TRANSFORMATION:
- Text first, media second.

ACCESSIBILITY NOTES:
- Semantic reading order matches mobile order.

WHEN NOT TO USE:
- When narrative is minimal and visual proof should dominate first.

IMPLEMENTATION STATUS:
- BUILT in layout system and demonstrated in /work/layout-lab.

### MEDIA SIDECAR 01

ID:
- MEDIA SIDECAR 01

COMMUNICATION PROBLEM:
- Visual evidence should dominate while explanation remains available and compact.

VISUAL STRUCTURE:
- Dominant media region plus small explanatory sidecar.

BEST USES:
- Application evidence with short rationale.

MOBILE TRANSFORMATION:
- Narrative sidecar moves below media.

ACCESSIBILITY NOTES:
- Sidecar remains semantically adjacent and not visually detached.

WHEN NOT TO USE:
- Dense strategy content requiring narrative-first reading.

IMPLEMENTATION STATUS:
- BUILT in layout system and demonstrated in /work/layout-lab.

### MEDIA SIDECAR 02

ID:
- MEDIA SIDECAR 02

COMMUNICATION PROBLEM:
- Same as MEDIA SIDECAR 01 with opposite directional rhythm.

VISUAL STRUCTURE:
- Dominant media plus sidecar with inverted desktop orientation.

BEST USES:
- Alternating rhythm in long case studies.

MOBILE TRANSFORMATION:
- Same as MEDIA SIDECAR 01.

ACCESSIBILITY NOTES:
- Visual inversion does not alter semantic narrative-first order.

WHEN NOT TO USE:
- If directional alternation adds noise instead of clarity.

IMPLEMENTATION STATUS:
- BUILT in layout system and demonstrated in /work/layout-lab.

### ASYMMETRIC GRID 01

ID:
- ASYMMETRIC GRID 01

COMMUNICATION PROBLEM:
- Equal card grids flatten hierarchy.

VISUAL STRUCTURE:
- One dominant media region plus two supporting regions.

BEST USES:
- Work sections with one clear hero and two contextual supports.

MOBILE TRANSFORMATION:
- Priority stack: dominant first, supports after.

ACCESSIBILITY NOTES:
- Dominance is visual only; reading order remains logical.

WHEN NOT TO USE:
- When all assets require equal emphasis.

IMPLEMENTATION STATUS:
- BUILT as media layout and demonstrated in /work/layout-lab.

### ASYMMETRIC GRID 02

ID:
- ASYMMETRIC GRID 02

COMMUNICATION PROBLEM:
- Evidence sets need unequal visual hierarchy and optional text support.

VISUAL STRUCTURE:
- Dominant large region plus multiple secondary image regions.
- Optional supporting text region can be provided by shell layout.

BEST USES:
- Inherited/context audits and mixed governance evidence.

MOBILE TRANSFORMATION:
- Dominant first, then secondary regions as ordered stack.

ACCESSIBILITY NOTES:
- Preserve narrative context independently of visual packing.

WHEN NOT TO USE:
- Minimal two-image stories where simpler layouts are clearer.

IMPLEMENTATION STATUS:
- BUILT as media layout and demonstrated in /work/layout-lab.

### SPECIMEN FIELD 01

ID:
- SPECIMEN FIELD 01

COMMUNICATION PROBLEM:
- A single artifact needs specimen-scale prominence.

VISUAL STRUCTURE:
- Exceptionally large specimen plus one small support.

BEST USES:
- Logo, pattern, icon, or type artifacts.

MOBILE TRANSFORMATION:
- Specimen remains first and dominant; support follows.

ACCESSIBILITY NOTES:
- Avoid embedding critical tiny text inside specimen crops.

WHEN NOT TO USE:
- Multi-evidence arguments requiring broader comparison.

IMPLEMENTATION STATUS:
- BUILT as media layout and demonstrated in /work/layout-lab.

### SPECIMEN FIELD 02

ID:
- SPECIMEN FIELD 02

COMMUNICATION PROBLEM:
- Need one dominant specimen with two subordinate variants.

VISUAL STRUCTURE:
- Large dominant specimen plus multiple small supports.

BEST USES:
- System details where one master object anchors variants.

MOBILE TRANSFORMATION:
- Dominant followed by support stack.

ACCESSIBILITY NOTES:
- Maintain clear support labels in narrative or metadata.

WHEN NOT TO USE:
- Sequences where temporal progression matters more than specimen comparison.

IMPLEMENTATION STATUS:
- BUILT as media layout and demonstrated in /work/layout-lab.

### EDITORIAL SEQUENCE 01

ID:
- EDITORIAL SEQUENCE 01

COMMUNICATION PROBLEM:
- Editorial pages need cadence, not equal-card flattening.

VISUAL STRUCTURE:
- Lead frame plus supporting sequence frames with controlled rhythm.

BEST USES:
- 2-4 page/spread continuity proof.

MOBILE TRANSFORMATION:
- Sequence becomes linear stack in narrative order.

ACCESSIBILITY NOTES:
- Sequence order should be explicitly labeled in metadata when needed.

WHEN NOT TO USE:
- Single-image moments where sequence overhead is unnecessary.

IMPLEMENTATION STATUS:
- BUILT as media layout and demonstrated in /work/layout-lab.

### ARCHIVE GRID 01

ID:
- ARCHIVE GRID 01

COMMUNICATION PROBLEM:
- Dense archives need controlled scanning without decorative complexity.

VISUAL STRUCTURE:
- Compact multi-cell archive grid.

BEST USES:
- Artifact sets where relative equality is acceptable.

MOBILE TRANSFORMATION:
- Reduced columns with readable card sizes.

ACCESSIBILITY NOTES:
- Maintain clear item labels and avoid hidden essential metadata.

WHEN NOT TO USE:
- Stories with one dominant anchor.

IMPLEMENTATION STATUS:
- BUILT as media layout and demonstrated in /work/layout-lab.

### ARCHIVE GRID 02

ID:
- ARCHIVE GRID 02

COMMUNICATION PROBLEM:
- Archive breadth is needed but one selected piece must lead.

VISUAL STRUCTURE:
- One dominant selected piece plus supporting archive rail.

BEST USES:
- Chosen centerpiece with contextual family references.

MOBILE TRANSFORMATION:
- Dominant piece followed by support stack.

ACCESSIBILITY NOTES:
- Selected state must be explicit in text/caption.

WHEN NOT TO USE:
- When all pieces are truly equivalent.

IMPLEMENTATION STATUS:
- BUILT as media layout and demonstrated in /work/layout-lab.

### STICKY NARRATIVE 01

ID:
- STICKY NARRATIVE 01

COMMUNICATION PROBLEM:
- Narrative context gets lost across long media progressions.

VISUAL STRUCTURE:
- Sticky narrative pane with progressing media region.

BEST USES:
- Multi-step evidence with stable interpretive frame.

MOBILE TRANSFORMATION:
- Sticky behavior disabled; natural document flow.

ACCESSIBILITY NOTES:
- No scroll hijacking; native CSS sticky only.

WHEN NOT TO USE:
- Short sections where sticky behavior creates dead space.

IMPLEMENTATION STATUS:
- BUILT in layout system and demonstrated in /work/layout-lab.

### STICKY NARRATIVE 02

ID:
- STICKY NARRATIVE 02

COMMUNICATION PROBLEM:
- A stable visual anchor is needed while related content progresses.

VISUAL STRUCTURE:
- Sticky visual pane with progressing narrative/support pane.

BEST USES:
- System anchor demonstrations and progressive interpretation.

MOBILE TRANSFORMATION:
- Sticky disabled; content linearized.

ACCESSIBILITY NOTES:
- Semantic order remains coherent when sticky is removed.

WHEN NOT TO USE:
- If sticky anchor does not improve comprehension.

IMPLEMENTATION STATUS:
- BUILT in layout system and demonstrated in /work/layout-lab.

### STATE COMPARE 01

ID:
- STATE COMPARE 01

COMMUNICATION PROBLEM:
- State transitions are oversimplified when shown sequentially.

VISUAL STRUCTURE:
- Simultaneous comparison shell.

BEST USES:
- Inherited versus governed state communication.

MOBILE TRANSFORMATION:
- Comparison columns stack with explicit state labels.

ACCESSIBILITY NOTES:
- Comparison remains understandable without hover or toggle behavior.

WHEN NOT TO USE:
- Differences are too subtle and require dedicated inspect interactions.

IMPLEMENTATION STATUS:
- BUILT in layout system and demonstrated in /work/layout-lab.

### SYSTEM STAGE 01

ID:
- SYSTEM STAGE 01

COMMUNICATION PROBLEM:
- Part-to-whole systems are hard to read in linear galleries.

VISUAL STRUCTURE:
- Small indexed/navigation region plus large system field.

BEST USES:
- Governance and exploded-system presentations.

MOBILE TRANSFORMATION:
- Navigation and field stack; compact index remains readable.

ACCESSIBILITY NOTES:
- Indexed region uses semantic list structure.

WHEN NOT TO USE:
- Single-layer narratives without subsystem relationships.

IMPLEMENTATION STATUS:
- BUILT in layout system and demonstrated in /work/layout-lab.

### ANNOTATED STAGE 01

ID:
- ANNOTATED STAGE 01

COMMUNICATION PROBLEM:
- Explanatory notes can become detached from visual evidence.

VISUAL STRUCTURE:
- Large central object/evidence with annotation-safe outer regions.

BEST USES:
- Annotated object analysis and decision callouts.

MOBILE TRANSFORMATION:
- Media first, annotation list after.

ACCESSIBILITY NOTES:
- Integrates with existing MediaDetail behavior for attached notes.

WHEN NOT TO USE:
- Cases where notes are unnecessary or would clutter the baseline read.

IMPLEMENTATION STATUS:
- BUILT in layout system and demonstrated in /work/layout-lab.

## 5. Compatibility Patterns

Examples of valid combinations:
- FULL BLEED 01 + no media layout + no interaction
- TEXT SIDECAR 01 + ASYMMETRIC GRID 02 + no interaction
- FULL BLEED 02 + EDITORIAL SEQUENCE 01 + MediaInspect
- SYSTEM STAGE 01 + SPECIMEN FIELD 02 + future System Explorer
- ANNOTATED STAGE 01 + SPECIMEN FIELD 01 + MediaDetail

Compatibility rule:
- Layout, media layout, and interaction are configured independently and can be combined without project-specific component forks.

## 6. Reference Principles (Documented, Not Imitated)

Standards Manual:
- Asymmetric hierarchy.
- Dominant object plus subordinate context.

Manual / Waabi:
- Different content deserves different presentation modes.
- Progressive narrative sequencing.

Order / American Landscapes:
- Specimen-scale artifacts.
- Editorial grouping and changing scale.

Studio Mast:
- Restrained structural frameworks for diverse content.

505 State Street:
- Annotated object logic where explanation remains attached to evidence.

Neutra VDL:
- Exploded-system part-to-whole reading.

## 7. Current Scope Guardrails

- No activation on published projects in this pass.
- No content changes.
- No new global design language changes.
- No deployment changes.

## 8. Integration Proof Route

Internal route:
- /work/case-study-lab/kryptek-identity-system

Purpose:
- Validate layout assignment and rendering through the same section configuration path used by production case studies.
- Validate interaction composition without project-specific renderer forks.
- Validate responsive behavior and section-to-section rhythm in a full case-study shell.

Scope notes:
- Uses a derived internal Kryptek project object; published Kryptek content remains unchanged.
- Uses slot-addressed fixture media through the shared Media component fallback path for controlled stress testing.

## 9. Production Path Audit (Verified)

Path under test:
- project data/config
- section records
- media_slots names
- optional layout_system configuration
- CaseLayoutSystem renderer
- optional interaction wrappers
- rendered case-study page

Verified source and flow:
- Content source: getContent() resolves project records and section records.
- Section loop: case-study renderer iterates project.content_sections.
- Slot addressing: slot keys are composed as project.{project_content_id}.{section_content_id}.{slot_name}.
- Media resolution: Media reads slot assignments from mediaMap; when a slot has no mapped asset, placeholder fallback is rendered.
- Internal fixture resolution boundary: fixture assets are available only when an internal route injects explicit fixture entries into a synthetic MediaMap.
- Layout activation: section.layout_system.layout gates entry to CaseLayoutSystem.
- Interaction composition: mediaInspect, mediaDetail, inlineLoop and others wrap slot-rendered media nodes in CaseSection.

What the isolated Layout Lab bypasses:
- It manually constructs media nodes in JSX and passes them directly into CaseLayoutSystem.
- It does not consume project.content_sections from getContent().
- It does not exercise production slot addressing or mediaMap lookups.
- It therefore cannot alone prove end-to-end production integration.

## 10. Media-Slot Contract (Current Renderer)

Contract base:
- Layout system consumes an ordered mediaNodes array generated from section.media_slots.
- Slot names are free-form strings in section.media_slots.
- Interactions reference slot names directly (for example mediaInspect.slots and mediaDetail.items[].slot).

Spatial layouts:

FULL BLEED 01
- required slots: 1 (index 0)
- optional slots: none

FULL BLEED 02
- required slots: 1 (index 0)
- optional slots: none
- optional metadata fields: caption, metadata

TEXT SIDECAR 01
- required slots: 1 (index 0)
- optional slots: none
- may compose with any media layout for multi-slot behavior

MEDIA SIDECAR 01 / MEDIA SIDECAR 02
- required slots: 1 (index 0)
- optional slots: none
- may compose with any media layout for multi-slot behavior

STICKY NARRATIVE 01
- required slots: 1 when no mediaLayout is provided
- with EDITORIAL SEQUENCE 01: required index 0, optional indexes 1-3

STICKY NARRATIVE 02
- required slots: 1 (index 0)

STATE COMPARE 01
- required slots: 1 when no mediaLayout is provided
- typically composed with a multi-slot media layout for comparisons

SYSTEM STAGE 01
- required slots: 1 when no mediaLayout is provided
- typically composed with SPECIMEN FIELD 02 for dominant + supports
- optional metadata fields: systemItems[]

ANNOTATED STAGE 01
- required slots: 1 (index 0)
- optional metadata fields: annotations[]
- optional interaction: mediaDetail for attached annotations

Media layouts:

ASYMMETRIC GRID 01
- required slots: index 0
- optional slots: indexes 1-2

ASYMMETRIC GRID 02
- required slots: index 0
- optional slots: indexes 1-3

SPECIMEN FIELD 01
- required slots: index 0
- optional slots: index 1

SPECIMEN FIELD 02
- required slots: index 0
- optional slots: indexes 1-2

EDITORIAL SEQUENCE 01
- required slots: index 0
- optional slots: indexes 1-3

ARCHIVE GRID 01
- required slots: none hard-required by renderer
- recommended minimum: 1
- renderer capacity: expands to max(6, provided slot count)

ARCHIVE GRID 02
- required slots: index 0
- optional slots: indexes 1+
- renderer capacity: support rail expands to max(4, provided slot count - 1)

Behavior under missing slots:
- Missing required slot positions render a restrained required-missing fallback cell to keep failure detectable and non-crashing.
- Missing optional slots collapse and are omitted from layout output so composition reflows intentionally.
- Missing mapped production media (slot configured, asset unresolved) renders the standard Media placeholder for that configured slot.
- Internal fixture rendering is not inferred from unresolved slots; fixtures render only when an internal route injects explicit fixture media-map entries.
- No silent renderer crashes were observed in integration testing.

## 11. Narrative and Content Contract (Verified)

Where content lives:
- section label: section.narrative_stage
- heading: section.heading
- primary narrative: section.body rendered through Prose and optional ExpandableNarrative
- secondary narrative: infoDisclosure.body and metadata in layout rails
- metadata: layout_system.metadata and layout_system.mediaNote
- captions: layout_system.caption or interaction captions (for inspect/carousel)
- credits: interaction mediaInspect/mediaCarousel credit maps

Rule validation:
- Case-study explanation remains HTML text content.
- Artifact-specific visual information remains in media slots.
- Prototype sections maintain this separation and do not bake explanatory narrative into fixture images.

## 12. Verified Compatibility Status

Status legend:
- BUILT: implemented in code
- INTEGRATION TESTED: exercised through full case-study production renderer path
- RESPONSIVE TESTED: tested at 375, 768, 1100, 1440, 1920, 2200
- PRODUCTION USED: activated on a published project

FULL BLEED 01
- BUILT: yes
- INTEGRATION TESTED: yes
- RESPONSIVE TESTED: yes
- PRODUCTION USED: no

TEXT SIDECAR 01 + ASYMMETRIC GRID 02
- BUILT: yes
- INTEGRATION TESTED: yes
- RESPONSIVE TESTED: yes
- PRODUCTION USED: no

SYSTEM STAGE 01 + SPECIMEN FIELD 02
- BUILT: yes
- INTEGRATION TESTED: yes
- RESPONSIVE TESTED: yes
- PRODUCTION USED: no

MEDIA SIDECAR 01
- BUILT: yes
- INTEGRATION TESTED: yes
- RESPONSIVE TESTED: yes
- PRODUCTION USED: no

FULL BLEED 02 + EDITORIAL SEQUENCE 01 + MediaInspect
- BUILT: yes
- INTEGRATION TESTED: yes
- RESPONSIVE TESTED: yes
- PRODUCTION USED: no

STICKY NARRATIVE 01
- BUILT: yes
- INTEGRATION TESTED: yes
- RESPONSIVE TESTED: yes
- PRODUCTION USED: no

STICKY NARRATIVE 02
- BUILT: yes
- INTEGRATION TESTED: yes
- RESPONSIVE TESTED: yes
- PRODUCTION USED: no

ANNOTATED STAGE 01 + MediaDetail
- BUILT: yes
- INTEGRATION TESTED: yes
- RESPONSIVE TESTED: yes
- PRODUCTION USED: no

FULL BLEED 02 + ARCHIVE GRID 02
- BUILT: yes
- INTEGRATION TESTED: yes
- RESPONSIVE TESTED: yes
- PRODUCTION USED: no

Future pairing path:
- SYSTEM STAGE 01 + System Explorer
- Architectural readiness: layout already accepts indexed systemItems and large system field; interaction can attach at slot layer without renderer fork.
- Status: compatibility path prepared, interaction not yet activated in production content.
