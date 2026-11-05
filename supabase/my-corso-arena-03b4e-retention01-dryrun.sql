with policy as (
  select now() as checked_at, interval '30 days' as pending_limit,
         interval '30 days' as reviewed_limit
), classified as (
  select s.id, s.review_status,
         case
           when s.review_status = 'pending'
             and s.created_at < p.checked_at - p.pending_limit
             then 'pending_expired'
           when s.review_status in ('verified', 'rejected')
             and s.reviewed_at is not null
             and s.reviewed_at < p.checked_at - p.reviewed_limit
             then 'reviewed_expired'
           else 'not_eligible'
         end as retention_bucket
  from public.usg_arena_gps_evidence_sessions s
  cross join policy p
), sample_counts as (
  select session_id, count(*)::bigint as sample_count
  from public.usg_arena_gps_evidence_samples
  group by session_id
)
select
  c.retention_bucket,
  count(*)::bigint as session_count,
  coalesce(sum(sc.sample_count), 0)::bigint as associated_sample_count
from classified c
left join sample_counts sc on sc.session_id = c.id
group by c.retention_bucket
order by case c.retention_bucket
  when 'pending_expired' then 1
  when 'reviewed_expired' then 2
  else 3 end;

select
  (select count(*) from public.usg_arena_gps_evidence_sessions)::bigint as total_sessions,
  (select count(*) from public.usg_arena_gps_evidence_samples)::bigint as total_samples,
  (select count(*) from public.usg_arena_gps_evidence_sessions
    where review_status = 'pending' and created_at < now() - interval '30 days')::bigint as expired_pending_sessions,
  (select count(*) from public.usg_arena_gps_evidence_sessions
    where review_status in ('verified', 'rejected') and reviewed_at is not null
      and reviewed_at < now() - interval '30 days')::bigint as expired_reviewed_sessions;
