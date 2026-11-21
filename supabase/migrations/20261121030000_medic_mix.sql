create schema medic_mix;
revoke all on schema medic_mix from public;
create table medic_mix.rooms (
  pin text primary key,
  host uuid not null,
  expires_at timestamptz not null default now() + interval '8 hours',
  round integer not null default 0,
  answer text,
  scramble text,
  winner text
);
create table medic_mix.players (
  pin text references medic_mix.rooms on delete cascade,
  token uuid default gen_random_uuid(),
  name text not null,
  position bigint generated always as identity,
  primary key (pin, token)
);

create function public.medic_mix_game(
  action text, code text default null, player_token uuid default null,
  value text default null, round_number integer default null
) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  r medic_mix.rooms%rowtype;
  player medic_mix.players%rowtype;
  term text;
  mixed text;
  token_value uuid;
  outcome text;
  terms text[] := array[
    'APNEA','BRADYCARDIA','CAPNOGRAPHY','DEFIBRILLATION','DYSPNEA',
    'EDEMA','EMBOLISM','EPINEPHRINE','FIBRILLATION','HEMATOMA',
    'HEMORRHAGE','HYPOGLYCEMIA','HYPOXEMIA','INTUBATION','ISCHEMIA',
    'LARYNX','NALOXONE','NEBULIZER','OXYGENATION','PALPATION',
    'PERFUSION','PNEUMOTHORAX','PULSELESS','RESUSCITATION','SEPSIS',
    'STRIDOR','SYNCOPE','TACHYCARDIA','TRACHEA','VENTILATION',
    'BRONCHOSPASM','CYANOSIS','DIASTOLE','GLUCAGON','HYPERCAPNIA',
    'LARYNGOSCOPY','MELENA','MYOCARDIUM','OCCLUSION','PERICARDIUM',
    'RIGIDITY','SUCTION','SYSTOLE','TOURNIQUET','URTICARIA'
  ];
begin
  if action in ('create','join') and (value is null or char_length(trim(value)) not between 2 and 24) then
    raise exception 'Enter a name with 2–24 characters.';
  end if;
  if action = 'create' then
    delete from medic_mix.rooms where expires_at <= now();
    token_value := gen_random_uuid();
    loop
      code := (100000 + floor(random()*900000)::int)::text;
      insert into medic_mix.rooms(pin,host) values(code,token_value)
        on conflict do nothing returning * into r;
      exit when found;
    end loop;
    insert into medic_mix.players(pin,token,name) values(code,token_value,trim(value)) returning * into player;
  else
    if action = 'state' then
      select * into r from medic_mix.rooms where pin=code and expires_at > now();
    else
      select * into r from medic_mix.rooms where pin=code and expires_at > now() for update;
    end if;
    if not found then raise exception 'Room not found. Check the code or start a new room.'; end if;

    if action = 'join' then
      if (select count(*) from medic_mix.players p where p.pin=code)>=24 then
        raise exception 'This room is full.';
      end if;
      if exists (select 1 from medic_mix.players p where p.pin=code and lower(p.name)=lower(trim(value))) then
        raise exception 'That name is already in use.';
      end if;
      insert into medic_mix.players(pin,name) values(code,trim(value)) returning * into player;
      token_value := player.token;
    else
      select * into player from medic_mix.players p where p.pin=code and p.token=player_token;
      if not found then raise exception 'Join this room before playing.'; end if;
      case action
        when 'state' then null;
        when 'start' then
          if player.token <> r.host then raise exception 'Only the host can start a round.'; end if;
          if r.round > 0 and r.winner is null then raise exception 'A round is already in progress.'; end if;
          if (select count(*) from medic_mix.players p where p.pin=code)<2 then
            raise exception 'At least two players are needed.';
          end if;
          select word into term from unnest(terms) word where word is distinct from r.answer order by random() limit 1;
          loop
            select string_agg(substr(term,n,1),'' order by random()) into mixed
              from generate_series(1,length(term)) n;
            exit when mixed<>term;
          end loop;
          update medic_mix.rooms set round=r.round+1, answer=term, scramble=mixed, winner=null
            where pin=code returning * into r;
        when 'guess' then
          if r.round=0 or r.winner is not null or round_number is distinct from r.round then
            outcome := 'closed';
          elsif char_length(value) <= 40 and upper(trim(value))=r.answer then
            update medic_mix.rooms set winner=player.name where pin=code returning * into r;
            outcome := 'correct';
          else
            outcome := 'incorrect';
          end if;
        else raise exception 'Unknown game action.';
      end case;
    end if;
  end if;
  return jsonb_build_object(
    'code',r.pin,'token',token_value,'host',player.token=r.host,'round',r.round,
    'scramble',r.scramble,'winner',r.winner,'answer',case when r.winner is not null then r.answer end,
    'outcome',outcome,'players',(select jsonb_agg(p.name order by p.position) from medic_mix.players p where p.pin=r.pin)
  );
end;
$$;
revoke all on function public.medic_mix_game(text,text,uuid,text,integer) from public;
grant execute on function public.medic_mix_game(text,text,uuid,text,integer) to anon, authenticated;
