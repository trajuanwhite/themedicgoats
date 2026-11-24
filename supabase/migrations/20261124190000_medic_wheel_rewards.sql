alter table public.medic_wheel_players
 add column shield_spins integer not null default 0,
 add column turn_skips integer not null default 0;
alter table public.medic_wheel_rooms add column round_reward text;

-- Award once on entering round_end, regardless of how the final letters were revealed.
create function public.medic_wheel_apply_rewards() returns trigger
language plpgsql set search_path to public, pg_temp as $$
declare reward integer;
begin
 if new.phase='round_end' and old.phase<>'round_end' and new.winner_id is not null then
  reward:=floor(random()*3)::integer;
  if reward=0 then
   update public.medic_wheel_players set turn_skips=turn_skips+1 where id=new.winner_id;
   new.round_reward:='Skip a Turn';
  elsif reward=1 then
   update public.medic_wheel_players set shield_spins=shield_spins+3 where id=new.winner_id;
   new.round_reward:='Bankruptcy Protection (3 spins)';
  else
   update public.medic_wheel_players set score=score+500 where id=new.winner_id;
   new.round_reward:='$500 Bonus';
  end if;
 elsif new.phase not in ('round_end','game_end') then
  new.round_reward:=null;
 end if;

 if new.status='playing' and old.status='playing'
    and new.current_turn is distinct from old.current_turn
    and new.current_turn is not null and old.current_turn is not null then
  update public.medic_wheel_players set turn_skips=turn_skips-1
   where id=old.current_turn and turn_skips>0;
  if found then
   new.notice:=concat_ws(' ',new.notice,
    (select name from public.medic_wheel_players where id=new.current_turn)||' was skipped.');
   new.current_turn:=public.medic_wheel_next_player(new.pin,new.current_turn);
  end if;
 end if;
 return new;
end;
$$;
revoke execute on function public.medic_wheel_apply_rewards() from public, anon, authenticated;
create trigger medic_wheel_apply_rewards before update on public.medic_wheel_rooms
 for each row execute function public.medic_wheel_apply_rewards();

CREATE OR REPLACE FUNCTION public.medic_wheel_state(p_pin text, p_token uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare r public.medic_wheel_rooms; p public.medic_wheel_players; q public.medic_wheel_puzzles; plist jsonb; masked text=''; letter text; i int; active boolean; winname text; turnname text; myid uuid; ishost boolean;
begin
 select * into r from public.medic_wheel_rooms where pin=p_pin and created_at>now()-interval '24 hours';
 if not found then raise exception 'Room not found or expired';end if;
 ishost= coalesce(r.host_token=p_token,false);
 select * into p from public.medic_wheel_players where room_pin=p_pin and token=p_token;
 if not ishost and not found then raise exception 'Invalid room session';end if;
 myid=p.id;
 if r.status='playing' and r.decision_deadline<=clock_timestamp() then
  update public.medic_wheel_rooms set
   phase='await_spin',
   current_turn=public.medic_wheel_next_player(p_pin,current_turn),
   prize=0,
   notice=coalesce((select name from public.medic_wheel_players where id=r.current_turn),'Player')||' ran out of time. Next turn!',
   decision_deadline=clock_timestamp()+interval '30 seconds'
  where pin=p_pin and status='playing' and decision_deadline=r.decision_deadline;
  select * into r from public.medic_wheel_rooms where pin=p_pin;
 end if;
 select * into q from public.medic_wheel_puzzles where id=r.puzzle_ids[r.round_no];
 if q.id is null then raise exception 'Puzzle not found';end if;
 for i in 1..length(q.answer) loop
  letter:=substr(q.answer,i,1);
  if letter !~ '[A-Z]' or position(letter in r.guessed)>0 or r.phase in ('round_end','game_end')
  then masked:=masked||letter;
  else masked:=masked||'_';end if;
 end loop;
 select coalesce(jsonb_agg(jsonb_build_object('id',x.id,'name',x.name,'score',x.score,'bank',x.round_bank,'shieldSpins',x.shield_spins,'turnSkips',x.turn_skips) order by x.score desc,x.round_bank desc,x.joined_at),'[]'::jsonb)
 into plist from public.medic_wheel_players x where x.room_pin=p_pin;
 select name into turnname from public.medic_wheel_players where id=r.current_turn;
 select name into winname from public.medic_wheel_players where id=r.winner_id;
 active:=r.spun_at is not null and now()<r.spun_at+interval '4 seconds';
 return jsonb_build_object('pin',r.pin,'status',r.status,'phase',r.phase,'round',r.round_no,'roundCount',cardinality(r.puzzle_ids),
 'category',q.category,'masked',masked,'guessed',r.guessed,
 'answer',case when r.phase in ('round_end','game_end') then q.answer else null end,
 'explanation',case when r.phase in ('round_end','game_end') then q.explanation else null end,
 'currentTurn',r.current_turn,'turnName',turnname,'players',plist,
 'playerId',myid,'isHost',ishost,'spinId',r.spin_id,'spinIndex',r.spin_index,
 'spinResult',r.spin_result,'spinning',active,
 'decisionMs',case when r.decision_deadline is not null then
   greatest(0,ceil(extract(epoch from r.decision_deadline-clock_timestamp())*1000)) end,
 'roundReward',r.round_reward,'prize',r.prize,'winnerName',winname,'notice',r.notice);
end $function$
;
CREATE OR REPLACE FUNCTION public.medic_wheel_action(p_pin text, p_token uuid, p_action text, p_value text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare r public.medic_wheel_rooms;p public.medic_wheel_players;q public.medic_wheel_puzzles;n int;cost int;result text;ch text;matches int;guess text;all_visible boolean;newturn uuid;w int;bank int;protected_spin boolean;
begin
 select * into r from public.medic_wheel_rooms where pin=p_pin and created_at>now()-interval '24 hours' for update;
 if not found then raise exception 'Room not found';end if;
 select * into p from public.medic_wheel_players where room_pin=p_pin and token=p_token for update;
 select * into q from public.medic_wheel_puzzles where id=r.puzzle_ids[r.round_no];
 if p_action in ('start','next','replay') then
  if p_token is distinct from r.host_token then raise exception 'Only the host can control rounds';end if;
  if p_action='start' then
   if r.status<>'lobby' then raise exception 'Game already started';end if;
   if not exists(select 1 from public.medic_wheel_players where room_pin=p_pin) then raise exception 'At least one player must join';end if;
   update public.medic_wheel_rooms set status='playing',phase='await_spin',round_no=1,guessed='',spin_id=0,spin_index=null,spin_result=null,spun_at=null,prize=0,winner_id=null,notice='First player, spin the wheel!',current_turn=(select id from public.medic_wheel_players where room_pin=p_pin order by joined_at,id limit 1) where pin=p_pin;
  elsif p_action='next' then
   if r.phase<>'round_end' then raise exception 'Finish the round first';end if;
   if r.round_no>=cardinality(r.puzzle_ids) then
    update public.medic_wheel_rooms set phase='game_end',status='ended',notice='Game complete!' where pin=p_pin;
   else
    update public.medic_wheel_players set round_bank=0 where room_pin=p_pin;
    update public.medic_wheel_rooms set round_no=r.round_no+1,phase='await_spin',guessed='',prize=0,spin_index=null,spin_result=null,spun_at=null,winner_id=null,notice='New puzzle!',current_turn=public.medic_wheel_next_player(p_pin,r.current_turn) where pin=p_pin;
   end if;
  elsif p_action='replay' then
   update public.medic_wheel_players set score=0,round_bank=0,shield_spins=0,turn_skips=0 where room_pin=p_pin;
   update public.medic_wheel_rooms set status='lobby',phase='await_spin',round_no=1,guessed='',spin_id=0,spin_index=null,spin_result=null,spun_at=null,prize=0,winner_id=null,notice='Ready for another game.',puzzle_ids=(select array_agg(id) from (select id from public.medic_wheel_puzzles order by random() limit 10)x),current_turn=(select id from public.medic_wheel_players where room_pin=p_pin order by joined_at,id limit 1) where pin=p_pin;
  end if;
  update public.medic_wheel_rooms set decision_deadline=
   case when status='playing' then clock_timestamp()+interval '30 seconds' end
   where pin=p_pin;
  return public.medic_wheel_state(p_pin,p_token);
 end if;
 if p.id is null then raise exception 'Join as a player first';end if;
 if r.status<>'playing' or r.phase in ('round_end','game_end') then raise exception 'Round is not active';end if;
 if r.decision_deadline<=clock_timestamp() then
  return public.medic_wheel_state(p_pin,p_token);
 end if;
 if r.current_turn<>p.id then raise exception 'Wait for your turn';end if;
 if r.spun_at is not null and now()<r.spun_at+interval '4 seconds' then raise exception 'Wheel is still spinning';end if;
 if p_action='spin' then
  if r.phase<>'await_spin' then raise exception 'Select your consonant first';end if;
  n:=floor(random()*8)::int;
  result:=(array['500','650','800','350','BANKRUPT','450','900','LOSE TURN'])[n+1];
  protected_spin:=p.shield_spins>0;
  if protected_spin then
   update public.medic_wheel_players set shield_spins=shield_spins-1 where id=p.id;
  end if;
  if result='BANKRUPT' and protected_spin then
   update public.medic_wheel_rooms set phase='await_spin',prize=0,
    notice=p.name||' used Bankruptcy Protection and kept the turn and round bank.' where pin=p_pin;
  elsif result='BANKRUPT' then
   update public.medic_wheel_players set round_bank=0 where id=p.id;
   newturn:=public.medic_wheel_next_player(p_pin,p.id);
   update public.medic_wheel_rooms set phase='await_spin',current_turn=newturn,notice=p.name||' hit BANKRUPT!',prize=0 where pin=p_pin;
  elsif result='LOSE TURN' then
   newturn:=public.medic_wheel_next_player(p_pin,p.id);
   update public.medic_wheel_rooms set phase='await_spin',current_turn=newturn,notice=p.name||' lost a turn.',prize=0 where pin=p_pin;
  else
   update public.medic_wheel_rooms set phase='choose_consonant',notice=p.name||' spun $'||result||'. Guess a consonant.',prize=result::int where pin=p_pin;
  end if;
  update public.medic_wheel_rooms set spin_id=spin_id+1,spin_index=n,spin_result=result,spun_at=now() where pin=p_pin;
 elsif p_action in ('consonant','vowel') then
  ch:=upper(trim(coalesce(p_value,'')));
  if ch !~ '^[A-Z]$' then raise exception 'Choose one letter';end if;
  if position(ch in r.guessed)>0 then raise exception 'That letter was already guessed';end if;
  if p_action='consonant' then
   if r.phase<>'choose_consonant' or ch in ('A','E','I','O','U') then raise exception 'Spin and choose a consonant';end if;
  else
   if r.phase not in ('await_spin','choose_consonant') or ch not in ('A','E','I','O','U') then raise exception 'Choose a vowel';end if;
   if p.round_bank<250 then raise exception 'You need $250 to buy a vowel';end if;
   update public.medic_wheel_players set round_bank=round_bank-250 where id=p.id;
  end if;
  select count(*) into matches from regexp_matches(q.answer,ch,'g');
  if p_action='consonant' and matches>0 then
   update public.medic_wheel_players set round_bank=round_bank+matches*r.prize where id=p.id;
  end if;
  update public.medic_wheel_rooms set guessed=r.guessed||ch,phase='await_spin',prize=0,notice=case when matches>0 then p.name||' found '||matches||' '||ch||'.' else 'No '||ch||'. Next player!' end where pin=p_pin;
  guess:=r.guessed||ch;
  all_visible:=true;
  for n in 1..length(q.answer) loop
   if substr(q.answer,n,1) ~ '[A-Z]' and position(substr(q.answer,n,1) in guess)=0 then all_visible:=false;exit;end if;
  end loop;
  if all_visible then
   update public.medic_wheel_players set score=score+round_bank,round_bank=0 where id=p.id;
   update public.medic_wheel_rooms set phase='round_end',winner_id=p.id,notice=p.name||' solved the puzzle!' where pin=p_pin;
  elsif matches=0 then
   update public.medic_wheel_rooms set current_turn=public.medic_wheel_next_player(p_pin,p.id) where pin=p_pin;
  end if;
 elsif p_action='solve' then
  guess:=regexp_replace(upper(coalesce(p_value,'')),'[^A-Z]','','g');
  if length(guess)<2 then raise exception 'Enter a complete solution';end if;
  if guess=regexp_replace(q.answer,'[^A-Z]','','g') then
   update public.medic_wheel_players set score=score+round_bank,round_bank=0 where id=p.id;
   update public.medic_wheel_rooms set phase='round_end',winner_id=p.id,notice=p.name||' solved the puzzle!' where pin=p_pin;
  else
   update public.medic_wheel_players set round_bank=greatest(0,round_bank-250) where id=p.id;
   update public.medic_wheel_rooms set phase='await_spin',prize=0,current_turn=public.medic_wheel_next_player(p_pin,p.id),notice=p.name||' guessed incorrectly. Next turn!' where pin=p_pin;
  end if;
 else raise exception 'Unknown action';end if;
 update public.medic_wheel_rooms set decision_deadline=
  case when phase in ('await_spin','choose_consonant') then
   case when p_action='spin' then spun_at+interval '34 seconds'
        else clock_timestamp()+interval '30 seconds' end
  end where pin=p_pin;
 return public.medic_wheel_state(p_pin,p_token);
end $function$
;
