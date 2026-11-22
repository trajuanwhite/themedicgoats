create schema medic_goats_ecg_feedback;
revoke all on schema medic_goats_ecg_feedback from public;

create table medic_goats_ecg_feedback.recordings (
  id text primary key
);

insert into medic_goats_ecg_feedback.recordings (id) values
  ('ptbxl-00001'),
  ('ptbxl-00002'),
  ('ptbxl-00003'),
  ('ptbxl-00004'),
  ('ptbxl-15130'),
  ('ptbxl-11353'),
  ('ptbxl-19269'),
  ('ptbxl-02681'),
  ('ptbxl-18506'),
  ('ptbxl-06997'),
  ('ptbxl-14730'),
  ('ptbxl-07304'),
  ('ptbxl-21632'),
  ('ptbxl-07960'),
  ('ptbxl-00959'),
  ('ptbxl-07688'),
  ('ptbxl-13238'),
  ('ptbxl-02633'),
  ('ptbxl-02181'),
  ('ptbxl-02032'),
  ('ptbxl-02125'),
  ('ptbxl-02430'),
  ('ptbxl-18035'),
  ('ptbxl-18278'),
  ('ptbxl-18458'),
  ('ptbxl-13158'),
  ('ptbxl-02805'),
  ('ptbxl-01993'),
  ('ptbxl-05786'),
  ('ptbxl-13102'),
  ('sph-A07802'),
  ('sph-A02868'),
  ('sph-A08465'),
  ('sph-A00598'),
  ('sph-A10453'),
  ('sph-A13641'),
  ('sph-A21880'),
  ('sph-A13780'),
  ('sph-A20682'),
  ('sph-A01350'),
  ('sph-A23013'),
  ('sph-A24356'),
  ('sph-A17439'),
  ('sph-A09204'),
  ('sph-A10158'),
  ('sph-A25353'),
  ('sph-A24295'),
  ('sph-A06017'),
  ('sph-A09492'),
  ('sph-A18377'),
  ('sph-A23247'),
  ('sph-A15066'),
  ('sph-A09221'),
  ('sph-A19062'),
  ('sph-A24957'),
  ('acs-00810'),
  ('acs-03034'),
  ('acs-02404'),
  ('acs-05624'),
  ('acs-19446'),
  ('acs-00778'),
  ('acs-02484'),
  ('acs-13809'),
  ('acs-00808'),
  ('acs-16741'),
  ('acs-00968'),
  ('acs-13797'),
  ('acs-00876'),
  ('acs-00944'),
  ('acs-08182'),
  ('acs-18093'),
  ('acs-03885'),
  ('acs-17579'),
  ('acs-08059'),
  ('acs-11710'),
  ('acs-19609'),
  ('acs-11797'),
  ('acs-08720');

create table medic_goats_ecg_feedback.ratings (
  recording_id text not null references medic_goats_ecg_feedback.recordings (id),
  browser_id uuid not null,
  verdict text not null check (verdict in ('accurate', 'flag')),
  reason text check (reason in ('interpretation', 'measurement', 'waveform', 'other')),
  note text check (char_length(note) <= 300),
  updated_at timestamptz not null default now(),
  primary key (recording_id, browser_id),
  check ((verdict = 'accurate' and reason is null and note is null)
      or (verdict = 'flag' and reason is not null))
);

alter table medic_goats_ecg_feedback.recordings enable row level security;
alter table medic_goats_ecg_feedback.ratings enable row level security;

create function public.medic_goats_rate_ecg(
  p_recording_id text, p_browser_id uuid, p_verdict text, p_reason text, p_note text
) returns void
language sql security definer set search_path = ''
as $$
  insert into medic_goats_ecg_feedback.ratings as rating
    (recording_id, browser_id, verdict, reason, note)
  values (p_recording_id, p_browser_id, p_verdict, p_reason, nullif(btrim(p_note), ''))
  on conflict (recording_id, browser_id) do update
  set verdict = excluded.verdict, reason = excluded.reason, note = excluded.note, updated_at = now()
  where (rating.verdict, rating.reason, rating.note)
    is distinct from (excluded.verdict, excluded.reason, excluded.note);
$$;

revoke all on function public.medic_goats_rate_ecg(text, uuid, text, text, text)
  from public, anon, authenticated;
grant execute on function public.medic_goats_rate_ecg(text, uuid, text, text, text)
  to anon, authenticated;

create view medic_goats_ecg_feedback.review_queue as
select recording_id,
  count(*) as ratings,
  count(*) filter (where verdict = 'accurate') as accurate_votes,
  count(*) filter (where verdict = 'flag') as flags,
  count(*) filter (where verdict = 'flag') >= 3 as needs_review,
  max(updated_at) as last_feedback_at
from medic_goats_ecg_feedback.ratings
group by recording_id;
