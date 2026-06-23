import { Home, Wallet, ClipboardList, Users, Menu } from "lucide-react";

export const SECTIONS = [
  {
    key: "home",
    label: "Дом",
    Icon: Home,
    subs: [
      { k: "overview", label: "Обзор" },
      { k: "focus", label: "Фокус" },
      { k: "followup", label: "Дожим" },
    ],
  },
  {
    key: "money",
    label: "Деньги",
    Icon: Wallet,
    subs: [
      { k: "summary", label: "Сводка" },
      { k: "prices", label: "Цены" },
      { k: "wholesale", label: "Опт" },
      { k: "packages", label: "Пакеты" },
    ],
  },
  {
    key: "deals",
    label: "Сделки",
    Icon: ClipboardList,
    subs: [
      { k: "board", label: "Заказы" },
      { k: "clients", label: "Клиенты" },
      { k: "sales", label: "Продажи" },
      { k: "partners", label: "Партнёрства" },
    ],
  },
  {
    key: "team",
    label: "Команда",
    Icon: Users,
    subs: [
      { k: "load", label: "Загрузка" },
      { k: "users", label: "Пользователи" },
    ],
  },
  {
    key: "more",
    label: "Ещё",
    Icon: Menu,
    subs: [
      { k: "rules", label: "Регламенты" },
      { k: "channels", label: "Каналы" },
      { k: "journey", label: "Путь клиента" },
    ],
  },
];

export const ALL_SECTIONS = SECTIONS.map((s) => s.key);
