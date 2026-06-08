-- Soft-delete for audit jobs. Setting deleted_at hides the row from the
-- owner's list view without destroying the record or cascading to related
-- tables (job_charges idempotency, credit_purchases, etc.).
alter table public.audit_jobs add column deleted_at timestamptz;

-- Partial index so the active-jobs query (deleted_at IS NULL) stays fast.
create index audit_jobs_active_idx
  on public.audit_jobs (user_id, created_at desc)
  where deleted_at is null;
