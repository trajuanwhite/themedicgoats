create table public.medic_crossword_rooms (
 code text primary key,
 created_at timestamptz not null default now(),
 entries jsonb not null,
 players jsonb not null,
 claims jsonb not null default '{}'::jsonb,
 started_at timestamptz,
 ended_at timestamptz
);
alter table public.medic_crossword_rooms enable row level security;
revoke all on public.medic_crossword_rooms from public, anon, authenticated;

create function public.medic_crossword_race(
 p_action text, p_code text default null, p_token uuid default null,
 p_name text default null, p_entries jsonb default null,
 p_word integer default null, p_guess text default null
) returns jsonb
language plpgsql security definer set search_path to public, pg_temp as $$
declare
 room public.medic_crossword_rooms;
 room_code text;
 token uuid;
 player jsonb;
 participant integer;
 outcome text;
begin
 if p_action in ('host','join') and coalesce(char_length(trim(p_name)),0) not between 2 and 24 then
  raise exception 'Enter a name between 2 and 24 characters';
 end if;
 if p_action='host' then
  if jsonb_typeof(p_entries) is distinct from 'array' or jsonb_array_length(p_entries) not between 2 and 10
    or octet_length(p_entries::text)>9000 then raise exception 'Invalid puzzle'; end if;
  if exists(select 1 from jsonb_array_elements(p_entries) e where
   coalesce(e->>'answer','') !~ '^[A-Z]{2,24}$' or coalesce(e->>'d','') not in ('A','D')
   or coalesce(e->>'r','') !~ '^-?[0-9]{1,2}$' or coalesce(e->>'c','') !~ '^-?[0-9]{1,2}$'
   or coalesce(length(e->>'clue'),0) not between 1 and 250) then raise exception 'Invalid crossword entry'; end if;
  token:=gen_random_uuid();
  loop
   room_code:=lpad(floor(random()*1000000)::integer::text,6,'0');
   insert into public.medic_crossword_rooms(code,entries,players)
   values(room_code,p_entries,jsonb_build_array(jsonb_build_object('name',trim(p_name),'token',token)))
   on conflict do nothing returning * into room;
   exit when found;
  end loop;
  participant:=0;
 else
  if p_action='state' then
   select * into room from public.medic_crossword_rooms where code=p_code and created_at>now()-interval '24 hours';
  else
   select * into room from public.medic_crossword_rooms where code=p_code and created_at>now()-interval '24 hours' for update;
  end if;
  if not found then raise exception 'Room not found or expired'; end if;
  if p_action='join' then
   if room.started_at is not null then raise exception 'This race has already started'; end if;
   if jsonb_array_length(room.players)>=6 then raise exception 'This room is full'; end if;
   if exists(select 1 from jsonb_array_elements(room.players) p where lower(p->>'name')=lower(trim(p_name))) then
    raise exception 'That name is already taken';
   end if;
   token:=gen_random_uuid();
   participant:=jsonb_array_length(room.players);
   update public.medic_crossword_rooms set players=players||jsonb_build_array(jsonb_build_object('name',trim(p_name),'token',token))
   where code=p_code returning * into room;
  else
   select (ordinality-1)::integer into participant from jsonb_array_elements(room.players) with ordinality p
   where p.value->>'token'=p_token::text;
   if not found then raise exception 'Invalid room session'; end if;
   if p_action='start' then
    if participant<>0 then raise exception 'Only the host can start'; end if;
    if jsonb_array_length(room.players)<2 then raise exception 'Invite at least one friend'; end if;
    update public.medic_crossword_rooms set started_at=coalesce(started_at,clock_timestamp())
    where code=p_code returning * into room;
   elsif p_action='claim' then
    if room.started_at is null then raise exception 'Wait for the race to start'; end if;
    if p_word is null or p_word<0 or p_word>=jsonb_array_length(room.entries) then raise exception 'Invalid clue'; end if;
    if room.claims ? p_word::text or room.ended_at is not null then
     outcome:='taken';
    elsif upper(trim(coalesce(p_guess,'')))=room.entries->p_word->>'answer' then
     room.claims:=room.claims||jsonb_build_object(p_word::text,participant);
     update public.medic_crossword_rooms set claims=room.claims,
      ended_at=case when (select count(*) from jsonb_object_keys(room.claims))=jsonb_array_length(room.entries) then clock_timestamp() end
     where code=p_code returning * into room;
     outcome:='correct';
    else
     outcome:='incorrect';
    end if;
   elsif p_action is distinct from 'state' then
    raise exception 'Unknown action';
   end if;
  end if;
 end if;
 return jsonb_build_object('code',room.code,'token',token,'me',participant,
  'players',(select jsonb_agg(p-'token' order by n) from jsonb_array_elements(room.players) with ordinality x(p,n)),
  'started',room.started_at is not null,'ended',room.ended_at is not null,
  'elapsedMs',case when room.started_at is not null then floor(extract(epoch from (coalesce(room.ended_at,clock_timestamp())-room.started_at))*1000) else 0 end,
  'entries',case when room.started_at is not null then (
   select jsonb_agg((e-'answer')||jsonb_build_object('length',length(e->>'answer'),
    'answer',case when room.claims ? ((n-1)::text) then e->>'answer' end,
    'owner',room.claims->((n-1)::text)) order by n)
   from jsonb_array_elements(room.entries) with ordinality x(e,n)) end,
  'outcome',outcome);
end;
$$;
revoke execute on function public.medic_crossword_race(text,text,uuid,text,jsonb,integer,text) from public;
grant execute on function public.medic_crossword_race(text,text,uuid,text,jsonb,integer,text) to anon, authenticated;
