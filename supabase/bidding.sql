-- Real bidding: records the leading bidder, and closes finished auctions.
-- Paste into Supabase > SQL Editor and press Run. Safe to run more than once.

-- 1. Bids now also record who is leading.
create or replace function public.place_bid(p_object text, p_amount numeric)
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
          winner_id = auth.uid(),
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
          winner_id = auth.uid(),
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

-- 2. Anything whose clock has run out becomes Gone. The site calls this
-- whenever pages load, so no timer is needed. Safe to call repeatedly.
create or replace function public.close_expired_auctions() returns void
language sql security definer set search_path = public as $$
  update public.objects
     set status = 'sold'
   where status = 'in_bidding' and ends_at <= now();
$$;
grant execute on function public.close_expired_auctions() to anon, authenticated;
