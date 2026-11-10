# USGCorso — SQL catalog

> **Navigation index only.** These links point to the existing SQL files; no SQL has been moved, renamed, merged, or executed.

**Verified baseline:** `cc1f32fd059b8008b1a99f899124e62d7b630706` (`main`) based on the earlier clean checkpoint plus 15 Git-verified `R100` renames.

**Important:** Names with `01`, `fix`, `verify`, `03b` or `retention` often encode separate rollout stages. Do not treat them as redundant. Execution status and authoritative order are **not** certified by this catalog.

## Browse by area

- [01 · Official migrations](#01--official-migrations) — 1 files
- [02 · Knowledge content packs & verification](#02--knowledge-content-packs--verification) — 20 files
- [03 · Arena historical sequence](#03--arena-historical-sequence) — 10 files
- [04 · My Corso, growth & moderation](#04--my-corso-growth--moderation) — 10 files
- [05 · Knowledge public & translations](#05--knowledge-public--translations) — 4 files
- [06 · Administration, moderation & governance](#06--administration-moderation--governance) — 12 files
- [07 · Places, maps, media & location](#07--places-maps-media--location) — 11 files
- [08 · Services & professional profiles](#08--services--professional-profiles) — 14 files
- [09 · Notifications & home counters](#09--notifications--home-counters) — 2 files
- [10 · Accounts, storage & community](#10--accounts-storage--community) — 6 files
- [11 · Other SQL scripts](#11--other-sql-scripts) — 1 files

## File index

### 01 · Official migrations

This directory contains the Supabase migration script. Preserve its name and path until remote migration history has been validated.

- [`migrations/translation_03c_fix_fail_rpc.sql`](<migrations/translation_03c_fix_fail_rpc.sql>)

### 02 · Knowledge content packs & verification

Packs and matching `verify` scripts are distinct; retain numbered counterparts.

- [`knowledge-content-pack-01-verify.sql`](<knowledge-content-pack-01-verify.sql>)
- [`knowledge-content-pack-01.sql`](<knowledge-content-pack-01.sql>)
- [`knowledge-content-pack-02-verify.sql`](<knowledge-content-pack-02-verify.sql>)
- [`knowledge-content-pack-02.sql`](<knowledge-content-pack-02.sql>)
- [`knowledge-content-pack-03-verify.sql`](<knowledge-content-pack-03-verify.sql>)
- [`knowledge-content-pack-03.sql`](<knowledge-content-pack-03.sql>)
- [`knowledge-content-pack-04-verify.sql`](<knowledge-content-pack-04-verify.sql>)
- [`knowledge-content-pack-04.sql`](<knowledge-content-pack-04.sql>)
- [`knowledge-content-pack-05-verify.sql`](<knowledge-content-pack-05-verify.sql>)
- [`knowledge-content-pack-05.sql`](<knowledge-content-pack-05.sql>)
- [`knowledge-content-pack-06-verify.sql`](<knowledge-content-pack-06-verify.sql>)
- [`knowledge-content-pack-06.sql`](<knowledge-content-pack-06.sql>)
- [`knowledge-content-pack-07-verify.sql`](<knowledge-content-pack-07-verify.sql>)
- [`knowledge-content-pack-07.sql`](<knowledge-content-pack-07.sql>)
- [`knowledge-content-pack-08-verify.sql`](<knowledge-content-pack-08-verify.sql>)
- [`knowledge-content-pack-08.sql`](<knowledge-content-pack-08.sql>)
- [`knowledge-content-pack-09-verify.sql`](<knowledge-content-pack-09-verify.sql>)
- [`knowledge-content-pack-09.sql`](<knowledge-content-pack-09.sql>)
- [`knowledge-content-pack-10-verify.sql`](<knowledge-content-pack-10-verify.sql>)
- [`knowledge-content-pack-10.sql`](<knowledge-content-pack-10.sql>)

### 03 · Arena historical sequence

Arena scripts represent separate implementation, fix, audit, and retention stages; the numbering is intentionally retained.

- [`my-corso-arena-03a.sql`](<my-corso-arena-03a.sql>)
- [`my-corso-arena-03b1.sql`](<my-corso-arena-03b1.sql>)
- [`my-corso-arena-03b3a.sql`](<my-corso-arena-03b3a.sql>)
- [`my-corso-arena-03b3b.sql`](<my-corso-arena-03b3b.sql>)
- [`my-corso-arena-03b4b.sql`](<my-corso-arena-03b4b.sql>)
- [`my-corso-arena-03b4c-fix01.sql`](<my-corso-arena-03b4c-fix01.sql>)
- [`my-corso-arena-03b4c.sql`](<my-corso-arena-03b4c.sql>)
- [`my-corso-arena-03b4e-audit01.sql`](<my-corso-arena-03b4e-audit01.sql>)
- [`my-corso-arena-03b4e-retention01-dryrun.sql`](<my-corso-arena-03b4e-retention01-dryrun.sql>)
- [`my-corso-arena-03b4e-retention02.sql`](<my-corso-arena-03b4e-retention02.sql>)

### 04 · My Corso, growth & moderation

- [`admin-my-corso-dogs.sql`](<admin-my-corso-dogs.sql>)
- [`my-corso-behavior.sql`](<my-corso-behavior.sql>)
- [`my-corso-challenges-01a.sql`](<my-corso-challenges-01a.sql>)
- [`my-corso-color.sql`](<my-corso-color.sql>)
- [`my-corso-growth-01.sql`](<my-corso-growth-01.sql>)
- [`my-corso-growth-02.sql`](<my-corso-growth-02.sql>)
- [`my-corso-growth-03.sql`](<my-corso-growth-03.sql>)
- [`my-corso-moderation-03b2a.sql`](<my-corso-moderation-03b2a.sql>)
- [`my-corso-moderation-03b2b.sql`](<my-corso-moderation-03b2b.sql>)
- [`my-corso-photos.sql`](<my-corso-photos.sql>)

### 05 · Knowledge public & translations

- [`knowledge-i18n-01-verify.sql`](<knowledge-i18n-01-verify.sql>)
- [`knowledge-i18n-01.sql`](<knowledge-i18n-01.sql>)
- [`knowledge-list-public-items-by-category.sql`](<knowledge-list-public-items-by-category.sql>)
- [`knowledge-list-public-items.sql`](<knowledge-list-public-items.sql>)

### 06 · Administration, moderation & governance

- [`admin-media-manage-01b.sql`](<admin-media-manage-01b.sql>)
- [`admin-pending-notifications-10.sql`](<admin-pending-notifications-10.sql>)
- [`admin-pending-place-media.sql`](<admin-pending-place-media.sql>)
- [`admin-place-details.sql`](<admin-place-details.sql>)
- [`admin-places-02-edit-request-changes.sql`](<admin-places-02-edit-request-changes.sql>)
- [`admin-places-moderation.sql`](<admin-places-moderation.sql>)
- [`admin-shared-content-details.sql`](<admin-shared-content-details.sql>)
- [`admin.sql`](<admin.sql>)
- [`approval-notifications-08.sql`](<approval-notifications-08.sql>)
- [`content-governance-01.sql`](<content-governance-01.sql>)
- [`content-governance-03a.sql`](<content-governance-03a.sql>)
- [`moderation-notifications-12.sql`](<moderation-notifications-12.sql>)

### 07 · Places, maps, media & location

- [`corso-places-admin-management.sql`](<corso-places-admin-management.sql>)
- [`corso-places-coordinate-fix.sql`](<corso-places-coordinate-fix.sql>)
- [`corso-places-seed.sql`](<corso-places-seed.sql>)
- [`corso-places.sql`](<corso-places.sql>)
- [`place-favorites.sql`](<place-favorites.sql>)
- [`place-media-storage-and-moderation.sql`](<place-media-storage-and-moderation.sql>)
- [`place-owner-admin-edit.sql`](<place-owner-admin-edit.sql>)
- [`place-review-helpful.sql`](<place-review-helpful.sql>)
- [`place-reviews.sql`](<place-reviews.sql>)
- [`privacy-location-17b.sql`](<privacy-location-17b.sql>)
- [`user-map-presence.sql`](<user-map-presence.sql>)

### 08 · Services & professional profiles

- [`home-services-approved-profile-count.sql`](<home-services-approved-profile-count.sql>)
- [`my-professional-profile.sql`](<my-professional-profile.sql>)
- [`professional-application-required-info.sql`](<professional-application-required-info.sql>)
- [`services-admin-profile-fields-02-fix02.sql`](<services-admin-profile-fields-02-fix02.sql>)
- [`services-admin-visibility-03c3.sql`](<services-admin-visibility-03c3.sql>)
- [`services-extended-public-fields-03-fix02.sql`](<services-extended-public-fields-03-fix02.sql>)
- [`services-extended-public-fields-03.sql`](<services-extended-public-fields-03.sql>)
- [`services-professional-access-02a.sql`](<services-professional-access-02a.sql>)
- [`services-profile-save-preserve-visibility-04.sql`](<services-profile-save-preserve-visibility-04.sql>)
- [`services-profile-visibility-settings-02.sql`](<services-profile-visibility-settings-02.sql>)
- [`services-public-catalog-03b1.sql`](<services-public-catalog-03b1.sql>)
- [`services-public-catalog-visibility-04.sql`](<services-public-catalog-visibility-04.sql>)
- [`services-public-category-counts.sql`](<services-public-category-counts.sql>)
- [`services-public-profile-visibility-03c1.sql`](<services-public-profile-visibility-03c1.sql>)

### 09 · Notifications & home counters

- [`home-actions-counters-04b.sql`](<home-actions-counters-04b.sql>)
- [`notification-foundation.sql`](<notification-foundation.sql>)

### 10 · Accounts, storage & community

- [`account-deletion.sql`](<account-deletion.sql>)
- [`community-corso.sql`](<community-corso.sql>)
- [`profile.sql`](<profile.sql>)
- [`storage-cleanup-safety-15.sql`](<storage-cleanup-safety-15.sql>)
- [`storage-cleanup-safety-16a.sql`](<storage-cleanup-safety-16a.sql>)
- [`user-content-assets-02a.sql`](<user-content-assets-02a.sql>)

### 11 · Other SQL scripts

- [`my-corso.sql`](<my-corso.sql>)

## Safety and usage

- Open this file in VS Code and use the clickable links to navigate to the original SQL scripts.
- Do **not** run all files in alphabetical order. This document is an index, not a migration execution plan.
- Live Supabase migration history and SQL Editor execution history have not been checked.
- Supabase Edge Functions and `supabase/config.toml` remain in their current locations.
- The SoftUni demo accounts and OCR Test Lab are outside this operation and remain untouched.

## Current organizational decision

Keep the SQL files at their original paths until remote migration status and external runbooks are reviewed. This avoids breaking existing references or migration workflows.
