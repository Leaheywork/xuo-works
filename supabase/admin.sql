-- Admin rights + photo storage. Paste into Supabase > SQL Editor and press Run.
-- Safe to run more than once.

-- 1. Mark who is an admin
alter table public.profiles add column if not exists is_admin boolean not null default false;

create or replace function public.is_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- 2. Only admins can add, change or remove pieces
drop policy if exists "admin insert pieces" on public.objects;
drop policy if exists "admin update pieces" on public.objects;
drop policy if exists "admin delete pieces" on public.objects;
create policy "admin insert pieces" on public.objects
  for insert with check (public.is_admin());
create policy "admin update pieces" on public.objects
  for update using (public.is_admin());
create policy "admin delete pieces" on public.objects
  for delete using (public.is_admin());

-- 3. Photo storage (public to view, admin only to change)
insert into storage.buckets (id, name, public)
values ('objects', 'objects', true)
on conflict (id) do nothing;

drop policy if exists "photos public read" on storage.objects;
drop policy if exists "photos admin insert" on storage.objects;
drop policy if exists "photos admin update" on storage.objects;
drop policy if exists "photos admin delete" on storage.objects;
create policy "photos public read" on storage.objects
  for select using (bucket_id = 'objects');
create policy "photos admin insert" on storage.objects
  for insert with check (bucket_id = 'objects' and public.is_admin());
create policy "photos admin update" on storage.objects
  for update using (bucket_id = 'objects' and public.is_admin());
create policy "photos admin delete" on storage.objects
  for delete using (bucket_id = 'objects' and public.is_admin());

-- 4. Make YOURSELF admin. Change the email to the one you registered with.
update public.profiles
set is_admin = true
where id in (
  select id from auth.users
  where email in ('work@leahey.work', 'work@xuo.works')
);
