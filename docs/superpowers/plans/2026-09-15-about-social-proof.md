# About Social Proof Implementation Plan

> **Execution note:** Work only in the fresh `feat/about-social-proof` worktree created from `origin/main`. Preserve the existing production architecture and guarded Cloudflare release path.

## Task 1 — Establish the content and behavior contract with tests

1. Add `tests/about-social-proof.test.ts` before production modules.
2. Assert five testimonial IDs/order, Mark Miller attribution, twenty unique client paths/order, and bounded navigation/swipe behavior.
3. Run the test and confirm it fails because the production modules do not exist.
4. Add typed data in `content/about-social-proof.ts`, editable strings in `content/site-copy.ts`, and pure bounded-navigation helpers in `lib/testimonial-slider.ts`.
5. Add a focused package script and confirm the tests pass.

## Task 2 — Normalize and register approved logo assets

1. Extract the approved source archive outside the repository.
2. Copy exactly twenty self-contained SVGs into `public/brand/client-logos/` using the approved production names and mapping corrections.
3. Verify file count, filenames, and absence of scripts/external references.
4. Create the first asset-manifest workbook and store it in the project-first Google Drive structure with the source masters.

## Task 3 — Build the static client wall first

1. Add a server-rendered `ClientLogoWall` component driven by typed configuration.
2. Add semantic list markup, useful logo alt text, data-driven optical sizing, and the decorative 768 empty cell through CSS only.
3. Add responsive columns, cell heights, gutters, and section padding for all canonical widths.
4. Integrate the wall on About after the future testimonial position and verify rendering before slider work.

## Task 4 — Build the bounded testimonial slider

1. Add a focused client component that renders one testimonial at a time.
2. Implement bounded buttons, keyboard arrows, touch-swipe threshold, status announcement, and reduced-motion behavior.
3. Match approved responsive quote measures, hierarchy, gutters, and stable section rhythm without clipping editable text.
4. Place Testimonials after Capabilities and Selected Clients after Testimonials.

## Task 5 — Validate implementation quality

1. Run focused tests and targeted lint on changed code.
2. Run TypeScript checking and the production build.
3. Exercise the local Cloudflare runtime.
4. Inspect 390, 768, 1024, 1440, and 1760 widths for layout, keyboard navigation, touch behavior, focus visibility, disabled state, and content editing tolerance.
5. Confirm the homepage and global footer are unchanged.

## Task 6 — Commit, integrate, and release

1. Commit the implementation in logical feature commits.
2. Run the repository release preflight from a clean tree.
3. Fast-forward the canonical branch through the repository workflow and push.
4. Run the guarded manual production deployment.
5. Smoke-test the live About page and confirm the production Worker serves the release.
