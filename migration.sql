-- ============================================================
-- ОБНОВЛЕНИЕ БАЗЫ ДЛЯ ПОЛНОГО КОКПИТА
-- Supabase -> SQL Editor -> New query -> вставить всё -> Run
-- Можно запускать повторно: лишнего не создастся.
-- ============================================================

-- ЦЕНЫ (редактируемые)
create table if not exists prices (
  id uuid primary key default gen_random_uuid(),
  name text, retail numeric default 0, floor numeric default 0,
  cost numeric default 0, cost_label text, sort int default 0
);

-- ПАКЕТЫ
create table if not exists packages (
  id uuid primary key default gen_random_uuid(),
  name text, items text, price text, note text, sort int default 0
);

-- ОПТ
create table if not exists wholesale (
  id uuid primary key default gen_random_uuid(),
  name text, retail text, tiers text, floor numeric default 0, sort int default 0
);

-- РЕГЛАМЕНТЫ (разделы + статья + PDF)
create table if not exists regulations (
  id uuid primary key default gen_random_uuid(),
  category text default 'Общие', title text, content text,
  pdf_url text, pdf_name text, sort int default 0,
  created_at timestamptz default now()
);

-- RLS: общий доступ для залогиненных
alter table prices enable row level security;
alter table packages enable row level security;
alter table wholesale enable row level security;
alter table regulations enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename='prices' and policyname='read all') then
    create policy "read all" on prices for select to authenticated using (true);
    create policy "write all" on prices for all to authenticated using (true) with check (true); end if;
  if not exists (select 1 from pg_policies where tablename='packages' and policyname='read all') then
    create policy "read all" on packages for select to authenticated using (true);
    create policy "write all" on packages for all to authenticated using (true) with check (true); end if;
  if not exists (select 1 from pg_policies where tablename='wholesale' and policyname='read all') then
    create policy "read all" on wholesale for select to authenticated using (true);
    create policy "write all" on wholesale for all to authenticated using (true) with check (true); end if;
  if not exists (select 1 from pg_policies where tablename='regulations' and policyname='read all') then
    create policy "read all" on regulations for select to authenticated using (true);
    create policy "write all" on regulations for all to authenticated using (true) with check (true); end if;
end $$;

-- СИД-ДАННЫЕ (один раз, если таблицы пустые) ----------------

insert into prices (name, retail, floor, cost, cost_label, sort)
select * from (values
  ('ASO-пак (скрины + иконка)',45,40,22,'подрядчик $20–25',1),
  ('Адаптация под 1 гео',15,12,7,'подрядчик',2),
  ('Метаданные (Title/Keys + описание)',50,45,5,'сам',3),
  ('Статика-креатив',13,10,3,'сам / подрядчик',4),
  ('AI UGC видео (15 сек)',35,18,10,'токены ~$10/15с',5),
  ('Баннер',10,5,2,'сам',6),
  ('CTA-видео ≤5 сек',15,12,10,'токены',7),
  ('Наклейка + анимация',35,25,5,'сам',8),
  ('Удаление фона / грин-скрин',7,3,1,'600+ → $1.5',9),
  ('Упаковка / брендинг (кит)',170,135,15,'сам',10)
) as v(name,retail,floor,cost,cost_label,sort)
where not exists (select 1 from prices);

insert into packages (name, items, price, note, sort)
select * from (values
  ('ASO одним пакетом','скрины + иконка + метаданные + 1 гео','$120','предлагаю ввести; компоненты ты и так делаешь',1),
  ('Запуск + крео','ASO-пакет + 10 статик + 10 AI UGC','$300+','апселл ASO в статику в видео одним чеком',2),
  ('UGC-ретейнер','30 AI UGC/мес + правки','от $400/мес','регулярка для агентств, предоплата помесячно',3)
) as v(name,items,price,note,sort)
where not exists (select 1 from packages);

insert into wholesale (name, retail, tiers, floor, sort)
select * from (values
  ('ASO-пак','$45','флор $40 на любом объёме',40,1),
  ('Статика','$13','от 15/нед = $10/шт',10,2),
  ('AI UGC видео','$35','40+ = $10, 70+ = $9, 100+ = $8',18,3),
  ('Баннеры','$10','опт = $5/шт',5,4),
  ('Удаление фона','$7','600+ = $1.5/шт',1.5,5),
  ('CTA-видео до 5с','$15','опт по договорённости',12,6)
) as v(name,retail,tiers,floor,sort)
where not exists (select 1 from wholesale);

insert into regulations (category, title, content, sort)
select * from (values
  ('Общие','Приём заказа','Квалификация до цены: вертикаль, гео, объём, срок, бюджет. Срок называем с буфером. Предоплата 50% до старта (USDT). Бриф: Figma/скрины, ТЗ, гео, референсы.',1),
  ('Дизайнеры','Чек-лист сдачи','Проверь размеры под сторы и читаемость на превью, проходимость модерации. QA перед отправкой клиенту. Исходники отдаём только после полной оплаты.',2),
  ('Клиенты','Как мы работаем','Предоплата 50%, остаток по сдаче. Правки в оговорённых рамках. Сроки фиксируем заранее. Оплата USDT.',3)
) as v(category,title,content,sort)
where not exists (select 1 from regulations);

-- ХРАНИЛИЩЕ ДЛЯ PDF -----------------------------------------
-- Бакет docs (публичный — файлы открываются по ссылке)
insert into storage.buckets (id, name, public)
values ('docs','docs', true)
on conflict (id) do nothing;

-- Политики хранилища: залогиненные могут грузить/читать/удалять в docs
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='docs upload') then
    create policy "docs upload" on storage.objects for insert to authenticated with check (bucket_id = 'docs'); end if;
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='docs read') then
    create policy "docs read" on storage.objects for select to authenticated using (bucket_id = 'docs'); end if;
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='docs delete') then
    create policy "docs delete" on storage.objects for delete to authenticated using (bucket_id = 'docs'); end if;
end $$;
