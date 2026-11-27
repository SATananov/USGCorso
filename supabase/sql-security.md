# USGCorso SQL Security

This change set hardens the owner/Admin boundary for dogs and makes all maintained Community dog-list and photo-read definitions require approved shared content. It does not execute SQL or establish that any database has these definitions installed.

## Authorization boundary

- `authenticated` retains `SELECT`, `INSERT`, `UPDATE`, and `DELETE` on `public.dogs`; row policies limit these operations to the caller's own rows. `PUBLIC` and `anon` receive no table privileges from `my-corso.sql`. Existing direct table privileges for `authenticated` are cleared before the CRUD grant, so the source does not leave `TRUNCATE`, `REFERENCES`, or `TRIGGER` behind.
- The dog trigger permits an ordinary owner to edit their own dog. A public submission is set to `pending`; an owner may use the supported submission path to return their own visible dog to `pending`. A non-Admin cannot choose another moderation decision or edit moderation metadata. Editing public dog content resets review metadata and returns it to `pending`.
- `dogs_select_owner_or_shared`, installed by `dog-moderation.sql`, lets authenticated owners read their own rows, Admins review rows, and other authenticated users read only approved shared rows. Private dogs remain owner/Admin-only.
- Existing `admin_*` RPCs continue to check `public.is_admin()` on the server. Direct execution is still granted to `authenticated` so the existing application can invoke them; authorization is enforced inside each function. The trigger function itself is not executable as an RPC by ordinary authenticated callers.
- The private `corso-photos` bucket read policy grants an owner access to their linked photo, Admin access for moderation, and other authenticated users access only when the associated dog is shared and approved.
- Each `community_corso_list()` definition filters both `community_visible = true` and `moderation_status = 'approved'`. The maintained definitions now return the same fields, including `photo_path`.

Role membership or other grants from database-specific sources can add effective privileges beyond these source statements. Check effective privileges in the target database before accepting deployment; the verification script checks effective `authenticated` table privileges.

## Source dependencies and application order

Use the target database's reviewed migration workflow. Do not run this list against production without an approved deployment plan. Confirm prerequisites and dependencies first; these scripts intentionally raise errors when required moderation or Admin prerequisites are missing.

1. `supabase/profile.sql` — creates `public.profiles`, required by the Community list.
2. `supabase/admin-user-roles-access-policies.sql` — creates `user_roles` and the server-side `is_admin()` authorization function.
3. `supabase/my-corso.sql` — creates `public.dogs`, owner CRUD policies and least-privilege table grants. Its read policy is owner-only until step 5. If this file is rerun after step 5, it resets that policy to owner-only; reapply step 5 before restoring Community/Admin reads.
4. `supabase/my-corso-color.sql` — adds the `color` column referenced by the moderation trigger and list RPC.
5. `supabase/dog-moderation.sql` — adds moderation/photo columns, migrates only null moderation statuses, installs the trigger and Admin RPCs, then installs the final owner/Admin/approved SELECT policy. A null status on a shared dog becomes `pending`; a null status on a private dog becomes `private`. Existing non-null Admin decisions and statuses are preserved.
6. `supabase/my-corso-photos.sql` — creates the private photo bucket and owner-write/owner-Admin-approved-read policies, and installs the filtered list RPC.
7. `supabase/community-dog-list.sql` — canonical final Community list and photo-read policy definition. It replaces existing photo SELECT policies matching the bucket and creates the moderated policy.

`supabase/community-corso.sql` is retained as a safe legacy list installer; it requires the same prerequisites and returns the same filtered result shape. It is not a separate step in the normal order above. Because the Community installers drop and recreate the RPC, inspect database dependencies before applying them; they do not use `CASCADE`.

## Targeted LAB verification

No SQL was run for this implementation. The current Security LAB and `USGCorso_DB_Backup` are excluded as test targets. After explicit approval and separate provisioning of a disposable Supabase stack, run `verify-sql-security.ps1` with that stack's unique project ID, database volume, and internal Docker network. It requires a local Windows Docker endpoint, an internal network, one running matching database container, and no other project containers on that network. It rejects the known Security LAB and backup volume names. It executes catalog/privilege SELECTs only; it does not start services or modify rows.

Then, in the isolated LAB only:

1. Review the current LAB project identity and database-volume attachment independently. Do not proceed if either differs from the expected LAB identity/volume.
2. Apply the SQL files in the order above using the LAB SQL Editor or the LAB's explicit local PostgreSQL connection. Do not use a linked/remote Supabase CLI target.
3. Run `supabase/review/authorization-hardening-01/test/STAGING_ROLE_TEST.sql` only in LAB. It performs transactional test updates and ends with rollback; review its contents and warning first. It is not a production script.
4. Use separate disposable owner, ordinary-user and existing authorized Admin identities. Verify: owner CRUD succeeds only for owned dogs; non-owner cannot read pending/private rows; Admin can review and moderate; owner direct attempts to set `approved`, `rejected`, `needs_changes`, or non-null Admin metadata fail; the supported submit RPC returns an owned visible dog to `pending`; owner edits to shared content require reapproval.
5. For Storage, verify an owner can read their linked private photo; another ordinary user cannot; approved shared photos are readable; pending/rejected/private photos are not; Admin can read for moderation. Test against disposable LAB objects only.
6. Verify Community RPC output excludes private, pending, rejected, and `community_visible = false` rows and includes approved shared rows. Confirm the existing client still receives `photo_path` and profile fields.
7. Check `has_table_privilege` for `authenticated` on `TRUNCATE`, `REFERENCES`, and `TRIGGER` and verify the ordinary CRUD privileges remain. Inspect `pg_policies` and all other applicable grants/memberships; the script cannot prove behavior of every role membership or external policy.
8. Confirm public listing and Admin moderation runtime behavior in the application separately. Source and catalog checks alone are not runtime proof.

Do not delete or reset LAB fixtures as part of verification. Capture failures and stop rather than weakening policies to satisfy a test.

## Rollback and recovery

Before any LAB application, export the affected function definitions, policy definitions, grants and relevant table metadata using read-only catalog queries. Keep the database backup/restore process specific to the isolated LAB and verify the volume identity. Do not rollback by restoring unrelated database state or revoking legacy permissions wholesale. A failure inside the transaction-wrapped moderation, photo, or Community-list scripts rolls back that script; `my-corso.sql` is not transaction-wrapped, so inspect its resulting state before retrying. Rollback SQL must be prepared from the captured LAB baseline and reviewed before use; no automatic rollback is supplied.

## Status

These source changes are prepared for review only. No database was accessed or modified, and no production readiness or runtime behavior is claimed.
