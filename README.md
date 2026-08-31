# Austin Lester portfolio

The nine project records in `content/projects.json` were imported from the supplied `Base44_Project_Import_Revised.csv`. Media URLs are intentionally empty. The homepage count is derived from featured records, and the Art Direction category is normalized.

## Media workflow

Open `/studio` and sign in with ChatGPT. Use the private one-time setup code from the separate owner access file. This permanently binds editing to that account's site-scoped identity. Setup cannot be claimed by another account without the secret. Once claimed, the code no longer grants access. Contact details stay hidden until added in the studio.

Uploads are stored in the Sites R2 binding `FILES`. Metadata, ownership, placements, and contact settings use D1 `DB`. Allowed formats: JPG, PNG, WebP, GIF, AVIF, MP4, WebM; maximum 25 MiB per file. Uploads are private until assigned; assigned media can be read by the portfolio's audience. Unassigning restores a placeholder. Deleting a file removes it from all positions. Keep originals separately. No video transcoding is provided; use browser-compatible MP4/WebM exports.

The media API requires the trusted Sites identity headers and the stored owner ID for every mutation. Mutations also require a matching Origin. No client-side owner flag grants access. The first-time claim additionally requires `STUDIO_SETUP_CODE`, a runtime secret. Never commit this value. The Sites dispatcher owns sign-in and sign-out routes.

## Development

Use the existing pnpm scripts (`dev`, `build`, `db:generate`). Local D1/R2 data is in the ignored Wrangler state. Local test identity is not a production identity. The schema lives in `db/schema.ts`; migrations are checked into `drizzle/`. Source content is never loaded from Base44 at runtime.

All project visuals intentionally remain placeholders. No generated project artwork or social image is included. Detail-page metadata uses the actual project title and thesis, with no inherited unrelated image.

## Drag-and-drop uploads

After connecting your owner account, drag files from Finder anywhere in the Media Studio. A page overlay marks the drop target. Browsers with the File and Directory Entries API also accept folders, including nested folders; otherwise select files inside the folder or use Browse files. Only the dropped selection is read. Folder paths are not retained: the library stays flat, so use unique descriptive filenames.

Each batch accepts up to 500 files. Hidden files are ignored during drop collection; unsupported, empty, oversized, unreadable, or failed uploads are listed without stopping the remaining valid files. Wait for the current batch to finish, keep the page open, and retry only failed items. The server verifies file signatures and the existing 25 MB limit; upload does not assign or publish media automatically. A timed-out request may still finish on the server, so check the refreshed library before retrying.

Folder traversal follows MDN's File and Directory Entries guidance and reads batches until empty: https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItem/webkitGetAsEntry

## Connected content management

The existing public pages and modular case-study renderer are preserved. `lib/content-registry.ts` maps permanent semantic locations to the existing project model and `content/site-copy.ts`. The supplied `website_code 2.zip` contains the reference schema as `website_code/project.jsonc.txt`; its project/spread concepts inform this adapter, but the browser does not depend on Base44.

- `/studio/content`: current CSV export, import validation, before/after preview, apply, and one-step restore.
- `/studio/map`: pages → sections → copy/media locations, current values, missing/placeholder status, shared-copy origins, and links into media assignment.
- `/studio`: the existing drag-and-drop Media Studio, now using semantic website slots, asset previews, USED/UNUSED labels, and named usage before deletion.

CSV columns: `content_id,page,section,field,type,value`. Only `content_id` and `value` determine updates. Row order and orientation columns never address content. Lists use one item per line; booleans use `true`/`false`; rich text supports simple emphasis and line breaks, never raw HTML. Partial imports leave omitted fields unchanged. Unknown IDs, duplicates, malformed rows, invalid links/types, and missing required values block apply. Export is UTF-8 with reversible spreadsheet-formula protection. An unchanged round trip produces zero changes.

D1 `content_state` stores registered overrides, a revision, and the immediately previous state. Apply and restore use a single conditional update so a stale preview cannot overwrite a newer save. Contact settings use this same state; they are not a separate CMS. Project title/thesis/client/role copy is shared across cards and case studies and edited at the canonical project field. Related-project lists use permanent project keys shown in the Site Map. Slugs and structural module IDs are intentionally not editable via CSV.

Project records and sections now carry persisted semantic `content_id` keys; metric entries also carry fixed keys. Do not regenerate those keys from labels or positions. Each section declares its media locations explicitly. Changing display order or a label must not change identity. The one-time migration in `lib/content-migration.ts` uses the frozen mapping in `content/legacy-slots.json` to preserve existing assignments and contact details. UUID media identities and R2 objects are unchanged. Separate page locations can now point to different assets or reuse the same asset.

Routine edits do not need a deployment. Refresh an already-open portfolio page after saving. New pages, new project records, or new module structures still require a source update; a visual project builder is intentionally out of scope.

## Validation of this update

Local integration coverage is in `scripts/check-cms.py`, `scripts/check-site.py`, and `scripts/check-content.cjs`. `scripts/check-media-drop.cjs` preserves the previous folder-drop checks. Tests temporarily modify local preview content and restore it; they do not accept a production URL. Browser verification covered all main navigation links, all 17 homepage links, nine next and nine previous transitions, the actual CSV chooser/preview/apply/restore workflow, two media uploads and asset swapping, usage and delete warnings, the Art Direction filter, and the Site Map. Test uploads were removed and original copy restored. A visual review confirmed the homepage and case-study design were preserved. The production build and TypeScript checks passed.

Production validation identified a Vinext bundled `Link` export failure (`navigateClientSide` / prefetch functions undefined) that development mode did not reproduce. The small shared `SiteLink` adapter uses ordinary anchors to the same existing server routes, preserving markup, appearance, modified-click behavior, and route architecture without adding another router. Page changes load the latest saved content directly. No framework/dependency upgrade was made.
