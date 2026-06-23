import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  // Подсказка в консоли, если забыли переменные окружения
  console.error("Нет VITE_SUPABASE_URL или VITE_SUPABASE_ANON_KEY. Добавь их в .env (локально) и в Vercel -> Environment Variables.");
}

export const supabase = createClient(url, key);
