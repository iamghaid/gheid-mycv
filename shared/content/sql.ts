/**
 * Database schema (PostgreSQL). Idempotent — safe to run on every admin start.
 *
 * - `content_items`  one row per collection record (projects, skills, …). The record
 *                    itself is JSONB validated by schema.ts; ordering and publishing
 *                    are real columns so they can be queried and reordered cheaply.
 * - `singletons`     profile and resume.
 * - `media`          every uploaded file, de-duplicated by SHA-256.
 * - `content_meta`   a version counter bumped on every change; the public site keys
 *                    its cache on it, so a save is visible on the very next request.
 * - `login_attempts` failed logins, for rate limiting.
 * - `content_revisions` the previous state of a record, copied before every change
 *                    (last 30 per record). Deleted items live here as the Trash.
 *                    The public site never reads this table.
 */
export const SCHEMA_SQL = `
create extension if not exists pgcrypto;

create table if not exists content_items (
    id uuid primary key default gen_random_uuid(),
    collection text not null,
    data jsonb not null,
    sort_order integer not null default 0,
    published boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists content_items_collection_order on content_items (collection, sort_order);

create table if not exists singletons (
    key text primary key,
    data jsonb not null,
    updated_at timestamptz not null default now()
);

create table if not exists media (
    id uuid primary key default gen_random_uuid(),
    url text not null unique,
    pathname text not null default '',
    file_name text not null default '',
    content_type text not null default '',
    size bigint not null default 0,
    sha256 text,
    source text not null default 'upload',
    created_at timestamptz not null default now()
);
create unique index if not exists media_sha256 on media (sha256) where sha256 is not null;

create table if not exists content_meta (
    key text primary key,
    value bigint not null
);
insert into content_meta (key, value) values ('version', 1) on conflict (key) do nothing;

create table if not exists login_attempts (
    id bigserial primary key,
    ip text not null,
    at timestamptz not null default now()
);
create index if not exists login_attempts_ip_at on login_attempts (ip, at);

create table if not exists content_revisions (
    id bigserial primary key,
    target_kind text not null check (target_kind in ('item', 'singleton')),
    target_id text not null,
    collection text,
    data jsonb not null,
    published boolean,
    sort_order integer,
    action text not null check (action in ('update', 'delete')),
    created_at timestamptz not null default now()
);
create index if not exists content_revisions_target on content_revisions (target_kind, target_id, id desc);
create index if not exists content_revisions_deleted on content_revisions (created_at) where action = 'delete';

-- Public chatbot rate limits (written only by the portfolio's /api/chat).
create table if not exists chat_rate_limits (
    bucket text primary key,
    count integer not null default 0,
    expires_at timestamptz not null
);
create index if not exists chat_rate_limits_expires on chat_rate_limits (expires_at);
`;
