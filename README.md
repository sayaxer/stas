# Кокпит — CRM для фрилансера

CRM-система для управления сделками, клиентами и командой. Оптимизирована для фрилансеров и небольших студий в сфере дизайна и ASO.

## Структура проекта

```
├── components/          # React компоненты
│   ├── ErrorBoundary.jsx
│   ├── Login.jsx
│   ├── Layout.jsx
│   └── ConfirmationDialog.jsx
├── hooks/              # Кастомные React хуки
│   ├── useAuth.js
│   ├── useData.js
│   └── useCrud.js
├── lib/                # Бизнес-логика и API
│   ├── supabase.js
│   └── supabaseQueries.js
├── utils/              # Утилиты и хелперы
│   ├── validation.js
│   ├── formatters.js
│   └── dealHelpers.js
├── constants/          # Константы приложения
│   ├── navigation.js
│   ├── deals.js
│   ├── sales.js
│   ├── platforms.js
│   ├── journey.js
│   └── values.js
├── App.jsx             # Главный компонент
├── main.jsx            # Точка входа
├── index.html
├── package.json
├── vite.config.js
├── .eslintrc.json
├── .prettierrc
└── migration.sql       # SQL схема для Supabase
```

## Установка

1. Клонируй репозиторий
2. Установи зависимости:
```bash
npm install
```

3. Создай файл `.env` на основе `env-example.txt`:
```env
VITE_SUPABASE_URL=твой_supabase_url
VITE_SUPABASE_ANON_KEY=твой_anon_key
```

4. Выполни SQL миграцию в Supabase (SQL Editor → Run):
```bash
# Содержимое файла migration.sql
```

## Запуск

```bash
npm run dev
```

## Сборка

```bash
npm run build
npm run preview
```

## Линтинг и форматирование

```bash
npm run lint
npm run format
```

## Новые улучшения (v0.2.0)

### Архитектура
- ✅ Разделение кода на модули (components, hooks, lib, utils, constants)
- ✅ Вынесены все константы в отдельные файлы
- ✅ Созданы переиспользуемые хуки (useAuth, useData, useCrud)
- ✅ Supabase-запросы вынесены в отдельный модуль

### UX/UI
- ✅ Toast notifications (react-hot-toast)
- ✅ Confirmation dialogs для удаления
- ✅ Валидация форм (email, password, required fields)
- ✅ Error Boundary для обработки ошибок

### Качество кода
- ✅ ESLint конфигурация
- ✅ Prettier конфигурация
- ✅ Утилиты для валидации и форматирования
- ✅ Типизация через JSDoc comments

### Безопасность
- ✅ Валидация на клиенте
- ✅ Обработка ошибок API
- ✅ Toast уведомления об ошибках

## Развертывание на Vercel

1. Подключи репозиторий к Vercel
2. В Environment Variables добавь:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Framework Preset: Vite
4. Build Command: `vite build`
5. Output Directory: `dist`

## Если возникнут ошибки

Открой сайт → F12 → вкладка Console → скопируй ошибку.
