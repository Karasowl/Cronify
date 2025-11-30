-- Reset Schema (Optional, but recommended if you have messy tables)
-- drop table if exists habit_logs;
-- drop table if exists habits;
-- drop table if exists partnerships;

-- 1. Habits Table
create table if not exists habits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  title text not null,
  description text,
  frequency jsonb default '{"type": "daily"}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table habits enable row level security;

-- Policy 1: Owner access
create policy "Users can view their own habits" on habits
  for select using (auth.uid() = user_id);

create policy "Users can insert their own habits" on habits
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own habits" on habits
  for update using (auth.uid() = user_id);

create policy "Users can delete their own habits" on habits
  for delete using (auth.uid() = user_id);

-- 2. Partnerships Table
create table if not exists partnerships (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null, -- The inviter
  partner_email text not null, -- The invitee
  status text check (status in ('pending', 'active')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table partnerships enable row level security;

-- Policy 2a: Inviter can manage
create policy "Users can manage their partnerships" on partnerships
  for all using (auth.uid() = user_id);

-- Policy 2b: Partner can view (FIXED: using auth.jwt() ->> 'email')
create policy "Partners can view their partnerships" on partnerships
  for select using (
    partner_email = (auth.jwt() ->> 'email')
  );

-- 3. Habit Logs Table
create table if not exists habit_logs (
  id uuid default gen_random_uuid() primary key,
  habit_id uuid references habits(id) on delete cascade not null,
  date date not null,
  status text check (status in ('completed', 'failed', 'skipped')) not null,
  reason text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(habit_id, date)
);

alter table habit_logs enable row level security;

-- Policy 3a: Owner access
create policy "Users can view their own logs" on habit_logs
  for select using (
    exists ( select 1 from habits where id = habit_logs.habit_id and user_id = auth.uid() )
  );

create policy "Users can insert their own logs" on habit_logs
  for insert with check (
    exists ( select 1 from habits where id = habit_logs.habit_id and user_id = auth.uid() )
  );

create policy "Users can update their own logs" on habit_logs
  for update using (
    exists ( select 1 from habits where id = habit_logs.habit_id and user_id = auth.uid() )
  );

-- 4. Partner Access Policies (FIXED: using auth.jwt() ->> 'email')

-- Allow partners to view habits
create policy "Partners can view habits" on habits
  for select using (
    exists (
      select 1 from partnerships 
      where user_id = habits.user_id 
      and partner_email = (auth.jwt() ->> 'email')
      and status = 'active'
    )
  );

-- Allow partners to view logs
create policy "Partners can view logs" on habit_logs
  for select using (
    exists (
      select 1 from habits
      join partnerships on partnerships.user_id = habits.user_id
      where habits.id = habit_logs.habit_id
      and partnerships.partner_email = (auth.jwt() ->> 'email')
      and partnerships.status = 'active'
    )
  );
