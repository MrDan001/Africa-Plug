-- Tighten function execution and search_path configuration found during the launch audit.
-- RLS remains enabled with no anon/authenticated policies on private CMS tables.

create or replace function public.tap_in_set_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$$;

-- This is an event-trigger helper, not an RPC for public or signed-in clients.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
