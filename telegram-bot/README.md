# Telegram Userbot для CRM

Userbot, который автоматически анализирует личные сообщения и сообщения из приватных групп в Telegram, создаёт и обновляет сделки в CRM через AI.

## Функционал

- 📱 Читает личные сообщения и сообщения из приватных групп
- 🤖 AI анализ через Google Gemini (бесплатно)
- 📊 Автоматическое создание сделок в CRM
- ✏️ Распознавание правок и обновление ТЗ
- 💰 Определение оплат и обновление статуса
- 📋 Анализ брифа и выявление недостающих пунктов
- 🔗 Синхронизация с Supabase CRM

## Установка

1. **Получи API credentials для Telegram**
   - Зайди на https://my.telegram.org
   - Авторизуйся
   - Создай приложение и получи `api_id` и `api_hash`

2. **Получи API ключ для Gemini AI**
   - Зайди на https://aistudio.google.com/app/apikey
   - Создай API ключ

3. **Настрой окружение**
   ```bash
   cd telegram-bot
   pip install -r requirements.txt
   cp .env.example .env
   ```

4. **Заполни .env**
   ```env
   API_ID=твой_api_id
   API_HASH=твой_api_hash
   PHONE_NUMBER=твой_номер_телефона
   GEMINI_API_KEY=твой_gemini_api_key
   SUPABASE_URL=твой_supabase_url
   SUPABASE_ANON_KEY=твой_supabase_anon_key
   ```

5. **Выполни SQL миграцию в Supabase**
   - Открой SQL Editor в Supabase
   - Скопируй содержимое `migration.sql`
   - Выполни

6. **Запуск**
   ```bash
   python userbot.py
   ```

## Как это работает

1. Userbot запускается и авторизуется в Telegram
2. При получении сообщения:
   - Текст отправляется в Gemini AI
   - AI определяет тип сообщения (заказ, правки, оплата)
   - Извлекает данные (клиент, цена, сроки, ТЗ)
   - Сохраняет в таблицу `telegram_messages`
3. Если это заказ:
   - Создаёт или находит клиента
   - Создаёт или обновляет сделку
   - Отправляет уведомление в Telegram

## Структура проекта

```
telegram-bot/
├── userbot.py           # Основной файл userbot
├── classifier.py        # AI классификация
├── supabase_client.py   # Работа с Supabase
├── requirements.txt     # Python зависимости
├── .env.example         # Пример конфигурации
├── migration.sql        # SQL миграция
└── README.md           # Документация
```

## AI Классификация

AI определяет:
- **Тип сообщения**: заказ, правки, оплата, обычное сообщение
- **Клиента**: имя и username
- **Детали заказа**: тип, цена, сроки, статус
- **Бриф**: проверяет наличие обязательных пунктов
- **Правки**: что именно нужно изменить
- **Оплату**: сумму и валюту

## Безопасность

- API ключи хранятся в .env (не коммитятся в git)
- RLS политики в Supabase
- Userbot работает от твоего аккаунта

## Деплой на Render (бесплатно, 24/7)

Для работы 24/7 без ноутбука - разверни на Render.com:

### Инструкция:

1. **Зарегистрируйся на Render.com**
   - https://render.com
   - Авторизуйся через GitHub

2. **Создай новый Web Service**
   - Нажми "New +" → "Web Service"
   - Подключи GitHub репозиторий `sayaxer/stas`
   - Выбери папку `telegram-bot` как Root Directory

3. **Настройки:**
   - Name: `telegram-userbot`
   - Runtime: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python userbot.py`

4. **Environment Variables** (добавь все):
   - `API_ID` = твой api_id
   - `API_HASH` = твой api_hash
   - `PHONE_NUMBER` = +48736452818
   - `GEMINI_API_KEY` = твой Gemini ключ
   - `SUPABASE_URL` = https://acacnyjsvvbbsbspvnlf.supabase.co
   - `SUPABASE_ANON_KEY` = твой ANON ключ

5. **Важно:**
   - После первого деплоя бот запросит код подтверждения
   - Код придёт в Telegram
   - Введи его в Render Logs (вкладка Logs)
   - После этого сессия сохранится и бот будет работать 24/7

6. **Ограничения бесплатного плана:**
   - Бот спит через 15 минут бездействия
   - Пробуждается при новом сообщении (задержка ~30 сек)
   - Для работы 24/7 без сна нужен платный план ($7/мес)

### Альтернативы:
- **Railway.app** - аналогично Render
- **VPS сервер** - полный контроль, но платно

## Troubleshooting

**Ошибка авторизации:**
- Проверь api_id и api_hash
- Убедись что номер телефона указан в международном формате

**AI не отвечает:**
- Проверь GEMINI_API_KEY
- Убедись что модель доступна (gemini-1.5-flash)

**Supabase ошибка:**
- Проверь URL и ANON_KEY
- Убедись что миграция выполнена
- Проверь RLS политики
