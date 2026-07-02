-- Condition enum
create type condition as enum ('clean', 'light', 'moderate', 'heavy', 'unknown');

-- Beaches
create table beaches (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  lat                 float8 not null,
  lng                 float8 not null,
  country             text not null default '',
  satellite_condition condition,
  current_condition   condition not null default 'unknown',
  last_updated        timestamptz
);

-- Reports
create table reports (
  id         uuid primary key default gen_random_uuid(),
  beach_id   uuid not null references beaches(id) on delete cascade,
  condition  condition not null,
  photo_url  text,
  note       text,
  created_at timestamptz not null default now(),
  user_id    uuid
);

-- Waitlist
create table waitlist (
  id         uuid primary key default gen_random_uuid(),
  email      text unique not null,
  created_at timestamptz not null default now()
);

-- Indexes
create index reports_beach_created on reports(beach_id, created_at desc);

-- RLS
alter table beaches  enable row level security;
alter table reports  enable row level security;
alter table waitlist enable row level security;

create policy "public read beaches"  on beaches  for select using (true);
create policy "public read reports"  on reports  for select using (true);
create policy "public insert reports" on reports for insert with check (true);
create policy "public insert waitlist" on waitlist for insert with check (true);

-- derive_condition: weighted vote over last 24h, fallback to satellite
create or replace function derive_condition(p_beach_id uuid)
returns condition
language plpgsql stable
as $$
declare
  v_result      condition;
  v_clean       float8 := 0;
  v_light       float8 := 0;
  v_moderate    float8 := 0;
  v_heavy       float8 := 0;
  v_total       float8 := 0;
  v_sat         condition;
  r             record;
  v_age_hours   float8;
  v_weight      float8;
begin
  for r in
    select condition, created_at
    from reports
    where beach_id = p_beach_id
      and created_at >= now() - interval '24 hours'
    order by created_at desc
  loop
    v_age_hours := extract(epoch from (now() - r.created_at)) / 3600.0;
    v_weight    := greatest(0.05, 1.0 - 0.15 * v_age_hours);
    v_total     := v_total + v_weight;
    case r.condition
      when 'clean'    then v_clean    := v_clean    + v_weight;
      when 'light'    then v_light    := v_light    + v_weight;
      when 'moderate' then v_moderate := v_moderate + v_weight;
      when 'heavy'    then v_heavy    := v_heavy    + v_weight;
      else null;
    end case;
  end loop;

  if v_total = 0 then
    select satellite_condition into v_sat from beaches where id = p_beach_id;
    return coalesce(v_sat, 'unknown');
  end if;

  -- pick highest weighted condition
  if v_heavy >= v_moderate and v_heavy >= v_light and v_heavy >= v_clean then
    return 'heavy';
  elsif v_moderate >= v_light and v_moderate >= v_clean then
    return 'moderate';
  elsif v_light >= v_clean then
    return 'light';
  else
    return 'clean';
  end if;
end;
$$;

-- Trigger: refresh current_condition + last_updated on new report
create or replace function refresh_beach_condition()
returns trigger language plpgsql as $$
begin
  update beaches
  set current_condition = derive_condition(new.beach_id),
      last_updated      = now()
  where id = new.beach_id;
  return new;
end;
$$;

create trigger trg_refresh_condition
after insert on reports
for each row execute function refresh_beach_condition();
