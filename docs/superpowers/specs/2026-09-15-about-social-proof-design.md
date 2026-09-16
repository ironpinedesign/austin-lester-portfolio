# About Social Proof — Approved Design Contract

## Scope

Add two native Austin Lester Studio sections to the About page only:

1. A bounded, five-state testimonial slider immediately after Capabilities.
2. A static Selected Clients logo wall immediately after Testimonials.

The homepage, global navigation, global footer, D1 schema, and R2 storage remain unchanged.

## Content architecture

- Editable testimonial copy, names, roles, and organizations live in `content/site-copy.ts`.
- Ordering, associations, logo paths, and optical sizing live in a typed social-proof configuration module.
- Exactly five testimonials are approved. The fifth attribution is **Mark Miller**.
- Exactly twenty client marks are approved and appear in the Figma order.
- Source masters remain in Google Drive. Normalized web copies live in `public/brand/client-logos/`.

## Testimonial behavior

- The control is a bounded slider: Previous is disabled on state 1 and Next is disabled on state 5. It never wraps.
- Only the active testimonial is exposed as the current reading content.
- Previous/Next buttons, left/right arrow keys, and a deliberate horizontal touch swipe all change state.
- Navigation controls have at least a 44×44px target, visible focus treatment, disabled semantics, and an announced `n / 5` status.
- There is no autoplay, timer, pagination dots, drag physics, hover effect, click scale, or decorative transition.
- Reduced-motion preferences remove the small content transition.
- The approved copy may grow the section rather than being clipped.

## Client-wall behavior

- The wall is a semantic list with no hover behavior or interaction.
- Columns: 2 at 390, 3 at 768, 4 at 1024 and 1440, and 5 at 1760.
- Cell heights: 120, 130, 140, 150, and 150px respectively.
- At the 768 layout, the final unused matrix position remains visibly ruled without becoming a semantic list item.
- Optical size is controlled per logo through typed data rather than individual CSS selectors.

## Responsive contract

The About content rail is authoritative at the five canonical widths:

| Viewport | Horizontal gutter | Social-proof section pad |
| --- | ---: | ---: |
| 390 | 24px | 48px |
| 768 | 40px | 64px |
| 1024 | 56px | 72px |
| 1440 | 80px | 84px |
| 1760 | 80px | 84px |

Testimonial quote measures and type scale follow the approved Figma source: 342/16 at 390, 608/18 at 768, 760/20 at 1024, 920/22 at 1440, and 1000/22 at 1760.

## Visual language

- Reuse ALS Bone, Obsidian, Terracotta, Concrete, Muted, and Panel tokens.
- Reuse Archivo, Fraunces Italic, and JetBrains Mono.
- Preserve zero-radius, ruled-matrix, editorial hierarchy, and restrained motion conventions.
- Do not import Nui code, dependencies, layout systems, or interaction behaviors.

## Asset normalization

The Git destination is `public/brand/client-logos/`. Correct the known source-label issues during normalization:

- `Badlands.svg` artwork → `bergara.svg`
- `Badlands_1.svg` artwork → `badlands.svg`
- `Christianson Arms.svg` → `christensen-arms.svg`
- `Inital Asent.svg` → `initial-ascent.svg`

All production names are lowercase kebab-case. SVGs must remain self-contained and free of scripts or external references.

## Release contract

Validate configuration tests, targeted lint, type checking, production build, the five canonical viewport widths, keyboard/touch interaction, reduced motion, and the local Cloudflare runtime. Release only through the repository's guarded manual Cloudflare workflow after the implementation is committed and the worktree is clean.
