# Кокпит — исправленная версия (плоская структура)

Прошлый раз файлы залились криво: пропала папка `src` и потерялся `App.jsx` (стал файлом `download`). Здесь **всё в одной папке, без подпапок** — так загрузка на GitHub ничего не ломает.

## Как починить репозиторий (github.com/sayaxer/stas)

1. Распакуй `cockpit-fixed.zip` — внутри все файлы лежат в одной папке.
2. Зайди в свой репозиторий → **Add file → Upload files**.
3. Перетащи **все** файлы из распакованной папки разом:
   `index.html`, `main.jsx`, `App.jsx`, `supabase.js`, `vite.config.js`, `package.json` (и `env-example.txt`).
   Одинаковые имена перезапишутся новыми (правильными), а `App.jsx` добавится.
4. Внизу — **Commit changes**.
5. **Удали мусорный файл `download`:** открой его в репозитории → значок корзины (Delete) справа сверху → Commit. Этого файла быть не должно.

После коммита Vercel сам пересоберёт сайт за ~минуту.

## Проверь на стороне Vercel
- Project → **Settings → Environment Variables**: должны быть
  - `VITE_SUPABASE_URL` = `https://acacnyjsvvbbsbspvnlf.supabase.co`
  - `VITE_SUPABASE_ANON_KEY` = твой anon public ключ
- Project → **Settings → Build & Development Settings**: Framework Preset = **Vite** (Build Command `vite build`, Output `dist`). Обычно определяется сам.
- Если менял настройки — нажми **Redeploy** (вкладка Deployments → ⋯ → Redeploy).

## Проверь на стороне Supabase
SQL-схема из SETUP-server.md должна быть уже залита (SQL Editor → Run), иначе таблиц `profiles`/`clients` нет и будет ошибка.

## Что должно получиться
Открываешь ссылку Vercel → видишь экран входа → вкладка «Регистрация» → заводишь себя → попадаешь в список клиентов. Добавь клиента — он сохранится в базе. Зайдёт второй человек — увидит то же самое.

## Если опять не так
Открой сайт → F12 → вкладка Console → скопируй красную ошибку и пришли мне. Так точно пойму причину.
