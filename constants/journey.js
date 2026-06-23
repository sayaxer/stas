import {
  Megaphone,
  MessageSquare,
  UserPlus,
  Filter,
  BadgeCheck,
  Tag,
  Wallet,
  Repeat2,
  Package,
  TrendingUp,
} from "lucide-react";

export const STAGES = [
  {
    code: "01",
    tag: "ТРАФИК",
    title: "Внимание",
    Icon: Megaphone,
    v1: "partial",
    v1s: "Сарафанка + TG + сайт.",
    closed: [
      "TG — верная площадка",
      "RU — твоя аудитория",
    ],
    open: [
      { t: "Нет холодного трафика", fix: "Рассылки по ICP" },
      { t: "Нет конф", fix: "Affiliate World, SiGMA" },
    ],
  },
  {
    code: "02",
    tag: "ПРОГРЕВ",
    title: "Контент",
    Icon: MessageSquare,
    v1: "partial",
    v1s: "Галерея + подпись.",
    closed: ["Есть anti-AI POV"],
    open: [
      { t: "Мало мнения", fix: "80% разборы, 20% кейсы" },
      { t: "Распыление", fix: "Спайк — ASO iGaming" },
    ],
  },
  {
    code: "03",
    tag: "ЛИД",
    title: "Первый контакт",
    Icon: UserPlus,
    v1: "partial",
    v1s: "DM есть, дальше импровизация.",
    closed: ["Чёткий CTA"],
    open: [
      { t: "Нет лид-магнита", fix: "Бесплатный разбор стора" },
      { t: "Нет сценария", fix: "Заготовка квала" },
    ],
  },
  {
    code: "04",
    tag: "КВАЛ",
    title: "Квалификация",
    Icon: Filter,
    v1: "broken",
    v1s: "Сразу к цене.",
    closed: [],
    open: [
      { t: "Нет квалификации", fix: "Вертикаль/гео/объём/бюджет" },
      { t: "Не вскрываешь боль", fix: "«Сколько теряешь»" },
    ],
  },
  {
    code: "05",
    tag: "ПРУФ",
    title: "Доказательства",
    Icon: BadgeCheck,
    v1: "partial",
    v1s: "Кейсы как «сочный дизайн».",
    closed: [
      "Кейсы есть",
      "Yandex-кейс",
    ],
    open: [
      { t: "Нет метрик", fix: "CR/CPI до→после" },
    ],
  },
  {
    code: "06",
    tag: "ОФФЕР",
    title: "Предложение",
    Icon: Tag,
    v1: "partial",
    v1s: "«Экономлю час».",
    closed: ["Есть сайт и цены"],
    open: [
      { t: "Продаёшь время", fix: "Модерация + конверт + %CR" },
      { t: "Оффер размыт", fix: "Одно ядро + апселлы" },
    ],
  },
  {
    code: "07",
    tag: "КЛОУЗ",
    title: "Закрытие",
    Icon: Wallet,
    v1: "broken",
    v1s: "«Вот цена → думает».",
    closed: [],
    open: [
      { t: "Нет ведения к оплате", fix: "Счёт + предоплата 50%" },
      { t: "Возражения не готовы", fix: "Заготовки под 3" },
    ],
  },
  {
    code: "08",
    tag: "ДОЖИМ",
    title: "Follow-up",
    Icon: Repeat2,
    v1: "broken",
    v1s: "Отсутствует.",
    closed: [],
    open: [
      { t: "Нет цепочки", fix: "До 5 касаний" },
    ],
  },
  {
    code: "09",
    tag: "ДОСТАВКА",
    title: "Выполнение",
    Icon: Package,
    v1: "ready",
    v1s: "Берёшь рутину, скорость.",
    closed: [
      "Процесс",
      "Скорость",
    ],
    open: [
      { t: "Нет метрики", fix: "CR/CPI до и после" },
    ],
  },
  {
    code: "10",
    tag: "LTV",
    title: "Удержание",
    Icon: TrendingUp,
    v1: "partial",
    v1s: "Нет повтора.",
    closed: ["Смежные услуги"],
    open: [
      { t: "Нет повтора", fix: "Ядро → подписка → партнёр" },
      { t: "100% серое — риск", fix: "Диверсификация" },
    ],
  },
];

export const STATUS = {
  ready: { label: "готово", cls: "ok" },
  partial: { label: "частично", cls: "mid" },
  broken: { label: "дыра", cls: "bad" },
};
