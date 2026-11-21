alter table medic_mix.rooms add column round_deadline timestamptz;
update medic_mix.rooms set round_deadline=clock_timestamp()+interval '30 seconds' where round>0 and winner is null;

create or replace function public.medic_mix_game(
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
  remaining_ms integer;
  timed_out boolean;
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
          if r.round > 0 and r.winner is null and r.round_deadline > clock_timestamp() then raise exception 'A round is already in progress.'; end if;
          if (select count(*) from medic_mix.players p where p.pin=code)<2 then
            raise exception 'At least two players are needed.';
          end if;
          select word into term from unnest(terms) word where word is distinct from r.answer order by random() limit 1;
          loop
            select string_agg(substr(term,n,1),'' order by random()) into mixed
              from generate_series(1,length(term)) n;
            exit when mixed<>term;
          end loop;
          update medic_mix.rooms set round=r.round+1, answer=term, scramble=mixed, winner=null, round_deadline=clock_timestamp()+interval '30 seconds'
            where pin=code returning * into r;
        when 'guess' then
          if r.round=0 or r.winner is not null or r.round_deadline is null or r.round_deadline <= clock_timestamp() or round_number is distinct from r.round then
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
  remaining_ms := greatest(0,ceil(extract(epoch from r.round_deadline-clock_timestamp())*1000)::integer);
  timed_out := r.round>0 and r.winner is null and remaining_ms=0;
  return jsonb_build_object(
    'code',r.pin,'token',token_value,'host',player.token=r.host,'round',r.round,
    'scramble',r.scramble,'winner',r.winner,'answer',case when r.winner is not null or timed_out then r.answer end,
    'remainingMs',remaining_ms,'timedOut',timed_out,
    'category',case
      when r.answer in ('APNEA','CAPNOGRAPHY','DYSPNEA','HYPOXEMIA','INTUBATION','LARYNX','NEBULIZER','OXYGENATION','PNEUMOTHORAX','STRIDOR','TRACHEA','VENTILATION','BRONCHOSPASM','CYANOSIS','HYPERCAPNIA','LARYNGOSCOPY','SUCTION') then 'Airway & Breathing'
      when r.answer in ('BRADYCARDIA','DEFIBRILLATION','EMBOLISM','FIBRILLATION','ISCHEMIA','PERFUSION','PULSELESS','RESUSCITATION','SYNCOPE','TACHYCARDIA','DIASTOLE','MYOCARDIUM','OCCLUSION','PERICARDIUM','SYSTOLE') then 'Cardiology & Circulation'
      when r.answer in ('HEMATOMA','HEMORRHAGE','TOURNIQUET') then 'Trauma & Bleeding'
      when r.answer in ('EPINEPHRINE','NALOXONE','GLUCAGON') then 'Medications'
      when r.answer in ('EDEMA','HYPOGLYCEMIA','SEPSIS','MELENA','URTICARIA') then 'Medical Emergencies'
      when r.answer in ('PALPATION','RIGIDITY') then 'Patient Assessment'
    end,
    'outcome',outcome,'players',(select jsonb_agg(p.name order by p.position) from medic_mix.players p where p.pin=r.pin)
  );
end;
$$;
revoke all on function public.medic_mix_game(text,text,uuid,text,integer) from public;
grant execute on function public.medic_mix_game(text,text,uuid,text,integer) to anon, authenticated;
