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
