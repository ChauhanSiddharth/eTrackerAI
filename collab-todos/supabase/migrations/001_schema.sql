-- ============================================================
-- Collaborative Todos – full schema + RLS
-- ============================================================

-- ==================== ENUMS ====================
create type connection_status as enum ('pending', 'accepted', 'rejected');
create type member_role       as enum ('owner', 'editor');

-- ==================== TABLES ====================

create table profiles (
  id         uuid primary key references auth.users on delete cascade,
  username   text unique not null,
  created_at timestamptz default now()
);

create table connections (
  id         uuid primary key default gen_random_uuid(),
  requester  uuid not null references profiles(id) on delete cascade,
  addressee  uuid not null references profiles(id) on delete cascade,
  status     connection_status not null default 'pending',
  created_at timestamptz default now(),
  unique (requester, addressee)
);

create table todo_lists (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  owner      uuid not null references profiles(id) on delete cascade,
  created_at timestamptz default now()
);

create table list_members (
  list_id    uuid not null references todo_lists(id) on delete cascade,
  user_id    uuid not null references profiles(id) on delete cascade,
  role       member_role not null default 'editor',
  created_at timestamptz default now(),
  primary key (list_id, user_id)
);

create table todos (
  id         uuid primary key default gen_random_uuid(),
  list_id    uuid not null references todo_lists(id) on delete cascade,
  title      text not null,
  is_done    boolean not null default false,
  created_by uuid not null default auth.uid() references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ==================== ENABLE RLS ====================

alter table profiles enable row level security;
alter table connections enable row level security;
alter table todo_lists enable row level security;
alter table list_members enable row level security;
alter table todos enable row level security;

-- ==================== RLS POLICIES ====================

-- profiles
create policy "profiles_select" on profiles
  for select to authenticated using (true);
create policy "profiles_update" on profiles
  for update to authenticated using (id = auth.uid());
create policy "profiles_insert" on profiles
  for insert to authenticated with check (id = auth.uid());

-- connections
create policy "connections_select" on connections
  for select to authenticated
  using (requester = auth.uid() or addressee = auth.uid());
create policy "connections_insert" on connections
  for insert to authenticated
  with check (requester = auth.uid() and status = 'pending');
create policy "connections_update" on connections
  for update to authenticated
  using (addressee = auth.uid() and status = 'pending');
create policy "connections_delete" on connections
  for delete to authenticated
  using (requester = auth.uid() or addressee = auth.uid());

-- todo_lists: check ownership or direct membership (no recursion)
create policy "todo_lists_select" on todo_lists
  for select to authenticated
  using (
    owner = auth.uid()
    or id in (select list_id from list_members where user_id = auth.uid())
  );
create policy "todo_lists_insert" on todo_lists
  for insert to authenticated
  with check (owner = auth.uid());
create policy "todo_lists_update" on todo_lists
  for update to authenticated
  using (
    exists (
      select 1 from list_members
      where list_members.list_id = id
        and list_members.user_id = auth.uid()
    )
  );
create policy "todo_lists_delete" on todo_lists
  for delete to authenticated
  using (owner = auth.uid());

-- list_members
-- list_members: user can see their own membership (breaks recursion cycle)
create policy "list_members_select" on list_members
  for select to authenticated
  using (user_id = auth.uid());
create policy "list_members_insert" on list_members
  for insert to authenticated
  with check (
    exists (
      select 1 from todo_lists
      where todo_lists.id = list_id
        and todo_lists.owner = auth.uid()
    )
  );
create policy "list_members_delete" on list_members
  for delete to authenticated
  using (
    exists (
      select 1 from todo_lists
      where todo_lists.id = list_id
        and todo_lists.owner = auth.uid()
    )
  );

-- todos
create policy "todos_select" on todos
  for select to authenticated
  using (
    exists (
      select 1 from list_members
      where list_members.list_id = todos.list_id
        and list_members.user_id = auth.uid()
    )
  );
create policy "todos_insert" on todos
  for insert to authenticated
  with check (
    exists (
      select 1 from list_members
      where list_members.list_id = todos.list_id
        and list_members.user_id = auth.uid()
    )
  );
create policy "todos_update" on todos
  for update to authenticated
  using (
    exists (
      select 1 from list_members
      where list_members.list_id = todos.list_id
        and list_members.user_id = auth.uid()
    )
  );
create policy "todos_delete" on todos
  for delete to authenticated
  using (
    exists (
      select 1 from list_members
      where list_members.list_id = todos.list_id
        and list_members.user_id = auth.uid()
    )
  );

-- ==================== FUNCTIONS ====================

-- Get all members of a list (bypasses RLS so co-members can see each other)
create or replace function get_list_members(p_list_id uuid)
returns table (user_id uuid, role member_role, username text)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from list_members where list_id = p_list_id and list_members.user_id = auth.uid()
  ) then
    return;
  end if;

  return query
    select lm.user_id, lm.role, p.username
    from list_members lm
    join profiles p on p.id = lm.user_id
    where lm.list_id = p_list_id;
end;
$$;

-- ==================== TRIGGERS ====================

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', new.email));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Auto-add owner as list member when a list is created
create or replace function handle_new_list()
returns trigger as $$
begin
  insert into list_members (list_id, user_id, role)
  values (new.id, new.owner, 'owner');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_todo_list_created
  after insert on todo_lists
  for each row execute function handle_new_list();

-- Keep todos.updated_at fresh
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on todos
  for each row execute function update_updated_at();
