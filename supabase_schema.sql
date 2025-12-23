-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES (Admins/Professionals)
create table if not exists profiles (
  id uuid references auth.users on delete cascade,
  email text,
  full_name text,
  role text default 'admin',
  primary key (id)
);

-- SERVICES (Catálogo)
create table if not exists services (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  price decimal(10,2) not null,
  duration_minutes integer not null,
  category text check (category in ('Sobrancelha', 'Cilios', 'Maquiagem', 'Outro')),
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- CLIENTS
create table if not exists clients (
  id uuid default uuid_generate_v4() primary key,
  full_name text not null,
  phone text not null unique,
  cpf text,
  birth_date date,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- APPOINTMENTS (Agendamentos)
create table if not exists appointments (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references clients(id),
  service_id uuid references services(id),
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  status text check (status in ('pending', 'confirmed', 'cancelled', 'completed')) default 'pending',
  notes text,
  payment_method text, -- 'pix', 'credit_card', 'cash'
  payment_status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- ANAMNESIS (Fichas)
create table if not exists anamnesis (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references clients(id),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS POLICIES (Row Level Security)
alter table profiles enable row level security;
alter table services enable row level security;
alter table clients enable row level security;
alter table appointments enable row level security;
alter table anamnesis enable row level security;

-- Public Read Access for Services (Catalog needs to be visible)
create policy "Public services are viewable by everyone" on services
  for select using (true);

-- Admin Access Full for everything (simplified for single professional)
create policy "Admins can do everything" on profiles
  for all using (auth.uid() = id);

create policy "Admins can manage services" on services
  for all using (auth.role() = 'authenticated'); -- Assuming only admin logs in

create policy "Admins can manage clients" on clients
  for all using (auth.role() = 'authenticated');

create policy "Admins can manage appointments" on appointments
  for all using (auth.role() = 'authenticated');
  
-- Clients can insert their own appointment (via public/anon for now, creating client record first)
-- NOTE: For a simple flow without client login, we allow anon insert on clients and appointments, 
-- but we should be careful. Ideally, we use edge functions, but for simplicity:
create policy "Anon can create client" on clients
  for insert with check (true);
  
create policy "Anon can create appointment" on appointments
  for insert with check (true);

-- SEED INITIAL DATA (Serviços da Mana Souza)
insert into services (name, price, duration_minutes, category) values
('Design de Sobrancelhas', 25.00, 40, 'Sobrancelha'),
('Design com Henna', 38.00, 50, 'Sobrancelha'),
('Design com Coloração', 45.00, 50, 'Sobrancelha'),
('Alongamento Fio a Fio', 100.00, 120, 'Cilios'),
('Volume Brasileiro', 100.00, 120, 'Cilios'),
('Manutenção Cílios', 70.00, 90, 'Cilios'),
('Microblading Fio a Fio', 270.00, 120, 'Sobrancelha'),
('Shadow Line', 290.00, 120, 'Sobrancelha'),
('Shadow', 270.00, 120, 'Sobrancelha'),
('Manutenção Micro (Anual)', 190.00, 120, 'Sobrancelha'),
('Maquiagem Simples', 50.00, 90, 'Maquiagem'),
('Maquiagem Social', 75.00, 90, 'Maquiagem'),
('Olhos + Cílios Descartáveis', 30.00, 45, 'Maquiagem'),
('Maquiagem Festa', 100.00, 90, 'Maquiagem'),
('Maquiagem Artística', 150.00, 120, 'Maquiagem');
