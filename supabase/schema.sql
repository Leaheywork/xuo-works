-- XUO.WORKS database: registered users, pieces, bids, and the bidding rules.
-- Paste this whole file into Supabase > SQL Editor and press Run.

-- ---------- Registered users ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "read own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "update own profile" on public.profiles
  for update using (auth.uid() = id);

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Pieces ----------
create table public.objects (
  id text primary key,
  title text not null,
  price numeric not null default 0,
  materials text not null default '',
  dimensions text not null default '',
  weight_kg numeric not null default 0,
  year int not null default 0,
  description text not null default '',
  status text not null default 'sold'
    check (status in ('available', 'in_bidding', 'sold')),
  images text[] not null default '{}',
  current_bid numeric,
  bid_count int not null default 0,
  ends_at timestamptz,
  winner_id uuid references auth.users(id),
  sort_order serial,
  created_at timestamptz not null default now()
);
alter table public.objects enable row level security;
create policy "pieces are public" on public.objects
  for select using (true);

-- ---------- Bids ----------
create table public.bids (
  id bigint generated always as identity primary key,
  object_id text not null references public.objects(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  amount numeric not null,
  created_at timestamptz not null default now()
);
alter table public.bids enable row level security;
create policy "see own bids" on public.bids
  for select using (auth.uid() = user_id);

-- ---------- Bidding rules ----------
-- Minimum raise depends on the current price.
create function public.bid_step(p numeric) returns numeric
language sql immutable as $$
  select case
    when p < 200 then 10
    when p < 1000 then 25
    when p < 5000 then 50
    else 100
  end;
$$;

-- The only way to bid. Checks everything on the server.
--  * must be signed in
--  * first bid on an Available piece must meet the listed price and starts a 24-hour clock
--  * later bids must beat the current bid by the step
--  * a bid in the last 5 minutes adds 5 minutes to the clock
create function public.place_bid(p_object text, p_amount numeric)
returns public.objects
language plpgsql security definer set search_path = public as $$
declare
  o public.objects;
  minimum numeric;
begin
  if auth.uid() is null then
    raise exception 'Please sign in to bid.';
  end if;

  select * into o from public.objects where id = p_object for update;
  if not found then
    raise exception 'Piece not found.';
  end if;

  if o.status = 'sold' then
    raise exception 'This piece is gone.';
  end if;

  if o.status = 'available' then
    if p_amount < o.price then
      raise exception 'The first bid must be at least the listed price.';
    end if;
    update public.objects
      set status = 'in_bidding',
          current_bid = p_amount,
          bid_count = 1,
          ends_at = now() + interval '24 hours'
      where id = p_object
      returning * into o;
  else
    if o.ends_at <= now() then
      raise exception 'Bidding on this piece has ended.';
    end if;
    minimum := o.current_bid + public.bid_step(o.current_bid);
    if p_amount < minimum then
      raise exception 'The minimum bid is %.', minimum;
    end if;
    update public.objects
      set current_bid = p_amount,
          bid_count = bid_count + 1,
          ends_at = case
            when ends_at - now() < interval '5 minutes'
              then ends_at + interval '5 minutes'
            else ends_at
          end
      where id = p_object
      returning * into o;
  end if;

  insert into public.bids (object_id, user_id, amount)
  values (p_object, auth.uid(), p_amount);

  return o;
end;
$$;

revoke execute on function public.place_bid(text, numeric) from public, anon;
grant execute on function public.place_bid(text, numeric) to authenticated;
