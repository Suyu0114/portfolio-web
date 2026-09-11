-- Supabase free-plan keep-alive — the heartbeat table and its RPC.
--
-- Apply by hand in the Supabase SQL editor, the same way as `schema.sql`, and
-- for the same reason (§5): no migration tooling for one file. Every statement
-- is guarded, so re-running is safe.
--
-- Why this exists: a Free-plan project is paused automatically when its user
-- database sees too little activity over a week. `suyu-protfolio` was paused
-- twice on that rule — 2026-08-15 and 2026-09-07 — and each pause takes the
-- chatbot backend down until someone restores it by hand from the dashboard.
-- A daily GitHub Actions job (`.github/workflows/supabase-keepalive.yml`)
-- calls `keepalive_ping()` to keep the project counted as active.
--
-- Access is server-side only, through the service/secret key, exactly like
-- every other object in this schema. RLS is on, no policy exists, and the
-- function's execute grant is narrowed to `service_role`.

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------

-- One row, forever. The `check (id = 1)` is what enforces that: a second
-- insert has nowhere to go, so the table cannot grow no matter how often the
-- workflow runs or how badly it misbehaves.
--
-- Writing rather than reading is deliberate. A write is unambiguously database
-- activity; a read that RLS blocks returns zero rows, and whether Supabase
-- counts that as activity is not documented. `last_ping` and `ping_count` also
-- make the job verifiable after the fact — they are the evidence that a run
-- which reported success actually reached Postgres.
create table if not exists public.keepalive (
  id          smallint primary key default 1 check (id = 1),
  last_ping   timestamptz not null default now(),
  ping_count  bigint      not null default 0
);

insert into public.keepalive (id) values (1)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- RPC
-- ---------------------------------------------------------------------------

-- `security invoker`, so the update runs as whoever called it. Combined with
-- the grants below that is always `service_role`, which Supabase already
-- grants table privileges on `public` — hence no `security definer` and no
-- privilege escalation to reason about.
--
-- `set search_path = ''` forces every reference to be schema-qualified, which
-- is why the table is written as `public.keepalive` here.
create or replace function public.keepalive_ping()
returns timestamptz
language sql
security invoker
set search_path = ''
as $$
  update public.keepalive
     set last_ping  = now(),
         ping_count = ping_count + 1
   where id = 1
  returning last_ping;
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security — enabled with NO policies, matching `schema.sql`.
-- ---------------------------------------------------------------------------

alter table public.keepalive enable row level security;

-- Belt and braces, and here it is load-bearing rather than decorative:
-- Supabase's default privileges on `public` grant anon/authenticated access,
-- and PUBLIC gets execute on new functions. Without these revokes anyone
-- holding the publishable (anon) key could call the RPC in a loop and write to
-- the table at will.
revoke all     on table    public.keepalive      from anon, authenticated;
revoke execute on function public.keepalive_ping() from public, anon, authenticated;
grant  execute on function public.keepalive_ping() to service_role;

-- ---------------------------------------------------------------------------
-- PostgREST exposes functions from a cached schema. A fresh function can 404
-- on `/rest/v1/rpc/keepalive_ping` until that cache refreshes; this forces it,
-- so the first workflow run does not have to be the thing that discovers it.
-- ---------------------------------------------------------------------------

notify pgrst, 'reload schema';
