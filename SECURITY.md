# Portfolio pre-launch security review

## Scope and deployment status

Source-only review of the existing application, 31 August 2026. No live deployment, Site visibility change, DNS change, new authentication system, or production data mutation is part of this task. The currently published source is `2a91f2037826c5a14fb26b593bc22865c4e66fb7`. Baseline commit `44aa42c` preserves that application's source with expanded ignore rules; the following security commit is separately reviewable.

The eventual public Site must allow anonymous portfolio/media reads while enforcing owner-only Studio access. The current outer ChatGPT Site gate prevents a conclusive anonymous production test. Local results do not prove production ingress protection.

## Findings and narrow fixes

| Finding | Source change | Verification |
| --- | --- | --- |
| Signed-in non-owner Studio responses serialized project/slot data even though controls were hidden | Authorize before obtaining/serializing private Studio props; pass empty data to the existing restricted/setup view | Local signed-in non-owner receives restricted UI, no draft sentinel or slot data, and 403 from admin APIs |
| Site Map imported complete project source into a browser bundle | Move the minimal project overview into owner-authorized server props | Client bundle checked for case-study source text; current content still comes from the owner-only API |
| Any assignment made an asset readable, even when its only project was unpublished or its homepage position was inactive | Check current registry visibility before anonymous GET/HEAD; public render maps contain only visible slots and `id`, `mime`, `alt`, `slot` | Published bytes/ranges load anonymously; unassigned/hidden-only files return 404; owner retains access |
| Public component props carried internal storage keys, filenames, byte counts and timestamps | Select only the fields public rendering needs | Public response contains no fixture filename or `object_key` |
| JSON requests were fully buffered before size checks; malformed JSON could become a generic 500 | Shared streaming byte limit before decoding/JSON parsing: 16 KiB ordinary writes, 1.8 MB CSV envelope; object and Content-Type checks | Over-limit fixed/chunked requests rejected, malformed/array requests return 400, wrong MIME returns 415 |
| MP4 detection accepted arbitrary ISO-BMFF brands | Recognized MP4 brand allowlist; bounded AVIF compatible-brand parsing; existing signature checks and 25 MiB streaming cap retained | Recognized MP4/AVIF headers accepted; fake brand, HTML, SVG and mismatched PNG rejected |
| Locked framework/transitive dependencies had security advisories | Targeted security versions and explicit transitive resolutions, without replacing Vinext or changing routes | Type/build/workflow checks and registry audit; unresolved upstream item below |

These are a focused application review and regression tests, not a penetration-test certification. Header/container checks are not full media decoding or malware scanning. Previously published media may have been copied by visitors; hiding a location only affects future application reads.

## Controls retained and verified

- **Authentication:** dispatch-owned Sign in with ChatGPT, stable site-scoped user ID matched to the D1 owner row. Email is not authority. Owner bootstrap requires a runtime secret; a second account cannot overwrite a claimed owner.
- **Authorization:** each media upload/delete/alt update, slot assignment/reassignment, settings write, CSV preview/apply/restore and private read independently verifies the owner server-side. Unknown/missing identity is denied. API authorization does not rely on the outer Site sharing gate.
- **CSRF:** administrative mutations reject absent or mismatched Origin. No permissive CORS is added. Authorization runs before body consumption and writes.
- **Storage:** R2 binding access stays server-side; generated UUID keys do not trust filenames. No public list/write/delete bucket endpoint or storage credential is delivered to browsers. Public reads require an active published slot; one asset reused in any public location remains public.
- **CSV/content:** only registered stable IDs can change content; unknown/prototype-like IDs, malformed/duplicate rows, bad link schemes and invalid required values are rejected. React escapes text; limited emphasis is not HTML execution. Revision checks and one-step restore remain.
- **Upload:** only JPEG, PNG, WebP, GIF, AVIF, MP4 and WebM are accepted. File size is enforced while streaming; user paths cannot overwrite existing object keys. Standard media MIME, `nosniff`, same-origin resource policy, and no-store responses retained.
- **Public writes:** no public Contact submission form exists; no form or spam service was added. The owner-claim endpoint is the one bootstrap exception to owner-only writes: it still requires authenticated identity, the private setup secret and an unclaimed database. Keep the initial secret high-entropy and claim ownership before public launch.
- **Secrets:** all tracked source and the four earlier commits were scanned for known token/key formats, credential URLs, JWTs, suspicious assignments, and local environment values. No known secret was detected in tracked content. The local `.env` remains ignored. No credential was rotated or exposed. Pattern scans cannot guarantee absence of every possible secret.

## Dependency review

Baseline audit reported 35 advisory entries: 16 high, 16 moderate, 3 low, 0 critical. This count is not a count of proven exploitable application paths.

Direct patches: Next 16.2.11, React/React DOM/React Server DOM 19.2.8, Vite 8.0.16, and matching eslint-config-next. Explicit transitive security resolutions cover PostCSS, ws, undici, sharp and esbuild; inspect `pnpm-workspace.yaml` and `pnpm-lock.yaml`. Sharp moves from 0.34 to the published patched 0.35 line; retain build and upload regression checks when deploying.

Relevant upstream notices:
- [React server-function resource exhaustion](https://github.com/advisories/GHSA-wx67-qw84-cm4g)
- [Next middleware/proxy bypass](https://github.com/advisories/GHSA-6gpp-xcg3-4w24) (this app does not use Turbopack or middleware authorization)
- [Vite Windows filesystem denial-rule bypass](https://github.com/advisories/GHSA-fx2h-pf6j-xcff)

Final registry audit: **2 high advisory entries, 0 moderate, 0 low, 0 critical**; both remaining entries concern the single package below. No claim is made that the dependency audit is clean.

**Unresolved upstream package:** `image-size` 2.0.2 is pulled by Vinext. The registry advisory calls for >=2.0.3, but that version was unavailable in the package registry during this review. Do not install untrusted forks or fabricate a resolved version. Advisories concern ICNS/JXL/HEIF parser denial of service:
- https://github.com/advisories/GHSA-w3rx-r6r6-pgpr
- https://github.com/advisories/GHSA-5p2g-fcmc-qvqq

In the installed Vinext source, `image-size` is imported by metadata-route build-data handling. This application does not import those image formats as metadata and its uploads do not call image-size. That reduces exposure in the current workflow but does not erase the dependency advisory. Recheck for the official patch before adding image metadata processing or updating Vinext. Do not expose the development server.

## Required production launch checks

After the owner separately approves deploying this commit, and separately changes sharing to Anyone on the Internet:

1. In a genuinely signed-out browser, load Home, Work, About, Contact, published case studies, and published image/video GET/HEAD/range responses without a login redirect.
2. Confirm `/studio`, `/studio/content`, `/studio/map` cannot provide admin data/actions anonymously. Direct admin API reads and all mutations must return 401/403, including when identity-looking request headers are supplied.
3. Verify the same denials after signing into a different ChatGPT account. Sign in as the real owner and verify media upload/swap/delete, CSV preview/apply/restore, and Site Map. Use disposable fixtures and restore state.
4. Confirm unassigned and hidden-only media return 404 to visitors and remain visible to the owner. Inspect public HTML/RSC responses and static chunks for private metadata and draft content.
5. Confirm the Sites dispatcher strips/overwrites caller-supplied identity headers and cannot be bypassed via a direct worker URL. This trust boundary cannot be established just by examining application code or the local emulator. Do not move to generic hosting without replacing the trusted identity adapter.
6. Confirm production admin responses are not cached across users, the runtime setup secret remains private, the stored owner mapping is preserved, and no GitHub integration automatically deploys commits.
7. Re-run the dependency audit, resolve or reassess the outstanding image-size advisory, and take a private runtime-data backup before applying changes. Follow the source/data distinction in README.

No claim is made that public Internet production behavior, third-party OAuth, CDN isolation, or direct worker ingress has been conclusively tested while the outer access gate remains active.

## Verification recorded for this source

Passed: TypeScript, production build, Drizzle migration compatibility check, semantic registry/CSV unit checks, 126-file nested-folder drop checks, streamed-body/container checks, and all three local HTTP integration suites. The HTTP suites cover anonymous and owner workflows plus a temporary signed-in non-owner fixture. Their CSV edits were restored and test uploads removed.

The public stylesheet, Home/About/Contact/Work/case-study layout source, SiteLink, hosting association, and database schema match the baseline. Fourteen generated public JavaScript files were checked for the previously bundled complete case-study source text; it was absent. These checks support the scoped changes; they do not replace the pending anonymous production launch checks above.

GitHub repository creation and repository-level security switches require the intended account to be resolved. Do not make the repository public to obtain optional scanning features. Once created privately, enable available dependency alerts/security updates and secret scanning without adding deployment automation or granting broader access without the owner's authorization.
