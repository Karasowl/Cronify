-- Habits Table
create table habits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  title text not null,
  description text,
  frequency jsonb default '{"type": "daily"}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table habits enable row level security;

create policy "Users can view their own habits" on habits
  for select using (auth.uid() = user_id);

create policy "Users can insert their own habits" on habits
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own habits" on habits
  for update using (auth.uid() = user_id);

create policy "Users can delete their own habits" on habits
  for delete using (auth.uid() = user_id);

-- Habit Logs Table
create table habit_logs (
  id uuid default gen_random_uuid() primary key,
  habit_id uuid references habits(id) on delete cascade not null,
  date date not null,
  status text check (status in ('completed', 'failed', 'skipped')) not null,
  reason text, -- Optional reason for failure/skip
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(habit_id, date)
);

alter table habit_logs enable row level security;

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

-- Partnerships Table (Shared View)
create table partnerships (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null, -- The user sharing their data
  partner_email text not null, -- The email of the person viewing
  status text check (status in ('pending', 'active')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table partnerships enable row level security;

create policy "Users can manage their partnerships" on partnerships
  for all using (auth.uid() = user_id);

-- Allow partners to view habits if partnership is active
create policy "Partners can view habits" on habits
  for select using (
    exists (
      select 1 from partnerships 
      where user_id = habits.user_id 
      and partner_email = (select email from auth.users where id = auth.uid())
      and status = 'active'
    )
  );

-- Allow partners to view logs if partnership is active
create policy "Partners can view logs" on habit_logs
  for select using (
    exists (
      select 1 from habits
      join partnerships on partnerships.user_id = habits.user_id
      where habits.id = habit_logs.habit_id
      and partnerships.partner_email = (select email from auth.users where id = auth.uid())
      and partnerships.status = 'active'
    )
  );
