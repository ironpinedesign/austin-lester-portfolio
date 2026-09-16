# Austin Lester Studio Content Authority

**Status:** Binding content-governance contract  
**Applies to:** Checked-in content, D1 runtime values, production verification, audits, and releases  
**Parent contract:** [`ALS_SYSTEM_AUTHORITY.md`](./ALS_SYSTEM_AUTHORITY.md)  
**Source audit:** `ALS-AUTH-012` in [`ALS_SYSTEM_AUTHORITY_AUDIT.md`](./ALS_SYSTEM_AUTHORITY_AUDIT.md)

## Purpose

ALS uses checked-in defaults and editable D1 runtime values. This document keeps that useful arrangement lightweight, reviewable, and recoverable without introducing a separate CMS workflow.

The content principle is:

> D1 owns current editable production content; Git owns schemas, safe defaults, and the reviewed baseline. Approved runtime changes must return to Git through export, diff, and review.

## Content layers

| Layer | Authority | Current role |
| --- | --- | --- |
| Git schemas/configuration | Implementation authority | Defines allowed fields, identifiers, relationships, section order, layout/media associations, and fallback behavior. |
| Git checked-in content | Reviewed baseline | Supplies version-controlled project/default copy and safe fallback values, including `content/projects.json`, `content/site-copy.ts`, and `content/about-social-proof.ts`. |
| D1 `content_state` | Current editable runtime state | May override checked-in values through `values_json`. It can contain newer production copy between reconciliations. |
| Production | Verification evidence | Shows the resolved content delivered to visitors. It does not identify by itself whether a value came from Git or D1. |
| Figma | Design/content-placement context | May show approved copy in a composition, but is not the canonical content store. It must record which reviewed content state it represents before copy is called current. |

R2 media binaries are governed by [`ALS_SYSTEM_AUTHORITY.md`](./ALS_SYSTEM_AUTHORITY.md). Their captions, alt text, associations, and other content metadata follow this reconciliation contract when stored in D1 or Git.

## Precedence

At runtime, the current `lib/content.ts` and `lib/content-registry.ts` flow may resolve content in this order:

1. a present D1 value;
2. the checked-in Git default when no D1 value is present.

That runtime precedence does not make D1 the only canonical source. It separates two responsibilities:

- **D1:** what the editable production state currently says;
- **Git:** what has been reviewed, versioned, and can safely restore the site.

If D1 and Git differ, report the difference as content drift until it is reviewed. Do not assume either value is correct solely because it is newer.

## Change paths

### Git-led content change

Use this path when content is prepared and reviewed with implementation work or when a stable baseline/default is being changed.

1. Edit the appropriate checked-in content source.
2. Review the diff for copy, identifiers, ordering, associations, and fallback behavior.
3. Run the relevant validation/build checks.
4. Release through the guarded repository process.
5. Confirm the resolved production value.
6. If D1 already contains an override for the same field, reconcile or remove/update that override deliberately; do not assume the Git change will win at runtime.

### D1-led content change

Use this path for a direct editable production copy change.

1. Make the authorized D1 edit.
2. Record who made it, when, why, and which content keys changed.
3. Export the relevant D1 state immediately after the edit.
4. Diff the export against the current Git baseline.
5. Review the resolved copy in production and in its responsive context when layout could be affected.
6. Update the appropriate checked-in content source with the approved value.
7. Review and commit that reconciliation through the normal Git workflow.
8. Confirm that D1 and the reviewed Git baseline express the same approved content, allowing only documented runtime-only values.

The D1 edit can precede Git reconciliation, but the reconciliation must not be omitted.

## Reconciliation procedure

For each reconciliation:

1. **Capture** the relevant D1 export without mutating production.
2. **Identify** the environment, capture time, and D1 revision/export identifier when available.
3. **Diff** normalized key/value content against the checked-in baseline. Ignore formatting-only or ordering-only noise when it has no runtime meaning.
4. **Classify** every difference as:
   - approved production change;
   - intentional runtime-only value;
   - stale/unapproved override; or
   - unresolved.
5. **Promote** approved production changes into the appropriate checked-in content file.
6. **Correct** stale or unapproved D1 values through the authorized runtime process; do not hide them by changing Git.
7. **Document** intentional runtime-only values and why they cannot or should not be checked in.
8. **Verify** the final resolved production copy after the Git/runtime states are reconciled.
9. **Record** the verified commit and D1 state with the release or audit notes.

For this single-owner portfolio, a concise reconciliation note is sufficient. It should contain the capture time/state, changed keys, classification, resulting commit, and verification result. A new CMS, approval service, or database workflow is not required.

## Drift detection

Check for drift:

- before a production content audit;
- before declaring Figma copy current or verified;
- before a release that changes content schemas/defaults or relies on specific copy;
- after a direct D1 edit;
- when production copy differs from the repository; and
- before using production content as the basis for a new design or implementation handoff.

Drift is detected by exporting the relevant D1 values and diffing them against the current checked-in defaults. A browser-only comparison is insufficient because it does not reliably identify source precedence, hidden values, or unused overrides.

When drift is found:

- do not silently change Git to match production;
- do not silently overwrite D1 with Git;
- classify the difference first; and
- preserve a recoverable record of the pre-reconciliation state.

## Returning approved D1 changes to Git

Map each approved D1 key to its owning checked-in content source. Preserve stable IDs, section ordering, associations, and schema constraints while updating the approved value.

The Git change should contain only the reconciled content and any required schema-compatible metadata. It should not include database exports containing unrelated values, secrets, operational metadata, or unreviewed content.

After the Git update:

1. review the content diff;
2. run relevant content/type/build checks;
3. commit the approved baseline;
4. verify the resolved production output; and
5. attach the commit and D1 capture reference to the reconciliation note.

If a D1 value is intentionally runtime-only, record the key, reason, owner, and review date. Runtime-only status is an exception, not the default.

## Audit and release record

A content-sensitive audit or release should capture:

- environment inspected;
- inspection/export timestamp and timezone;
- D1 revision, export identifier, or immutable capture reference when available;
- Git commit inspected or released;
- routes/projects/content keys in scope;
- whether a D1-versus-Git diff was run;
- all material differences and their classification;
- reconciliation commit or unresolved owner/action;
- production URL and verification result; and
- any Figma frame whose copy was treated as current.

Do not include secrets, credentials, private source material, or unrestricted database dumps in Git.

## Meaning of “verified”

Content may be described as **verified** only when:

1. the relevant D1 state has been captured;
2. D1 has been diffed against the inspected Git commit;
3. every material difference is reconciled or explicitly documented;
4. the resolved production content has been checked on the relevant route; and
5. the audit/release record identifies the Git commit and D1 state inspected.

If any condition is missing, use a narrower statement such as `production observed`, `Git baseline reviewed`, or `D1 change pending reconciliation`.

Figma copy may be called current only when it identifies the verified content state or when an explicit copy approval supersedes it and is queued for both D1 and Git reconciliation.

## Lightweight operating cadence

For normal ALS operation:

- reconcile immediately after direct D1 changes;
- run a drift check before content-sensitive releases and audits;
- keep one concise reconciliation note per change set;
- retain Git history as the long-term review record; and
- keep exports outside Git unless they are deliberately sanitized, scoped, and needed as an audit artifact.

This process is intentionally manual and small. Automation may later assist export and diffing, but it must not change the authority model or introduce a second editorial system.

## Unresolved content decisions

This contract does not define:

- exact retention/storage for D1 captures;
- a formal revision identifier if the current D1 workflow cannot supply one;
- per-media caption and mobile-visibility policy (`ALS-AUTH-014`); or
- final Kryptek asset/content approval (`ALS-AUTH-015`).

Until those decisions are made, audits must record the best available timestamped capture and describe any limitation explicitly.

