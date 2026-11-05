BEGIN;

CREATE OR REPLACE FUNCTION public.translation_fail_job_03b(
  target_item_id uuid,
  requested_language text,
  target_claim_token uuid,
  failure_reason text
)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public
AS $$
DECLARE
  updated_rows integer;
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'service role required' USING ERRCODE='42501';
  END IF;
  UPDATE public.content_translation_jobs j
  SET status=CASE WHEN j.attempts >= 3 THEN 'failed' ELSE 'pending' END,
      last_error=left(coalesce(nullif(trim(failure_reason), ''), 'Translation failed'), 500),
      updated_at=now(), queued_at=now(),
      claim_token=NULL, claimed_at=NULL, claimed_source_hash=NULL
  WHERE j.content_item_id=target_item_id
    AND j.target_language=requested_language
    AND j.status='processing'
    AND j.claim_token=target_claim_token;
  GET DIAGNOSTICS updated_rows=ROW_COUNT;
  RETURN updated_rows=1;
END;
$$;

REVOKE ALL ON FUNCTION public.translation_fail_job_03b(uuid,text,uuid,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.translation_fail_job_03b(uuid,text,uuid,text) TO service_role;

COMMIT;
