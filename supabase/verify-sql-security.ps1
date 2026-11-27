[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [ValidatePattern('^usgcorso-sql-security-disposable-[a-z0-9-]+$')]
  [string]$ExpectedProjectId,

  [Parameter(Mandatory = $true)]
  [ValidatePattern('^supabase_db_usgcorso-sql-security-disposable-[a-z0-9-]+$')]
  [string]$ExpectedDatabaseVolume,

  [Parameter(Mandatory = $true)]
  [ValidatePattern('^usgcorso-sql-security-disposable-[a-z0-9-]+$')]
  [string]$ExpectedInternalNetwork
)

$ErrorActionPreference = 'Stop'
$forbiddenVolumes = @(
  'supabase-db-390d186130ed409468a0a8d8a48f3f86',
  'supabase_db_USGCorso_DB_Backup'
)
if ($ExpectedDatabaseVolume -in $forbiddenVolumes) {
  throw 'The expected volume names an existing Security LAB or USGCorso_DB_Backup environment.'
}

$dockerEndpoint = & docker context inspect --format '{{.Endpoints.docker.Host}}' 2>$null
if ($LASTEXITCODE -ne 0 -or $dockerEndpoint -notmatch '^npipe:') {
  throw 'Docker context is not a verified local Windows named-pipe endpoint. This script will not query it.'
}

$dockerInfo = & docker info --format '{{.ServerVersion}}' 2>$null
if ($LASTEXITCODE -ne 0 -or -not $dockerInfo) {
  throw 'Docker engine is unavailable. This script will not start it.'
}

$containerIds = @(& docker ps --filter "volume=$ExpectedDatabaseVolume" --format '{{.ID}}')
if ($LASTEXITCODE -ne 0 -or $containerIds.Count -ne 1 -or -not $containerIds[0]) {
  throw "Expected exactly one running container attached to volume $ExpectedDatabaseVolume; found $($containerIds.Count)."
}

$inspect = & docker inspect --format '{{.Name}}|{{.State.Running}}|{{range .Mounts}}{{if eq .Name "' + $ExpectedDatabaseVolume + '"}}{{.Name}}={{.Destination}}{{end}}{{end}}|{{range $name, $network := .NetworkSettings.Networks}}{{$name}};{{end}}' $containerIds[0]
if ($LASTEXITCODE -ne 0) {
  throw 'Could not inspect the selected container.'
}

$parts = $inspect -split '\|', 4
if ($parts.Count -ne 4 -or $parts[0] -notmatch [regex]::Escape($ExpectedProjectId) -or $parts[0] -notmatch 'database' -or $parts[1] -ne 'true' -or $parts[2] -notmatch [regex]::Escape($ExpectedDatabaseVolume) -or $parts[3].TrimEnd(';') -ne $ExpectedInternalNetwork) {
  throw 'Container name, running state, mounted volume, or single attached network did not match the disposable target.'
}

$networkInfo = & docker network inspect --format '{{.Internal}}|{{range $id, $container := .Containers}}{{$container.Name}};{{end}}' $ExpectedInternalNetwork
if ($LASTEXITCODE -ne 0) {
  throw 'Could not inspect the expected Docker network.'
}
$networkParts = $networkInfo -split '\|', 2
$attachedNames = @($networkParts[1].TrimEnd(';') -split ';' | Where-Object { $_ })
if ($networkParts.Count -ne 2 -or $networkParts[0] -ne 'true' -or $attachedNames.Count -eq 0 -or @($attachedNames | Where-Object { $_ -notmatch [regex]::Escape($ExpectedProjectId) }).Count -gt 0) {
  throw 'The expected network is not internal or contains a container outside the disposable project.'
}

$sql = @'
select json_build_object(
  'dogs_rls_enabled', coalesce((select relrowsecurity from pg_class where oid = 'public.dogs'::regclass), false),
  'trigger_status_guard', position('only administrators may set moderation decisions' in pg_get_functiondef('public.apply_dog_moderation_state()'::regprocedure)) > 0,
  'trigger_metadata_guard', position('only administrators may edit moderation metadata' in pg_get_functiondef('public.apply_dog_moderation_state()'::regprocedure)) > 0,
  'dogs_owner_admin_approved_policy', exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'dogs'
      and policyname = 'dogs_select_owner_or_shared'
      and qual ilike '%is_admin%' and qual ilike '%moderation_status%' and qual ilike '%approved%'
  ),
  'authenticated_no_truncate', not has_table_privilege('authenticated', 'public.dogs', 'TRUNCATE'),
  'authenticated_no_references', not has_table_privilege('authenticated', 'public.dogs', 'REFERENCES'),
  'authenticated_no_trigger', not has_table_privilege('authenticated', 'public.dogs', 'TRIGGER'),
  'authenticated_owner_crud', has_table_privilege('authenticated', 'public.dogs', 'SELECT')
    and has_table_privilege('authenticated', 'public.dogs', 'INSERT')
    and has_table_privilege('authenticated', 'public.dogs', 'UPDATE')
    and has_table_privilege('authenticated', 'public.dogs', 'DELETE'),
  'community_list_filters_approved', position('moderation_status' in pg_get_functiondef('public.community_corso_list()'::regprocedure)) > 0
    and position('approved' in pg_get_functiondef('public.community_corso_list()'::regprocedure)) > 0,
  'photo_read_policy_moderated', exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects'
      and policyname in ('corso photos authenticated read', 'corso_photos_select_moderated')
      and qual ilike '%moderation_status%' and qual ilike '%approved%' and qual ilike '%is_admin%'
  ),
  'admin_check_present', to_regprocedure('public.is_admin()') is not null
)::text;
'@

$jsonText = & docker exec $containerIds[0] psql --no-psqlrc --quiet --tuples-only --no-align --set ON_ERROR_STOP=1 --username postgres --dbname postgres --command $sql
if ($LASTEXITCODE -ne 0) {
  throw 'Read-only disposable database catalog query failed.'
}

$result = ($jsonText | Out-String).Trim() | ConvertFrom-Json
$failed = @($result.PSObject.Properties | Where-Object { $_.Value -ne $true } | ForEach-Object Name)
Write-Output "Verified target: $($parts[0]) (volume $ExpectedDatabaseVolume; network $ExpectedInternalNetwork)"
$result.PSObject.Properties | ForEach-Object { '{0}: {1}' -f $_.Name, $(if ($_.Value) { 'PASS' } else { 'FAIL' }) }
if ($failed.Count -gt 0) {
  throw "Disposable database catalog checks failed: $($failed -join ', ')"
}
