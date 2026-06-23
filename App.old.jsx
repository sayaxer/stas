import React, { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "./supabase.js";
import {
  Home, Wallet, ClipboardList, Users, Menu, LogOut, Lock, Loader2,
  DollarSign, Tag, Package, TrendingUp, BadgeCheck, MessageSquare, Megaphone,
  Filter, Repeat2, UserPlus, Send, Globe, MessageCircle, Palette, Instagram, Hash,
  Shield, UserCog, FileCheck, Download, Bell, Contact, Phone, FileText, Copy, Upload,
  Plus, Trash2, Check, ChevronDown, ArrowRight, AlertTriangle,
} from "lucide-react";

/* ════ НАВИГАЦИЯ ════ */
const SECTIONS = [
  { key: "home", label: "Дом", Icon: Home, subs: [{ k: "overview", label: "Обзор" }, { k: "focus", label: "Фокус" }, { k: "followup", label: "Дожим" }] },
  { key: "money", label: "Деньги", Icon: Wallet, subs: [{ k: "summary", label: "Сводка" }, { k: "prices", label: "Цены" }, { k: "wholesale", label: "Опт" }, { k: "packages", label: "Пакеты" }] },
  { key: "deals", label: "Сделки", Icon: ClipboardList, subs: [{ k: "board", label: "Заказы" }, { k: "clients", label: "Клиенты" }, { k: "sales", label: "Продажи" }, { k: "partners", label: "Партнёрства" }] },
  { key: "team", label: "Команда", Icon: Users, subs: [{ k: "load", label: "Загрузка" }, { k: "users", label: "Пользователи" }] },
  { key: "more", label: "Ещё", Icon: Menu, subs: [{ k: "rules", label: "Регламенты" }, { k: "channels", label: "Каналы" }, { k: "journey", label: "Путь клиента" }] },
];
const ALL_SECTIONS = SECTIONS.map((s) => s.key);

const DEAL_STAGES = [{ key: "lead", label: "Лид" }, { key: "qual", label: "Квал" }, { key: "offer", label: "Оффер/счёт" }, { key: "work", label: "В работе" }, { key: "review", label: "Сдача" }, { key: "won", label: "Готов+кейс" }, { key: "lost", label: "Слит" }];
const ACTIVE_KEYS = ["lead", "qual", "offer", "work", "review"];
const VERTICALS = ["iGaming", "Crypto", "Dating", "Affiliate", "Белая", "Другое"];
const SERVICES = ["ASO", "AI UGC", "Креативы (статика)", "Видео / CTA", "Лендинг", "Аппка", "Соцсети", "Брендинг", "Другое"];
const CLIENT_STATUS = [{ k: "new", label: "новый", cls: "mid" }, { k: "active", label: "активный", cls: "ok" }, { k: "repeat", label: "повторный", cls: "acc" }, { k: "cold", label: "спящий", cls: "dim" }];

const SALES_PATH = [
  { s: "Пишет (реферал / чат)", ok: true }, { s: "Просит прайс → спрашиваешь объём", ok: true }, { s: "Даёшь цену + портфолио", ok: true }, { s: "Предоплата 50% USDT", ok: true }, { s: "Берёшь в работу, 1–2 дня", ok: true },
  { s: "Срываешь сроки и пропадаешь", ok: false, fix: "Убивает повтор и рефералы. Бери только что успеваешь, срок с буфером, статус-пинг." },
  { s: "Нет апсейла и регулярки", ok: false, fix: "После сдачи — видео/лендинг/ретейнер. ASO→статика→UGC→лендинг." },
];
const QUAL = ["Вертикаль", "Гео", "Объём", "Срок", "Бюджет и предоплата", "Потенциал повтора"];
const OBJECTIONS = [
  { o: "«Ты говорил дешевле» / торг", r: "Цена по объёму — назови объём, дам опт. Розница фиксированная, ниже флора не работаю." },
  { o: "«По предоплате не готов»", r: "В серой нише без предоплаты не стартую. 50% до старта, остаток по сдаче." },
  { o: "«Сначала тестовое»", r: "Тест — платный мини-пакет по полной ставке, зачитывается в заказ." },
  { o: "«Скинь портфолио»", r: "Вот сайт. NDA-кейсы покажу обезличенно. Что за вертикаль и гео?" },
  { o: "«Сам сделаю на AI / veo3»", r: "AI даёт 80% generic. Я — заходящий угол + проходимость модерации + что конвертит." },
];
const PARTNERS = [
  { name: "Входящие рефералы", verdict: "масштабировать", now: "Приводят байеры, агентства, чаты.", rule: "Реф-бонус 10–15% с первого заказа. Скажи источникам." },
  { name: "Исходящие рефералы", verdict: "оформить", now: "Предлагал «без наценки за рекомендацию».", rule: "Зафиксируй 10–15%, больше не давай — тонкая маржа." },
  { name: "Субподряд / white-label", verdict: "переставить", now: "Берёшь под агентствами; делегируешь ASO ~$22.", rule: "Делегируй только ≥2× ставки и не флагман." },
  { name: "Рев-шер с клиентами", verdict: "осторожно", now: "Был вариант 50/50 на аппке.", rule: "Чистый 50/50 рискован. Фикс + % + флор, с теми, кому доверяешь." },
  { name: "Смежные «под ключ»", verdict: "формализовать", now: "Связки с разработчиком и видео-техником.", rule: "Реферал/бартер с PWA, медиабайером, ASO-техником." },
];
const PLATFORMS = [
  { code: "p1", name: "Telegram-канал", handle: "@stasroyce · 250", Icon: Send, role: "ЯДРО", verdict: "tune", roleLine: "Прогрев, витрина кейсов, сбор аудитории.", status: "250 подписчиков, контент «галерея + подпись».", tune: ["Лид-магнит в закреп", "Больше POV (80/20)", "Регулярность + перелинковка"], leave: ["«Кейс + CTA» — ок"] },
  { code: "p2", name: "Сайт / портфолио", handle: "framer.website", Icon: Globe, role: "ВИТРИНА", verdict: "tune", roleLine: "Куда ведёшь: портфолио, цены, оффер.", status: "Есть, но с дырами.", tune: ["Битые ссылки в футере", "Свести позиционирование к одному", "Один спайк на первый экран", "Цены на пакет/результат", "Добавить метрики", "Вынести Yandex-кейс"], leave: ["Структура и визуал — ок"] },
  { code: "p3", name: "Личка", handle: "@stas_royce", Icon: MessageCircle, role: "КОНВЕРСИЯ", verdict: "tune", roleLine: "Где идёт продажа.", status: "Работает, но без сценария.", tune: ["Скрипт первого ответа + квал", "Предоплата 50% по умолчанию"], leave: ["Продажа в ЛС — верно"] },
  { code: "p4", name: "Чаты + конференции", handle: "главный канал ниши", Icon: Users, role: "ОХВАТ", verdict: "tune", roleLine: "Медиабайеры и арбитраж.", status: "Системно, вероятно, нет.", tune: ["3–5 чатов байеров + рассылки", "1–2 конфы (Affiliate World, SiGMA)"], leave: ["Не распыляйся"] },
  { code: "p5", name: "Behance / Dribbble", handle: "ссылки битые", Icon: Palette, role: "ПРУФ", verdict: "fix", roleLine: "Пассивный вход для белой части.", status: "Ссылки ведут на x.com.", tune: ["Завести или убрать ссылки", "Белая часть (Yandex, UI/UX)"], leave: ["Серое не пихать — NDA"] },
  { code: "p6", name: "Instagram", handle: "ссылка битая", Icon: Instagram, role: "ОХВАТ", verdict: "fix", roleLine: "Reels, но B2B-байер не тут.", status: "Ссылка битая.", tune: ["Системные reels или убрать пункт"], leave: ["Не приоритет"] },
  { code: "p7", name: "Блог / Read.cv", handle: "не подключено", Icon: FileCheck, role: "SEO", verdict: "fix", roleLine: "Мёртвые пункты; SEO позже.", status: "В меню есть, ссылок нет.", tune: ["Убрать мёртвые пункты", "Потом — блог под ASO"], leave: ["Не сейчас"] },
];
const VERDICT = { tune: { label: "докрутить", cls: "tune" }, fix: { label: "чинить", cls: "fix" }, skip: { label: "не заводить", cls: "skip" } };
const STAGES = [
  { code: "01", tag: "ТРАФИК", title: "Внимание", Icon: Megaphone, v1: "partial", v1s: "Сарафанка + TG + сайт.", closed: ["TG — верная площадка", "RU — твоя аудитория"], open: [{ t: "Нет холодного трафика", fix: "Рассылки по ICP" }, { t: "Нет конф", fix: "Affiliate World, SiGMA" }] },
  { code: "02", tag: "ПРОГРЕВ", title: "Контент", Icon: MessageSquare, v1: "partial", v1s: "Галерея + подпись.", closed: ["Есть anti-AI POV"], open: [{ t: "Мало мнения", fix: "80% разборы, 20% кейсы" }, { t: "Распыление", fix: "Спайк — ASO iGaming" }] },
  { code: "03", tag: "ЛИД", title: "Первый контакт", Icon: UserPlus, v1: "partial", v1s: "DM есть, дальше импровизация.", closed: ["Чёткий CTA"], open: [{ t: "Нет лид-магнита", fix: "Бесплатный разбор стора" }, { t: "Нет сценария", fix: "Заготовка квала" }] },
  { code: "04", tag: "КВАЛ", title: "Квалификация", Icon: Filter, v1: "broken", v1s: "Сразу к цене.", closed: [], open: [{ t: "Нет квалификации", fix: "Вертикаль/гео/объём/бюджет" }, { t: "Не вскрываешь боль", fix: "«Сколько теряешь»" }] },
  { code: "05", tag: "ПРУФ", title: "Доказательства", Icon: BadgeCheck, v1: "partial", v1s: "Кейсы как «сочный дизайн».", closed: ["Кейсы есть", "Yandex-кейс"], open: [{ t: "Нет метрик", fix: "CR/CPI до→после" }] },
  { code: "06", tag: "ОФФЕР", title: "Предложение", Icon: Tag, v1: "partial", v1s: "«Экономлю час».", closed: ["Есть сайт и цены"], open: [{ t: "Продаёшь время", fix: "Модерация + конверт + %CR" }, { t: "Оффер размыт", fix: "Одно ядро + апселлы" }] },
  { code: "07", tag: "КЛОУЗ", title: "Закрытие", Icon: Wallet, v1: "broken", v1s: "«Вот цена → думает».", closed: [], open: [{ t: "Нет ведения к оплате", fix: "Счёт + предоплата 50%" }, { t: "Возражения не готовы", fix: "Заготовки под 3" }] },
  { code: "08", tag: "ДОЖИМ", title: "Follow-up", Icon: Repeat2, v1: "broken", v1s: "Отсутствует.", closed: [], open: [{ t: "Нет цепочки", fix: "До 5 касаний" }] },
  { code: "09", tag: "ДОСТАВКА", title: "Выполнение", Icon: Package, v1: "ready", v1s: "Берёшь рутину, скорость.", closed: ["Процесс", "Скорость"], open: [{ t: "Нет метрики", fix: "CR/CPI до и после" }] },
  { code: "10", tag: "LTV", title: "Удержание", Icon: TrendingUp, v1: "partial", v1s: "Нет повтора.", closed: ["Смежные услуги"], open: [{ t: "Нет повтора", fix: "Ядро → подписка → партнёр" }, { t: "100% серое — риск", fix: "Диверсификация" }] },
];
const STATUS = { ready: { label: "готово", cls: "ok" }, partial: { label: "частично", cls: "mid" }, broken: { label: "дыра", cls: "bad" } };

/* ════ ХЕЛПЕРЫ ════ */
const uid = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now());
const today = () => new Date().toISOString().slice(0, 10);
const daysSince = (d) => (d ? Math.floor((Date.now() - new Date(d).getTime()) / 86400000) : 999);
const money = (n) => "$" + (Number(n) || 0).toLocaleString("ru-RU");
const valOf = (d) => (d.lines && d.lines.length ? d.lines.reduce((a, l) => a + (l.retail || 0) * (+l.qty || 0), 0) : +d.value || 0);
const paidOf = (d) => +d.paid || 0;
const dealFromDB = (r) => ({ ...r, clientId: r.client_id || "", lines: r.lines || [], value: +r.value || 0, paid: +r.paid || 0 });
const dealToDB = (d) => ({ id: d.id, client: d.client, client_id: d.clientId || null, vertical: d.vertical, service: d.service, value: d.value, paid: d.paid, lines: d.lines, stage: d.stage, assignee: d.assignee, next: d.next, due: d.due || null });
const cliFromDB = (r) => ({ ...r, lastContact: r.last_contact || "" });
const cliToDB = (c) => ({ id: c.id, name: c.name, contact: c.contact, vertical: c.vertical, status: c.status, last_contact: c.lastContact || null, note: c.note });
const saveRow = (t, row) => supabase.from(t).upsert(row).then(({ error }) => { if (error) console.error("save", t, error.message); });
const dropRow = (t, id) => supabase.from(t).delete().eq("id", id).then(({ error }) => { if (error) console.error("del", t, error.message); });

export default function App() {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState(""); const [pw, setPw] = useState("");
  const [authMsg, setAuthMsg] = useState(""); const [busy, setBusy] = useState(false);

  const [section, setSection] = useState("home");
  const [sub, setSub] = useState("overview");
  const [expanded, setExpanded] = useState({});
  const [openDeal, setOpenDeal] = useState(null);
  const [openClient, setOpenClient] = useState(null);
  const [openReg, setOpenReg] = useState(null);
  const [calc, setCalc] = useState({ idx: 0, price: 45, cost: 22 });
  const [ioMsg, setIoMsg] = useState("");
  const [regBusy, setRegBusy] = useState(null);

  const [clients, setClients] = useState([]);
  const [deals, setDeals] = useState([]);
  const [team, setTeam] = useState([]);
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [settings, setSettings] = useState({ baseContacts: 0, goal: 0 });
  const [done, setDone] = useState({});
  const [prices, setPrices] = useState([]);
  const [packages, setPackages] = useState([]);
  const [wholesale, setWholesale] = useState([]);
  const [regs, setRegs] = useState([]);

  /* auth */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);
  useEffect(() => { if (session) loadAll(); else resetData(); }, [session]); // eslint-disable-line

  const resetData = () => { setClients([]); setDeals([]); setTeam([]); setRoles([]); setUsers([]); setDone({}); setPrices([]); setPackages([]); setWholesale([]); setRegs([]); };
  const loadAll = async () => {
    setLoading(true);
    const [cl, dl, tm, rl, pf, pr, pk, wh, rg, pg, st] = await Promise.all([
      supabase.from("clients").select("*").order("created_at", { ascending: false }),
      supabase.from("deals").select("*").order("created_at", { ascending: false }),
      supabase.from("team").select("*"),
      supabase.from("roles").select("*"),
      supabase.from("profiles").select("*"),
      supabase.from("prices").select("*").order("sort"),
      supabase.from("packages").select("*").order("sort"),
      supabase.from("wholesale").select("*").order("sort"),
      supabase.from("regulations").select("*").order("sort"),
      supabase.from("progress").select("*"),
      supabase.from("settings").select("*").eq("id", 1).maybeSingle(),
    ]);
    setClients((cl.data || []).map(cliFromDB));
    setDeals((dl.data || []).map(dealFromDB));
    setTeam(tm.data || []);
    setRoles(rl.data || []);
    setUsers((pf.data || []).map((p) => ({ id: p.id, name: p.name || "", role: p.role || "designer" })));
    setPrices(pr.data || []); setPackages(pk.data || []); setWholesale(wh.data || []); setRegs(rg.data || []);
    const dm = {}; (pg.data || []).forEach((r) => { if (r.done) dm[r.key] = true; }); setDone(dm);
    if (st.data) setSettings({ baseContacts: st.data.base_contacts || 0, goal: +st.data.goal || 0 });
    setLoading(false);
  };

  const signIn = async () => { setBusy(true); setAuthMsg(""); const { error } = await supabase.auth.signInWithPassword({ email, password: pw }); if (error) setAuthMsg(error.message); setBusy(false); };
  const signUp = async () => { setBusy(true); setAuthMsg(""); const { error } = await supabase.auth.signUp({ email, password: pw }); if (error) setAuthMsg(error.message); else setAuthMsg("Готово. Если включено подтверждение email — проверь почту, иначе нажми «Войти»."); setBusy(false); };
  const signOut = async () => { await supabase.auth.signOut(); };

  /* доступ по роли */
  const myProfile = users.find((u) => u.id === session?.user?.id);
  const myRole = roles.find((r) => r.id === myProfile?.role);
  const access = myRole ? myRole.access || [] : ALL_SECTIONS;
  const visibleSections = SECTIONS.filter((s) => access.includes(s.key));
  useEffect(() => { if (!loading && session && !access.includes(section) && visibleSections.length) { const f = visibleSections[0]; setSection(f.key); setSub(f.subs[0].k); } }, [loading]); // eslint-disable-line
  const go = (sec) => { const s = SECTIONS.find((x) => x.key === sec); setSection(sec); setSub(s.subs[0].k); };
  const toggleExpand = (c) => setExpanded((p) => ({ ...p, [c]: !p[c] }));
  const toggleDone = (id) => { const has = !!done[id]; const n = { ...done }; if (has) delete n[id]; else n[id] = true; setDone(n); if (has) dropRow("progress", id); else saveRow("progress", { key: id, done: true }); };

  /* CRUD */
  const updDeal = (id, patch) => { const n = deals.map((d) => (d.id === id ? { ...d, ...patch } : d)); setDeals(n); };
  const commitDeal = (id) => { const d = deals.find((x) => x.id === id); if (d) saveRow("deals", dealToDB(d)); };
  const addDeal = () => { const d = { id: uid(), client: "", clientId: "", vertical: "iGaming", service: "ASO", value: 0, paid: 0, lines: [], stage: "lead", assignee: team[0]?.id || null, next: "", due: "" }; setDeals([d, ...deals]); saveRow("deals", dealToDB(d)); setOpenDeal(d.id); go("deals"); setSub("board"); };
  const delDeal = (id) => { setDeals(deals.filter((d) => d.id !== id)); dropRow("deals", id); if (openDeal === id) setOpenDeal(null); };
  const setLines = (id, lines) => { updDeal(id, { lines }); const d = deals.find((x) => x.id === id); if (d) saveRow("deals", dealToDB({ ...d, lines })); };
  const addLine = (d) => setLines(d.id, [...(d.lines || []), { pid: prices[0]?.id, name: prices[0]?.name, retail: +prices[0]?.retail || 0, qty: 1 }]);
  const updLine = (d, i, pid) => { const p = prices.find((x) => x.id === pid); setLines(d.id, (d.lines || []).map((l, idx) => (idx === i ? { pid, name: p?.name, retail: +p?.retail || 0, qty: l.qty } : l))); };
  const updLineQty = (d, i, qty) => setLines(d.id, (d.lines || []).map((l, idx) => (idx === i ? { ...l, qty } : l)));
  const rmLine = (d, i) => setLines(d.id, (d.lines || []).filter((_, idx) => idx !== i));

  const updCli = (id, patch) => setClients(clients.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const commitCli = (id) => { const c = clients.find((x) => x.id === id); if (c) saveRow("clients", cliToDB(c)); };
  const addCli = () => { const c = { id: uid(), name: "Новый клиент", contact: "", vertical: "iGaming", status: "new", lastContact: today(), note: "" }; setClients([c, ...clients]); saveRow("clients", cliToDB(c)); setOpenClient(c.id); };
  const addCliFromDeal = (d) => { const c = { id: uid(), name: d.client || "Новый клиент", contact: "", vertical: d.vertical, status: "new", lastContact: today(), note: "" }; setClients([c, ...clients]); saveRow("clients", cliToDB(c)); updDeal(d.id, { clientId: c.id }); const nd = { ...d, clientId: c.id }; saveRow("deals", dealToDB(nd)); };
  const delCli = (id) => { setClients(clients.filter((c) => c.id !== id)); dropRow("clients", id); };
  const contacted = (id) => { updCli(id, { lastContact: today() }); const c = clients.find((x) => x.id === id); if (c) saveRow("clients", cliToDB({ ...c, lastContact: today() })); };
  const cliAgg = (cid) => { const ds = deals.filter((d) => d.clientId === cid); return { count: ds.length, total: ds.reduce((a, d) => a + valOf(d), 0) }; };

  const updTeam = (id, patch) => setTeam(team.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  const commitTeam = (id) => { const m = team.find((x) => x.id === id); if (m) saveRow("team", m); };
  const addTeam = () => { const m = { id: uid(), name: "Новый участник", role: "", capacity: 3 }; setTeam([...team, m]); saveRow("team", m); };
  const delTeam = (id) => { setTeam(team.filter((m) => m.id !== id)); dropRow("team", id); };

  const updPrice = (id, patch) => setPrices(prices.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const commitPrice = (id) => { const p = prices.find((x) => x.id === id); if (p) saveRow("prices", p); };
  const addPrice = () => { const p = { id: uid(), name: "Новая услуга", retail: 0, floor: 0, cost: 0, cost_label: "", sort: prices.length + 1 }; setPrices([...prices, p]); saveRow("prices", p); };
  const delPrice = (id) => { setPrices(prices.filter((p) => p.id !== id)); dropRow("prices", id); };

  const updPack = (id, patch) => setPackages(packages.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const commitPack = (id) => { const p = packages.find((x) => x.id === id); if (p) saveRow("packages", p); };
  const addPack = () => { const p = { id: uid(), name: "Новый пакет", items: "", price: "", note: "", sort: packages.length + 1 }; setPackages([...packages, p]); saveRow("packages", p); };
  const delPack = (id) => { setPackages(packages.filter((p) => p.id !== id)); dropRow("packages", id); };

  const updWh = (id, patch) => setWholesale(wholesale.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const commitWh = (id) => { const p = wholesale.find((x) => x.id === id); if (p) saveRow("wholesale", p); };
  const addWh = () => { const p = { id: uid(), name: "Новая услуга", retail: "", tiers: "", floor: 0, sort: wholesale.length + 1 }; setWholesale([...wholesale, p]); saveRow("wholesale", p); };
  const delWh = (id) => { setWholesale(wholesale.filter((p) => p.id !== id)); dropRow("wholesale", id); };

  const updReg = (id, patch) => setRegs(regs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const commitReg = (id) => { const r = regs.find((x) => x.id === id); if (r) saveRow("regulations", r); };
  const addReg = (category) => { const r = { id: uid(), category: category || "Общие", title: "Новый регламент", content: "", pdf_url: "", pdf_name: "", sort: regs.length + 1 }; setRegs([r, ...regs]); saveRow("regulations", r); setOpenReg(r.id); };
  const copyReg = (r) => { const c = { ...r, id: uid(), title: (r.title || "") + " (копия)", sort: regs.length + 1 }; setRegs([c, ...regs]); saveRow("regulations", c); setOpenReg(c.id); };
  const delReg = (id) => { setRegs(regs.filter((r) => r.id !== id)); dropRow("regulations", id); if (openReg === id) setOpenReg(null); };
  const uploadPdf = async (r, file) => { if (!file) return; setRegBusy(r.id); const path = `${r.id}/${Date.now()}-${file.name}`; const { error } = await supabase.storage.from("docs").upload(path, file, { upsert: true }); if (error) { setIoMsg(error.message); setRegBusy(null); return; } const { data } = supabase.storage.from("docs").getPublicUrl(path); updReg(r.id, { pdf_url: data.publicUrl, pdf_name: file.name }); const nr = { ...r, pdf_url: data.publicUrl, pdf_name: file.name }; saveRow("regulations", nr); setRegBusy(null); };
  const rmPdf = (r) => { updReg(r.id, { pdf_url: "", pdf_name: "" }); saveRow("regulations", { ...r, pdf_url: "", pdf_name: "" }); };

  const updUserRole = (id, role) => { setUsers(users.map((u) => (u.id === id ? { ...u, role } : u))); supabase.from("profiles").update({ role }).eq("id", id); };
  const updUserName = (id, name) => setUsers(users.map((u) => (u.id === id ? { ...u, name } : u)));
  const commitUserName = (id) => { const u = users.find((x) => x.id === id); if (u) supabase.from("profiles").update({ name: u.name }).eq("id", id); };

  const updRole = (id, patch) => setRoles(roles.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const commitRole = (id) => { const r = roles.find((x) => x.id === id); if (r) saveRow("roles", r); };
  const addRole = () => { const r = { id: uid(), name: "Новая роль", access: ["home"] }; setRoles([...roles, r]); saveRow("roles", r); };
  const delRole = (id) => { if (id === "owner") return; setRoles(roles.filter((r) => r.id !== id)); dropRow("roles", id); };
  const toggleAccess = (rid, sk) => { const r = roles.find((x) => x.id === rid); if (!r) return; const access = r.access.includes(sk) ? r.access.filter((x) => x !== sk) : [...r.access, sk]; updRole(rid, { access }); saveRow("roles", { ...r, access }); };

  const setBase = (v) => { const n = { ...settings, baseContacts: +v || 0 }; setSettings(n); supabase.from("settings").update({ base_contacts: n.baseContacts }).eq("id", 1); };
  const setGoal = (v) => { const n = { ...settings, goal: +v || 0 }; setSettings(n); supabase.from("settings").update({ goal: n.goal }).eq("id", 1); };
  const selectService = (i) => { const p = prices[i]; if (p) setCalc({ idx: i, price: +p.retail || 0, cost: +p.cost || 0 }); };

  /* derived */
  const m = useMemo(() => {
    const act = deals.filter((d) => ACTIVE_KEYS.includes(d.stage)); const won = deals.filter((d) => d.stage === "won"); const lost = deals.filter((d) => d.stage === "lost");
    const cashIn = deals.filter((d) => d.stage !== "lost").reduce((a, d) => a + paidOf(d), 0);
    const receivable = deals.filter((d) => d.stage !== "lost").reduce((a, d) => a + Math.max(0, valOf(d) - paidOf(d)), 0);
    const pipeline = act.reduce((a, d) => a + valOf(d), 0);
    const wonSum = won.reduce((a, d) => a + valOf(d), 0);
    const conv = won.length + lost.length ? Math.round((won.length / (won.length + lost.length)) * 100) : 0;
    const avg = won.length ? Math.round(wonSum / won.length) : 0;
    const byStage = DEAL_STAGES.map((s) => { const l = deals.filter((d) => d.stage === s.key); return { ...s, count: l.length, sum: l.reduce((a, d) => a + valOf(d), 0) }; });
    const maxSum = Math.max(1, ...byStage.map((s) => s.sum));
    return { actN: act.length, wonN: won.length, lostN: lost.length, cashIn, receivable, pipeline, conv, avg, byStage, maxSum };
  }, [deals]);
  const teamLoad = useMemo(() => team.map((mm) => { const l = deals.filter((d) => d.assignee === mm.id && ACTIVE_KEYS.includes(d.stage)); return { ...mm, load: l.length, value: l.reduce((a, d) => a + valOf(d), 0), over: l.length > (+mm.capacity || 0) }; }), [team, deals]);
  const cSel = prices[calc.idx]; const cMargin = calc.price - calc.cost; const cPct = calc.price > 0 ? Math.round((cMargin / calc.price) * 100) : 0; const cCls = cPct >= 60 ? "ok" : cPct >= 50 ? "mid" : "bad";
  const activeNext = deals.filter((d) => ACTIVE_KEYS.includes(d.stage) && d.next && d.next.trim()).sort((a, b) => ((a.due || "9999") < (b.due || "9999") ? -1 : 1));
  const front = []; PLATFORMS.forEach((p) => { if (p.verdict === "skip") return; (p.tune || []).forEach((t, i) => { const id = `bt-${p.code}-${i}`; front.push({ id, text: t, ch: p.name, done: !!done[id] }); }); });
  const overdue = deals.filter((d) => ACTIVE_KEYS.includes(d.stage) && d.due && d.due < today());
  const hot = deals.filter((d) => ACTIVE_KEYS.includes(d.stage) && d.due && d.due >= today() && daysSince(d.due) >= -2);
  const coldLeads = deals.filter((d) => d.stage === "lead");
  const reTouch = clients.filter((c) => (c.status === "active" || c.status === "repeat") && daysSince(c.lastContact) >= 14);
  const regCats = Array.from(new Set(regs.map((r) => r.category || "Общие")));

  /* ════ ЭКРАНЫ ════ */
  const dealEditor = (d) => (
    <div className="edit">
      <label className="fld"><span>Клиент / проект</span><input className="inp" value={d.client || ""} onChange={(e) => updDeal(d.id, { client: e.target.value })} onBlur={() => commitDeal(d.id)} placeholder="напр. Casino X" /></label>
      <label className="fld"><span>Карточка клиента</span><div className="ri"><select className="sel" value={d.clientId || ""} onChange={(e) => { updDeal(d.id, { clientId: e.target.value }); const nd = { ...d, clientId: e.target.value }; saveRow("deals", dealToDB(nd)); }}><option value="">— не привязан —</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select><button className="mini" onClick={() => addCliFromDeal(d)}><Plus size={13} />клиент</button></div></label>
      <div className="fld2"><label className="fld"><span>Вертикаль</span><select className="sel" value={d.vertical} onChange={(e) => { updDeal(d.id, { vertical: e.target.value }); saveRow("deals", dealToDB({ ...d, vertical: e.target.value })); }}>{VERTICALS.map((v) => <option key={v}>{v}</option>)}</select></label><label className="fld"><span>Услуга</span><select className="sel" value={d.service} onChange={(e) => { updDeal(d.id, { service: e.target.value }); saveRow("deals", dealToDB({ ...d, service: e.target.value })); }}>{SERVICES.map((v) => <option key={v}>{v}</option>)}</select></label></div>
      <div className="fld"><span>Позиции из прайса {d.lines && d.lines.length ? `· сумма ${money(valOf(d))}` : ""}</span>
        {(d.lines || []).map((l, i) => (<div className="line" key={i}><select className="sel line-s" value={l.pid || ""} onChange={(e) => updLine(d, i, e.target.value)}>{prices.map((p) => <option key={p.id} value={p.id}>{p.name} · {money(p.retail)}</option>)}</select><input className="inp line-q" type="number" value={l.qty} onChange={(e) => updLineQty(d, i, +e.target.value || 0)} /><button className="del-x" onClick={() => rmLine(d, i)}><Trash2 size={13} /></button></div>))}
        <button className="mini" onClick={() => addLine(d)} disabled={!prices.length}><Plus size={13} />позиция</button>
      </div>
      {(!d.lines || !d.lines.length) && <label className="fld"><span>Сумма $ (вручную)</span><input className="inp" type="number" value={d.value} onChange={(e) => updDeal(d.id, { value: +e.target.value || 0 })} onBlur={() => commitDeal(d.id)} /></label>}
      <div className="fld2"><label className="fld"><span>Депозит получен $</span><div className="ri"><input className="inp" type="number" value={d.paid} onChange={(e) => updDeal(d.id, { paid: +e.target.value || 0 })} onBlur={() => commitDeal(d.id)} /><button className="mini" onClick={() => { updDeal(d.id, { paid: Math.round(valOf(d) / 2) }); saveRow("deals", dealToDB({ ...d, paid: Math.round(valOf(d) / 2) })); }}>50%</button></div></label><label className="fld"><span>Дедлайн</span><input className="inp" type="date" value={d.due || ""} onChange={(e) => { updDeal(d.id, { due: e.target.value }); saveRow("deals", dealToDB({ ...d, due: e.target.value })); }} /></label></div>
      <div className="bal"><span>Сумма: <b>{money(valOf(d))}</b></span><span>Получено: <b className="ok">{money(paidOf(d))}</b></span><span>Остаток: <b className={valOf(d) - paidOf(d) > 0 ? "bad" : ""}>{money(Math.max(0, valOf(d) - paidOf(d)))}</b></span></div>
      <label className="fld"><span>Исполнитель</span><select className="sel" value={d.assignee || ""} onChange={(e) => { updDeal(d.id, { assignee: e.target.value }); saveRow("deals", dealToDB({ ...d, assignee: e.target.value })); }}><option value="">—</option>{team.map((mm) => <option key={mm.id} value={mm.id}>{mm.name}</option>)}</select></label>
      <label className="fld"><span>Следующий шаг</span><input className="inp" value={d.next || ""} onChange={(e) => updDeal(d.id, { next: e.target.value })} onBlur={() => commitDeal(d.id)} placeholder="что дальше" /></label>
      <button className="del" onClick={() => delDeal(d.id)}><Trash2 size={13} />удалить</button>
    </div>
  );

  const board = (
    <div>
      <div className="bar"><div className="stats"><div className="stat"><b>{m.actN}</b><span>активных</span></div><div className="stat ok"><b>{money(m.cashIn)}</b><span>получено</span></div><div className="stat"><b className="bad">{money(m.receivable)}</b><span>должны</span></div></div><button className="btn" onClick={addDeal}><Plus size={15} />заказ</button></div>
      <div className="ovr">{m.byStage.filter((s) => s.key !== "lost").map((s) => <div className="ov" key={s.key}><span className="ov-l">{s.label}</span><b>{s.count}</b><span className="ov-s">{money(s.sum)}</span></div>)}</div>
      {DEAL_STAGES.map((stg) => { const list = deals.filter((d) => d.stage === stg.key); if (!list.length) return null; const sum = list.reduce((a, d) => a + valOf(d), 0);
        return (<div className="grp" key={stg.key}><div className="grp-h"><span className={`dot s-${stg.key}`} />{stg.label}<span className="grp-m">{list.length} · {money(sum)}</span></div>
          {list.map((d) => { const od = d.due && d.due < today() && ACTIVE_KEYS.includes(d.stage); const hotD = d.due && !od && daysSince(d.due) >= -2 && ACTIVE_KEYS.includes(d.stage); const op = openDeal === d.id; const cl = clients.find((c) => c.id === d.clientId);
            return (<div className={`deal ${op ? "open" : ""}`} key={d.id}><div className="deal-top">
              <button className="deal-main" onClick={() => setOpenDeal(op ? null : d.id)}><div className="deal-n">{d.client || "Без названия"}{cl && <span className="deal-cl"><Contact size={11} />{cl.name}</span>}</div><div className="deal-t"><span className="chip">{d.vertical}</span><span className="chip">{d.service}</span><span className="deal-v">{money(valOf(d))}</span>{paidOf(d) > 0 && <span className="deal-pd">+{money(paidOf(d))}</span>}{d.due && <span className={`deal-d ${od ? "od" : hotD ? "hot" : ""}`}>{od ? "просрочен " : hotD ? "горит " : ""}{d.due}</span>}</div>{d.next && <div className="deal-next"><ArrowRight size={12} />{d.next}</div>}</button>
              <select className="sel sel-st" value={d.stage} onChange={(e) => { updDeal(d.id, { stage: e.target.value }); saveRow("deals", dealToDB({ ...d, stage: e.target.value })); }}>{DEAL_STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}</select></div>
              {op && dealEditor(d)}</div>); })}</div>); })}
      {!deals.length && <div className="empty">Заказов нет. Жми «+ заказ».</div>}
    </div>
  );

  const clientsView = (
    <div>
      <div className="bar"><div className="lede">Клиенты — актив для удержания. Возвращайся к ним, а не лови разовые сделки.</div><button className="btn" onClick={addCli}><Plus size={15} />клиент</button></div>
      {clients.map((c) => { const ag = cliAgg(c.id); const op = openClient === c.id; const st = CLIENT_STATUS.find((s) => s.k === c.status) || CLIENT_STATUS[0]; const dl = daysSince(c.lastContact);
        return (<div className={`deal ${op ? "open" : ""}`} key={c.id}><div className="deal-top">
          <button className="deal-main" onClick={() => setOpenClient(op ? null : c.id)}><div className="deal-n">{c.name}<span className={`badge ${st.cls}`}>{st.label}</span></div><div className="deal-t"><span className="chip">{c.vertical}</span><span className="chip">{ag.count} зак. · {money(ag.total)}</span>{c.contact && <span className="chip">{c.contact}</span>}<span className={`deal-d ${dl >= 14 ? "od" : ""}`}>{c.lastContact ? `${dl} дн.` : "нет контакта"}</span></div></button>
          <button className="touch" onClick={(e) => { e.stopPropagation(); contacted(c.id); }}><Phone size={13} />связ.</button></div>
          {op && (<div className="edit">
            <label className="fld"><span>Имя / проект</span><input className="inp" value={c.name || ""} onChange={(e) => updCli(c.id, { name: e.target.value })} onBlur={() => commitCli(c.id)} /></label>
            <div className="fld2"><label className="fld"><span>Контакт</span><input className="inp" value={c.contact || ""} onChange={(e) => updCli(c.id, { contact: e.target.value })} onBlur={() => commitCli(c.id)} placeholder="@tg / email" /></label><label className="fld"><span>Вертикаль</span><select className="sel" value={c.vertical} onChange={(e) => { updCli(c.id, { vertical: e.target.value }); saveRow("clients", cliToDB({ ...c, vertical: e.target.value })); }}>{VERTICALS.map((v) => <option key={v}>{v}</option>)}</select></label></div>
            <div className="fld2"><label className="fld"><span>Статус</span><select className="sel" value={c.status} onChange={(e) => { updCli(c.id, { status: e.target.value }); saveRow("clients", cliToDB({ ...c, status: e.target.value })); }}>{CLIENT_STATUS.map((s) => <option key={s.k} value={s.k}>{s.label}</option>)}</select></label><label className="fld"><span>Последний контакт</span><input className="inp" type="date" value={c.lastContact || ""} onChange={(e) => { updCli(c.id, { lastContact: e.target.value }); saveRow("clients", cliToDB({ ...c, lastContact: e.target.value })); }} /></label></div>
            <label className="fld"><span>Заметка</span><input className="inp" value={c.note || ""} onChange={(e) => updCli(c.id, { note: e.target.value })} onBlur={() => commitCli(c.id)} placeholder="контекст" /></label>
            <button className="del" onClick={() => delCli(c.id)}><Trash2 size={13} />удалить</button></div>)}</div>); })}
      {!clients.length && <div className="empty">Клиентов нет. Жми «+ клиент».</div>}
    </div>
  );

  const followup = (
    <div>
      <div className="note tip"><Bell size={15} /><div>Дожим — против «теряю деньги после оплаты». Тут то, к чему вернуться сегодня.</div></div>
      <div className="panel"><div className="ph">Просрочено ({overdue.length})</div>{!overdue.length && <div className="empty sm">Нет просрочек.</div>}{overdue.map((d) => <div className="fu" key={d.id}><span className="fu-d bad" /><div><div className="rt">{d.client || "без названия"} · {d.next || "нет шага"}</div><div className="fu-m">срок был {d.due}</div></div><button className="mini" onClick={() => { go("deals"); setSub("board"); setOpenDeal(d.id); }}>открыть</button></div>)}</div>
      <div className="panel"><div className="ph">Горит ({hot.length})</div>{!hot.length && <div className="empty sm">Ничего не горит.</div>}{hot.map((d) => <div className="fu" key={d.id}><span className="fu-d hot" /><div><div className="rt">{d.client || "без названия"} · {d.next || "нет шага"}</div><div className="fu-m">срок {d.due}</div></div><button className="mini" onClick={() => { go("deals"); setSub("board"); setOpenDeal(d.id); }}>открыть</button></div>)}</div>
      <div className="panel"><div className="ph">Остывшие лиды ({coldLeads.length})</div>{!coldLeads.length && <div className="empty sm">Нет висящих лидов.</div>}{coldLeads.map((d) => <div className="fu" key={d.id}><span className="fu-d" /><div><div className="rt">{d.client || "без названия"}</div><div className="fu-m">{d.next || "квалифицировать"}</div></div><button className="mini" onClick={() => { go("deals"); setSub("board"); setOpenDeal(d.id); }}>открыть</button></div>)}</div>
      <div className="panel"><div className="ph">Пора касание ({reTouch.length})</div>{!reTouch.length && <div className="empty sm">Все на контакте.</div>}{reTouch.map((c) => <div className="fu" key={c.id}><span className="fu-d acc" /><div><div className="rt">{c.name}</div><div className="fu-m">{daysSince(c.lastContact)} дн. без контакта · предложи повтор/апсейл</div></div><button className="mini" onClick={() => contacted(c.id)}>связ.</button></div>)}</div>
    </div>
  );

  const summary = (
    <div>
      <div className="cards"><div className="mc"><span>Получено</span><b className="ok">{money(m.cashIn)}</b></div><div className="mc"><span>Должны</span><b className="bad">{money(m.receivable)}</b></div><div className="mc"><span>Пайплайн</span><b>{money(m.pipeline)}</b></div><div className="mc"><span>Средний чек</span><b>{money(m.avg)}</b></div></div>
      <div className="panel"><div className="ph">2 метрики каждый день</div><div className="m2row"><div className="m2"><span>Клиентов в базе</span><b className="big">{clients.length}</b><i>+ холодная база: <input className="inp inp-mini" type="number" value={settings.baseContacts} onChange={(e) => setBase(e.target.value)} /></i></div><div className="m2"><span>Сделок в работе</span><b className="big">{m.actN}</b><i>{m.wonN} закрыто · {m.lostN} слито · конв. {m.conv}%</i></div></div></div>
      <div className="panel"><div className="ph">Цель по выручке / мес</div><div className="goalrow"><input className="inp inp-n" type="number" value={settings.goal} onChange={(e) => setGoal(e.target.value)} placeholder="0" /><div className="goalbar"><div className="gb-track"><div className="gb-fill" style={{ width: `${settings.goal > 0 ? Math.min(100, (m.cashIn / settings.goal) * 100) : 0}%` }} /></div><i>{money(m.cashIn)} из {money(settings.goal)} {settings.goal > 0 ? `· ${Math.round((m.cashIn / settings.goal) * 100)}%` : "— поставь планку"}</i></div></div></div>
      <div className="panel"><div className="ph">Деньги по стадиям</div>{m.byStage.map((s) => <div className="mbar" key={s.key}><span className="mb-l">{s.label}</span><div className="mb-track"><div className={`mb-fill s-${s.key}`} style={{ width: `${(s.sum / m.maxSum) * 100}%` }} /></div><span className="mb-v">{s.count} · {money(s.sum)}</span></div>)}</div>
    </div>
  );

  const pricesView = (
    <div>
      <div className="note tip"><DollarSign size={15} /><div>Цены редактируются — меняй прямо здесь, они подтянутся в сделки. Держи флор и маржу ≥50%.</div></div>
      {prices.length > 0 && <div className="panel"><div className="ph">Калькулятор маржи</div><div className="calc"><select className="sel" value={calc.idx} onChange={(e) => selectService(+e.target.value)}>{prices.map((p, i) => <option key={p.id} value={i}>{p.name}</option>)}</select><div className="fld2"><label className="fld"><span>Цена $</span><input className="inp" type="number" value={calc.price} onChange={(e) => setCalc({ ...calc, price: +e.target.value || 0 })} /></label><label className="fld"><span>Себестоимость $</span><input className="inp" type="number" value={calc.cost} onChange={(e) => setCalc({ ...calc, cost: +e.target.value || 0 })} /></label></div><div className={`co ${cCls}`}><div className="co-m"><b>{money(cMargin)}</b><span>{cPct}% маржи</span></div><div className="co-bar"><div className={`co-fill ${cCls}`} style={{ width: `${Math.max(0, Math.min(100, cPct))}%` }} /></div><i>{cPct < 50 ? "Ниже 50% — подними цену или делай сам" : cPct < 60 ? "На грани" : "Здоровая маржа"}{cSel ? ` · флор ${money(cSel.floor)}` : ""}</i></div></div></div>}
      <div className="panel"><div className="ph">Прайс-лист <button className="mini ml" onClick={addPrice}><Plus size={13} />услуга</button></div>
        {prices.map((p) => (<div className="ed-row" key={p.id}><input className="inp er-name" value={p.name || ""} onChange={(e) => updPrice(p.id, { name: e.target.value })} onBlur={() => commitPrice(p.id)} placeholder="название" /><div className="er-nums"><label>розн.<input className="inp er-n" type="number" value={p.retail} onChange={(e) => updPrice(p.id, { retail: +e.target.value || 0 })} onBlur={() => commitPrice(p.id)} /></label><label>флор<input className="inp er-n" type="number" value={p.floor} onChange={(e) => updPrice(p.id, { floor: +e.target.value || 0 })} onBlur={() => commitPrice(p.id)} /></label><label>себ.<input className="inp er-n" type="number" value={p.cost} onChange={(e) => updPrice(p.id, { cost: +e.target.value || 0 })} onBlur={() => commitPrice(p.id)} /></label><button className="del-x" onClick={() => delPrice(p.id)}><Trash2 size={14} /></button></div></div>))}
        {!prices.length && <div className="empty sm">Пусто. Если только что обновил базу — добавь услугу или проверь, что выполнил migration.sql.</div>}
      </div>
    </div>
  );

  const wholesaleView = (
    <div>
      <div className="note tip"><Tag size={15} /><div>Опт — только за объём и при предоплате, никогда ниже флора. Редактируй сетку здесь.</div></div>
      <div className="panel"><div className="ph">Оптовая сетка <button className="mini ml" onClick={addWh}><Plus size={13} />строка</button></div>
        {wholesale.map((w) => (<div className="ed-col" key={w.id}><div className="ed-col-h"><input className="inp er-name" value={w.name || ""} onChange={(e) => updWh(w.id, { name: e.target.value })} onBlur={() => commitWh(w.id)} placeholder="услуга" /><button className="del-x" onClick={() => delWh(w.id)}><Trash2 size={14} /></button></div><div className="fld2"><label className="fld"><span>розница</span><input className="inp" value={w.retail || ""} onChange={(e) => updWh(w.id, { retail: e.target.value })} onBlur={() => commitWh(w.id)} placeholder="$45" /></label><label className="fld"><span>флор $</span><input className="inp" type="number" value={w.floor} onChange={(e) => updWh(w.id, { floor: +e.target.value || 0 })} onBlur={() => commitWh(w.id)} /></label></div><label className="fld"><span>условия опта</span><input className="inp" value={w.tiers || ""} onChange={(e) => updWh(w.id, { tiers: e.target.value })} onBlur={() => commitWh(w.id)} placeholder="40+ = $10 ..." /></label></div>))}
        {!wholesale.length && <div className="empty sm">Пусто. Добавь строку или проверь migration.sql.</div>}
      </div>
    </div>
  );

  const packagesView = (
    <div>
      <div className="note tip"><Package size={15} /><div>Пакеты — уйти от поштучно и поднять чек. Редактируй и добавляй свои.</div></div>
      <div className="bar"><div className="lede">Готовые предложения для клиентов.</div><button className="btn" onClick={addPack}><Plus size={15} />пакет</button></div>
      {packages.map((p) => (<div className="panel" key={p.id}><div className="ed-col-h"><input className="inp er-name" value={p.name || ""} onChange={(e) => updPack(p.id, { name: e.target.value })} onBlur={() => commitPack(p.id)} placeholder="название" /><button className="del-x" onClick={() => delPack(p.id)}><Trash2 size={14} /></button></div><div className="fld2"><label className="fld"><span>состав</span><input className="inp" value={p.items || ""} onChange={(e) => updPack(p.id, { items: e.target.value })} onBlur={() => commitPack(p.id)} /></label><label className="fld"><span>цена</span><input className="inp" value={p.price || ""} onChange={(e) => updPack(p.id, { price: e.target.value })} onBlur={() => commitPack(p.id)} placeholder="$120" /></label></div><label className="fld"><span>заметка</span><input className="inp" value={p.note || ""} onChange={(e) => updPack(p.id, { note: e.target.value })} onBlur={() => commitPack(p.id)} /></label></div>))}
      {!packages.length && <div className="empty">Пакетов нет. Жми «+ пакет».</div>}
    </div>
  );

  const sales = (
    <div>
      <div className="note"><AlertTriangle size={15} /><div>Ты <b>отлично закрываешь первую сделку</b>, но теряешь деньги после оплаты. Узкое место — <b>удержание</b>.</div></div>
      <div className="panel"><div className="ph">Путь сделки (где утечка)</div>{SALES_PATH.map((s, i) => <div className="srow" key={i}><span className={`mk ${s.ok ? "ok" : "bad"}`}>{s.ok ? <Check size={13} strokeWidth={3} /> : "!"}</span><div><div className="rt">{s.s}</div>{s.fix && <div className="rf"><ArrowRight size={11} />{s.fix}</div>}</div></div>)}</div>
      <div className="panel"><div className="ph">Квалификация ДО цены</div><div className="qual">{QUAL.map((q, i) => <span className="q" key={i}>{q}</span>)}</div></div>
      <div className="panel"><div className="ph">Банк возражений</div>{OBJECTIONS.map((o, i) => <div className="obj" key={i}><div className="obj-q">{o.o}</div><div className="obj-r"><ArrowRight size={12} />{o.r}</div></div>)}</div>
    </div>
  );
  const partners = (<div><div className="note tip"><Users size={15} /><div>Партнёрства — реальный канал. Правило: делегируй только дорогое и не флагман, маржа ≥50%.</div></div>{PARTNERS.map((p, i) => <div className="panel" key={i}><div className="pn-t"><b>{p.name}</b><span className={`badge ${p.verdict === "осторожно" ? "bad" : "ok"}`}>{p.verdict}</span></div><div className="pn-now"><span className="pn-k">сейчас</span>{p.now}</div><div className="pn-r"><ArrowRight size={12} />{p.rule}</div></div>)}</div>);

  const load = (
    <div>
      <div className="bar"><div className="lede">Загрузка и перегруз — сигнал делегировать.</div><button className="btn" onClick={addTeam}><Plus size={15} />участник</button></div>
      {teamLoad.map((mm) => { const cap = +mm.capacity || 0; const pct = cap ? Math.min(100, (mm.load / cap) * 100) : 100;
        return (<div className={`member ${mm.over ? "over" : ""}`} key={mm.id}><div className="mem-r"><input className="inp mem-n" value={mm.name || ""} onChange={(e) => updTeam(mm.id, { name: e.target.value })} onBlur={() => commitTeam(mm.id)} />{mm.over ? <span className="badge bad">перегруз</span> : <span className="badge ok">ок</span>}<button className="del-x" onClick={() => delTeam(mm.id)}><Trash2 size={14} /></button></div><input className="inp mem-role" value={mm.role || ""} onChange={(e) => updTeam(mm.id, { role: e.target.value })} onBlur={() => commitTeam(mm.id)} placeholder="роль" /><div className="cap-top"><span>Загрузка {mm.load} / {cap} · {money(mm.value)}</span><span className="cap-e">лимит <input className="inp cap-in" type="number" value={mm.capacity} onChange={(e) => updTeam(mm.id, { capacity: +e.target.value || 0 })} onBlur={() => commitTeam(mm.id)} /></span></div><div className="track"><div className={`fill ${mm.over ? "bad" : pct > 75 ? "mid" : "ok"}`} style={{ width: `${pct}%` }} /></div></div>); })}
    </div>
  );

  const usersView = (
    <div>
      <div className="note"><Shield size={15} /><div>Команда регистрируется по ссылке сама. Тут ты задаёшь каждому <b>роль</b> и каким ролям какие разделы видны.</div></div>
      <div className="panel"><div className="ph"><UserCog size={13} /> Пользователи</div>{users.map((u) => <div className="urow" key={u.id}><input className="inp" value={u.name || ""} onChange={(e) => updUserName(u.id, e.target.value)} onBlur={() => commitUserName(u.id)} placeholder="имя" /><div className="urow-b"><select className="sel" value={u.role} onChange={(e) => updUserRole(u.id, e.target.value)}>{roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select>{u.id === session?.user?.id && <span className="badge acc">это ты</span>}</div></div>)}{!users.length && <div className="empty sm">Пока только ты. Остальные появятся после регистрации.</div>}</div>
      <div className="panel"><div className="ph"><Shield size={13} /> Роли и доступ к разделам</div>{roles.map((r) => <div className="role" key={r.id}><div className="role-h"><input className="inp role-n" value={r.name || ""} onChange={(e) => updRole(r.id, { name: e.target.value })} onBlur={() => commitRole(r.id)} />{r.id !== "owner" && <button className="del-x" onClick={() => delRole(r.id)}><Trash2 size={14} /></button>}</div><div className="acc">{SECTIONS.map((s) => <button key={s.key} className={`achip ${r.access?.includes(s.key) ? "on" : ""}`} onClick={() => toggleAccess(r.id, s.key)}>{r.access?.includes(s.key) && <Check size={11} strokeWidth={3} />}{s.label}</button>)}</div></div>)}<button className="btn ghost" onClick={addRole}><Plus size={14} />роль</button></div>
    </div>
  );

  const rulesView = (
    <div>
      <div className="note tip"><FileCheck size={15} /><div>Регламенты по разделам (для клиентов, дизайнеров и т.д.). Пиши как статью или прикладывай PDF. Можно добавлять, править, копировать, удалять.</div></div>
      <div className="bar"><div className="lede">Разделы: {regCats.join(", ") || "—"}</div><button className="btn" onClick={() => addReg()}><Plus size={15} />регламент</button></div>
      {regCats.map((cat) => (
        <div className="regcat" key={cat}>
          <div className="regcat-h">{cat}</div>
          {regs.filter((r) => (r.category || "Общие") === cat).map((r) => { const op = openReg === r.id;
            return (<div className={`deal ${op ? "open" : ""}`} key={r.id}>
              <div className="deal-top"><button className="deal-main" onClick={() => setOpenReg(op ? null : r.id)}><div className="deal-n"><FileText size={14} className="rico" />{r.title || "Без названия"}</div><div className="deal-t">{r.pdf_url && <span className="chip pdf">PDF</span>}{r.content && <span className="chip">статья</span>}</div></button>
                <div className="reg-acts"><button className="del-x" title="копировать" onClick={(e) => { e.stopPropagation(); copyReg(r); }}><Copy size={14} /></button></div></div>
              {op && (<div className="edit">
                <div className="fld2"><label className="fld"><span>Заголовок</span><input className="inp" value={r.title || ""} onChange={(e) => updReg(r.id, { title: e.target.value })} onBlur={() => commitReg(r.id)} /></label><label className="fld"><span>Раздел</span><input className="inp" value={r.category || ""} onChange={(e) => updReg(r.id, { category: e.target.value })} onBlur={() => commitReg(r.id)} placeholder="Клиенты / Дизайнеры…" /></label></div>
                <label className="fld"><span>Текст (статья)</span><textarea className="ta" value={r.content || ""} onChange={(e) => updReg(r.id, { content: e.target.value })} onBlur={() => commitReg(r.id)} placeholder="Пиши регламент здесь…" /></label>
                <div className="pdf-row">{r.pdf_url ? (<><a className="pdf-link" href={r.pdf_url} target="_blank" rel="noreferrer"><FileText size={14} />{r.pdf_name || "Открыть PDF"}</a><button className="del-x" onClick={() => rmPdf(r)}><Trash2 size={14} /></button></>) : (<label className="mini up">{regBusy === r.id ? <Loader2 size={13} className="spin" /> : <Upload size={13} />}{regBusy === r.id ? "Загрузка…" : "Прикрепить PDF"}<input type="file" accept="application/pdf" style={{ display: "none" }} onChange={(e) => uploadPdf(r, e.target.files[0])} /></label>)}</div>
                <div className="reg-foot"><button className="mini" onClick={() => copyReg(r)}><Copy size={13} />копия</button><button className="del" onClick={() => delReg(r.id)}><Trash2 size={13} />удалить</button></div>
              </div>)}</div>);
          })}
        </div>
      ))}
      {!regs.length && <div className="empty">Регламентов нет. Жми «+ регламент». (Если только обновил базу — проверь, что выполнил migration.sql.)</div>}
      {ioMsg && <div className="note"><AlertTriangle size={15} /><div>{ioMsg}</div></div>}
    </div>
  );

  const channels = (
    <div className="flow">
      {PLATFORMS.map((p, i) => { const v = VERDICT[p.verdict]; const op = !!expanded[p.code]; const last = i === PLATFORMS.length - 1;
        return (<section className={`st ${op ? "open" : ""}`} key={p.code}><div className="rail"><span className={`node ${v.cls}`}><p.Icon size={14} strokeWidth={2.2} /></span>{!last && <span className="wire" />}</div>
          <div className="card"><button className="card-h" onClick={() => toggleExpand(p.code)}><div className="ch-l"><div className="ch-tag">{p.role}</div><div className="ch-n">{p.name}</div><div className="ch-h">{p.handle}</div><div className="ch-w">{p.roleLine}</div></div><div className="ch-r"><span className={`verdict ${v.cls}`}>{v.label}</span><ChevronDown className="chev" size={17} /></div></button>
            {op && <div className="card-b"><div className="state"><span className="state-k">статус</span>{p.status}</div>{p.tune.length > 0 && <div className="bl"><div className="bl-h">{p.verdict === "fix" ? "Чинить" : "Докрутить"}</div>{p.tune.map((t, idx) => { const id = `bt-${p.code}-${idx}`; const dn = !!done[id]; return (<div className={`srow ${dn ? "dn" : ""}`} key={id}><button className={`box ${dn ? "on" : ""}`} onClick={() => toggleDone(id)}>{dn && <Check size={12} strokeWidth={3} />}</button><div className="rt">{t}</div></div>); })}</div>}{p.leave.length > 0 && <div className="bl"><div className="bl-h">Не трогать</div>{p.leave.map((l, idx) => <div className="srow leave" key={idx}><span className="mk dim">—</span><div className="rt dim">{l}</div></div>)}</div>}</div>}</div></section>); })}
    </div>
  );
  const journey = (
    <div className="flow">
      {STAGES.map((s, i) => { const resolved = s.open.filter((_, idx) => done[`${s.code}-${idx}`]).length; const allR = s.open.length > 0 && resolved === s.open.length; const status = allR ? "ready" : s.v1; const st = STATUS[status]; const op = !!expanded[s.code]; const last = i === STAGES.length - 1;
        return (<section className={`st ${op ? "open" : ""}`} key={s.code}><div className="rail"><span className={`node ${st.cls}`}><s.Icon size={14} strokeWidth={2.2} /></span>{!last && <span className="wire" />}</div>
          <div className="card"><button className="card-h" onClick={() => toggleExpand(s.code)}><div className="ch-l"><div className="ch-tag">{s.code} · {s.tag}</div><div className="ch-n">{s.title}</div></div><div className="ch-r"><span className={`badge ${st.cls}`}>{st.label}</span><ChevronDown className="chev" size={17} /></div></button>
            {op && <div className="card-b"><div className="state"><span className="state-k">сейчас</span>{s.v1s}</div>{s.closed.length > 0 && <div className="bl"><div className="bl-h">Уже закрыто</div>{s.closed.map((c, idx) => <div className="srow" key={idx}><span className="mk ok"><Check size={12} strokeWidth={3} /></span><div className="rt">{c}</div></div>)}</div>}{s.open.length > 0 && <div className="bl"><div className="bl-h">Дыры → как закрыть</div>{s.open.map((it, idx) => { const id = `${s.code}-${idx}`; const dn = !!done[id]; return (<div className={`srow ${dn ? "dn" : ""}`} key={id}><button className={`box ${dn ? "on" : ""}`} onClick={() => toggleDone(id)}>{dn && <Check size={12} strokeWidth={3} />}</button><div>{dn ? <div className="rt">{it.fix}</div> : <><div className="rt">{it.t}</div><div className="rf"><ArrowRight size={11} />{it.fix}</div></>}</div></div>); })}</div>}</div>}</div></section>); })}
    </div>
  );

  const overview = (
    <div>
      <div className="cards"><div className="mc"><span>Получено</span><b className="ok">{money(m.cashIn)}</b></div><div className="mc"><span>Должны</span><b className="bad">{money(m.receivable)}</b></div><div className="mc"><span>Активных</span><b>{m.actN}</b></div><div className="mc"><span>Клиентов</span><b>{clients.length}</b></div></div>
      {(overdue.length > 0 || reTouch.length > 0) && <div className="note"><Bell size={15} /><div>Требует касания: <b>{overdue.length}</b> просрочено, <b>{reTouch.length}</b> клиентов давно без контакта. Вкладка «Дожим».</div></div>}
      <div className="panel"><div className="ph">Куда смотреть</div>
        <button className="link-row" onClick={() => { go("home"); setSub("followup"); }}><Bell size={16} /><div><b>Дожим</b><span>вернись к тем, кто завис</span></div><ArrowRight size={15} /></button>
        <button className="link-row" onClick={() => { go("deals"); setSub("board"); }}><ClipboardList size={16} /><div><b>Заказы</b><span>двигай сделки — деньги на столе</span></div><ArrowRight size={15} /></button>
        <button className="link-row" onClick={() => { go("more"); setSub("rules"); }}><FileCheck size={16} /><div><b>Регламенты</b><span>фикс срывов сроков</span></div><ArrowRight size={15} /></button>
      </div>
    </div>
  );
  const focus = (<div><div className="panel"><div className="ph">Сделки — следующие шаги</div>{!activeNext.length && <div className="empty sm">Нет активных шагов.</div>}{activeNext.map((d) => { const od = d.due && d.due < today(); return (<div className="fu" key={d.id}><span className={`fu-d ${od ? "bad" : "acc"}`} /><div><div className="rt">{d.next}</div><div className="fu-m">{d.client || "без названия"} · {DEAL_STAGES.find((s) => s.key === d.stage)?.label}{d.due ? ` · ${od ? "просрочен " : "до "}${d.due}` : ""}</div></div></div>); })}</div><div className="panel"><div className="ph">Фронт — что докрутить</div>{front.slice(0, 6).map((f) => <div className={`srow ${f.done ? "dn" : ""}`} key={f.id}><button className={`box ${f.done ? "on" : ""}`} onClick={() => toggleDone(f.id)}>{f.done && <Check size={12} strokeWidth={3} />}</button><div><div className="rt">{f.text}</div><div className="wk-ch">{f.ch}</div></div></div>)}</div></div>);

  const SCREENS = { overview, focus, followup, summary, prices: pricesView, wholesale: wholesaleView, packages: packagesView, board, clients: clientsView, sales, partners, load, users: usersView, rules: rulesView, channels, journey };
  const curSection = SECTIONS.find((s) => s.key === section) || SECTIONS[0];

  /* ════ РЕНДЕР ════ */
  if (!ready) return <div className="cc"><style>{css}</style><Loader2 className="spin" size={24} /></div>;

  if (!session) {
    return (
      <div className="login-wrap"><style>{css}</style>
        <div className="login">
          <div className="login-logo">SR</div><div className="login-title">Кокпит</div><div className="login-sub">Stas Royce · ASO / iGaming</div>
          <div className="tabs2"><button className={`tab2 ${mode === "signin" ? "on" : ""}`} onClick={() => { setMode("signin"); setAuthMsg(""); }}>Войти</button><button className={`tab2 ${mode === "signup" ? "on" : ""}`} onClick={() => { setMode("signup"); setAuthMsg(""); }}>Регистрация</button></div>
          <input className="inp lf" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="inp lf" type="password" placeholder="пароль (мин. 6)" value={pw} onChange={(e) => setPw(e.target.value)} />
          {authMsg && <div className="lmsg">{authMsg}</div>}
          <button className="btn full" disabled={busy} onClick={mode === "signin" ? signIn : signUp}>{busy ? "..." : mode === "signin" ? "Войти" : "Зарегистрироваться"}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app"><style>{css}</style>
      <div className="topbar"><div className="tb-in"><div className="brand"><span className="logo">SR</span><div><div className="brand-n">Кокпит</div><div className="brand-s">Stas Royce</div></div></div><button className="me" onClick={signOut}><span className="me-av">{(myProfile?.name || session.user.email || "?").slice(0, 1).toUpperCase()}</span><div className="me-i"><b>{myProfile?.name || session.user.email}</b><span>{myRole?.name || "—"}</span></div><LogOut size={15} /></button></div></div>
      {loading ? (
        <div className="cc tall"><Loader2 className="spin" size={24} /><span className="cc-t">Загружаю данные…</span></div>
      ) : (
        <>
          <main className="main">
            <header className="ahead"><div className="atitle"><curSection.Icon size={19} />{curSection.label}</div><div className="pills">{curSection.subs.map((t) => <button key={t.k} className={`pill ${sub === t.k ? "on" : ""}`} onClick={() => setSub(t.k)}>{t.label}</button>)}</div></header>
            <div className="content">{visibleSections.length === 0 ? <div className="empty">Нет доступных разделов для роли.</div> : (SCREENS[sub] || overview)}</div>
          </main>
          <nav className="bnav"><div className="bnav-in">{visibleSections.map((s) => <button key={s.key} className={`bn ${section === s.key ? "on" : ""}`} onClick={() => go(s.key)}><s.Icon size={21} strokeWidth={2} /><span>{s.label}</span></button>)}</div></nav>
        </>
      )}
    </div>
  );
}

const css = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
*{box-sizing:border-box;}body{margin:0;}
.app,.login-wrap,.cc{--bg:#F5F6F8;--card:#FFF;--line:#E8EBEF;--line2:#DCE0E6;--txt:#101522;--mid:#5C6675;--dim:#98A1AE;--acc:#4F46E5;--acc-s:#EEEEFE;--ok:#16A34A;--ok-s:#E8F6EE;--ok-b:#BBE4C9;--warn:#D97706;--warn-s:#FCF2E4;--warn-b:#F0D7AE;--bad:#DC2626;--bad-s:#FCEDED;--bad-b:#F2C5C5;font-family:'Inter',-apple-system,sans-serif;color:var(--txt);}
.app{background:var(--bg);min-height:100vh;padding-bottom:74px;-webkit-font-smoothing:antialiased;}
button{font-family:inherit;cursor:pointer;border:none;background:none;color:inherit;}
input,select,textarea{font-family:inherit;}
.spin{animation:spin 1s linear infinite;}@keyframes spin{to{transform:rotate(360deg);}}
.cc{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg);color:var(--acc);gap:12px;flex-direction:column;}
.cc.tall{min-height:60vh;}.cc-t{font-size:13px;color:var(--mid);}

.login-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg);padding:24px;}
.login{width:100%;max-width:360px;background:var(--card);border:1px solid var(--line);border-radius:18px;padding:26px 24px;box-shadow:0 8px 40px -12px rgba(16,24,40,.12);}
.login-logo{width:44px;height:44px;border-radius:12px;background:var(--acc);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;}
.login-title{font-size:23px;font-weight:700;margin-top:16px;}.login-sub{font-size:13px;color:var(--mid);margin:2px 0 18px;}
.tabs2{display:flex;gap:6px;background:#F0F1F4;border-radius:11px;padding:4px;margin-bottom:16px;}
.tab2{flex:1;padding:8px 0;border-radius:8px;font-size:13.5px;font-weight:600;color:var(--mid);}.tab2.on{background:#fff;color:var(--txt);box-shadow:0 1px 2px rgba(16,24,40,.06);}
.lf{margin-bottom:10px;}.lmsg{font-size:12.5px;color:var(--mid);background:#F0F1F4;border-radius:9px;padding:9px 11px;margin-bottom:10px;line-height:1.45;}
.btn.full,.btn.full:hover{width:100%;justify-content:center;}

.topbar{position:sticky;top:0;z-index:20;background:rgba(245,246,248,.88);backdrop-filter:blur(10px);border-bottom:1px solid var(--line);}
.tb-in{max-width:680px;margin:0 auto;padding:12px 18px;display:flex;align-items:center;justify-content:space-between;gap:12px;}
.brand{display:flex;align-items:center;gap:11px;}.logo{width:34px;height:34px;border-radius:10px;background:var(--acc);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;}
.brand-n{font-weight:700;font-size:15px;line-height:1.1;}.brand-s{font-size:11px;color:var(--mid);}
.me{display:flex;align-items:center;gap:8px;padding:5px 10px 5px 5px;border:1px solid var(--line2);border-radius:99px;}.me:hover{border-color:var(--acc);}
.me-av{width:28px;height:28px;border-radius:8px;background:var(--acc-s);color:var(--acc);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;}
.me-i b{font-size:12.5px;display:block;line-height:1.1;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.me-i span{font-size:10.5px;color:var(--mid);}.me svg{color:var(--dim);}

.main{max-width:680px;margin:0 auto;padding:0 16px;}
.ahead{position:sticky;top:60px;z-index:10;background:var(--bg);padding:16px 0 10px;}
.atitle{display:flex;align-items:center;gap:9px;font-size:22px;font-weight:700;}.atitle svg{color:var(--acc);}
.pills{display:flex;gap:7px;margin-top:12px;overflow-x:auto;padding-bottom:2px;scrollbar-width:none;}.pills::-webkit-scrollbar{display:none;}
.pill{padding:7px 14px;border-radius:99px;background:var(--card);border:1px solid var(--line);font-size:13px;font-weight:500;color:var(--mid);white-space:nowrap;}.pill.on{background:var(--txt);color:#fff;border-color:var(--txt);}
.content{padding:6px 0 28px;}

.panel{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px 17px;margin-bottom:13px;box-shadow:0 1px 2px rgba(16,24,40,.03);}
.ph{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:var(--mid);text-transform:uppercase;margin-bottom:13px;}.ph svg{color:var(--acc);}
.ph .ml{margin-left:auto;text-transform:none;}
.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;margin-bottom:13px;}
.mc{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:13px;box-shadow:0 1px 2px rgba(16,24,40,.03);}
.mc span{font-size:11px;color:var(--mid);display:block;}.mc b{font-size:19px;font-weight:700;margin-top:5px;display:block;}.ok{color:var(--ok);}.bad{color:var(--bad);}
.note{display:flex;gap:10px;padding:13px 14px;border-radius:13px;background:var(--warn-s);border:1px solid var(--warn-b);font-size:13px;line-height:1.5;margin-bottom:13px;}.note svg{color:var(--warn);flex-shrink:0;margin-top:1px;}.note b{font-weight:600;}.note.tip{background:var(--acc-s);border-color:#DADBFB;}.note.tip svg{color:var(--acc);}
.bar{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:14px;}
.stats{display:flex;gap:8px;flex-wrap:wrap;}.stat{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:9px 13px;min-width:84px;}.stat b{font-size:16px;font-weight:700;display:block;}.stat span{font-size:11px;color:var(--mid);}
.lede{font-size:13px;color:var(--mid);max-width:420px;line-height:1.5;}
.btn{display:inline-flex;align-items:center;gap:6px;padding:9px 15px;border-radius:11px;background:var(--acc);color:#fff;font-size:13.5px;font-weight:600;white-space:nowrap;box-shadow:0 2px 8px -2px rgba(79,70,229,.5);}.btn:hover{background:#4338CA;}.btn.ghost{background:var(--card);color:var(--txt);border:1px solid var(--line2);box-shadow:none;margin-top:11px;}
.mini{display:inline-flex;align-items:center;gap:4px;padding:7px 10px;border-radius:8px;background:var(--acc-s);color:var(--acc);font-size:12px;font-weight:600;white-space:nowrap;}.mini:hover{background:#E2E2FD;}.mini[disabled]{opacity:.5;}
.ml{margin-left:auto;}

.ovr{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px;}.ov{background:var(--card);border:1px solid var(--line);border-radius:11px;padding:8px 11px;min-width:72px;}.ov-l{font-size:10px;color:var(--dim);display:block;}.ov b{font-size:16px;font-weight:700;}.ov-s{font-size:10.5px;color:var(--mid);}
.grp{margin-bottom:15px;}.grp-h{display:flex;align-items:center;gap:8px;font-size:11.5px;font-weight:600;text-transform:uppercase;color:var(--mid);margin-bottom:9px;}.grp-m{color:var(--dim);margin-left:auto;font-weight:500;}
.dot{width:8px;height:8px;border-radius:3px;}.s-lead{background:#94A1B0;}.s-qual{background:#5B9BD5;}.s-offer{background:var(--warn);}.s-work{background:var(--acc);}.s-review{background:#06B6D4;}.s-won{background:var(--ok);}.s-lost{background:var(--bad);}

.deal{background:var(--card);border:1px solid var(--line);border-radius:13px;margin-bottom:9px;box-shadow:0 1px 2px rgba(16,24,40,.03);overflow:hidden;}.deal.open{border-color:var(--line2);}
.deal-top{display:flex;align-items:flex-start;gap:10px;padding:13px;}.deal-main{flex:1;min-width:0;text-align:left;}
.deal-n{font-weight:600;font-size:15px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;}.rico{color:var(--acc);}
.deal-cl{display:inline-flex;align-items:center;gap:3px;font-size:11px;font-weight:500;color:var(--acc);background:var(--acc-s);padding:2px 7px;border-radius:6px;}
.deal-t{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-top:6px;}
.chip{font-size:11px;padding:3px 8px;border-radius:7px;background:var(--bg);border:1px solid var(--line);color:var(--mid);}.chip.pdf{color:var(--acc);background:var(--acc-s);border-color:#DADBFB;}
.deal-v{font-size:13px;font-weight:700;}.deal-pd{font-size:11px;font-weight:600;color:var(--ok);}
.deal-d{font-size:11px;color:var(--mid);}.deal-d.od{color:var(--bad);font-weight:600;}.deal-d.hot{color:var(--warn);font-weight:600;}
.deal-next{display:flex;align-items:center;gap:5px;font-size:12.5px;color:var(--mid);margin-top:7px;}.deal-next svg{color:var(--acc);flex-shrink:0;}
.touch{display:inline-flex;align-items:center;gap:5px;padding:7px 11px;border-radius:9px;background:var(--ok-s);color:var(--ok);border:1px solid var(--ok-b);font-size:12px;font-weight:600;flex-shrink:0;white-space:nowrap;}
.reg-acts{display:flex;gap:4px;flex-shrink:0;}
.sel{appearance:none;-webkit-appearance:none;background:var(--bg);border:1px solid var(--line2);color:var(--txt);font-size:12.5px;padding:8px 10px;border-radius:9px;cursor:pointer;}
.sel-st{flex-shrink:0;max-width:118px;color:var(--acc);font-weight:600;background:var(--acc-s);border-color:#DADBFB;}
.edit{padding:0 13px 14px;display:flex;flex-direction:column;gap:10px;border-top:1px solid var(--line);}
.fld{display:flex;flex-direction:column;gap:5px;margin-top:11px;}.fld>span{font-size:11px;color:var(--dim);font-weight:500;}
.fld2{display:flex;gap:10px;}.fld2 .fld{flex:1;min-width:0;}
.inp{background:var(--bg);border:1px solid var(--line2);color:var(--txt);font-size:13.5px;padding:9px 11px;border-radius:9px;width:100%;}.inp::placeholder{color:var(--dim);}
.ri{display:flex;gap:8px;align-items:center;}.ri .sel,.ri .inp{flex:1;}
.line{display:flex;gap:7px;align-items:center;margin-top:7px;}.line-s{flex:1;min-width:0;}.line-q{width:62px;text-align:center;}
.bal{display:flex;gap:14px;flex-wrap:wrap;font-size:12.5px;color:var(--mid);padding:10px 12px;background:var(--bg);border:1px solid var(--line);border-radius:10px;}.bal b{color:var(--txt);}
.ta{background:var(--bg);border:1px solid var(--line2);border-radius:9px;padding:10px 11px;font-size:13.5px;min-height:120px;resize:vertical;width:100%;line-height:1.5;color:var(--txt);}
.pdf-row{display:flex;gap:8px;align-items:center;}
.pdf-link{display:inline-flex;align-items:center;gap:6px;font-size:13px;color:var(--acc);text-decoration:none;background:var(--acc-s);border:1px solid #DADBFB;padding:8px 12px;border-radius:9px;}
.up{cursor:pointer;}
.reg-foot{display:flex;gap:8px;align-items:center;}
.del{display:inline-flex;align-items:center;gap:6px;padding:7px 12px;border-radius:8px;border:1px solid var(--bad-b);color:var(--bad);background:var(--bad-s);font-size:12px;font-weight:500;}
.del-x{color:var(--dim);padding:4px;}.del-x:hover{color:var(--bad);}
.empty{padding:26px;text-align:center;color:var(--dim);font-size:13.5px;border:1px dashed var(--line2);border-radius:13px;background:var(--card);}.empty.sm{padding:15px;font-size:12.5px;}
.regcat{margin-bottom:16px;}.regcat-h{font-size:12px;font-weight:700;text-transform:uppercase;color:var(--acc);margin:4px 0 10px;letter-spacing:.03em;}

.ed-row{display:flex;gap:10px;align-items:center;padding:9px 0;border-top:1px solid var(--line);flex-wrap:wrap;}.panel .ed-row:first-of-type{border-top:none;}
.er-name{flex:1;min-width:120px;}.er-nums{display:flex;gap:8px;align-items:center;}.er-nums label{font-size:10px;color:var(--dim);display:flex;flex-direction:column;gap:2px;}.er-n{width:60px;text-align:center;padding:7px 6px;}
.ed-col{padding:12px 0;border-top:1px solid var(--line);}.panel .ed-col:first-of-type{border-top:none;}.ed-col-h{display:flex;gap:8px;align-items:center;}

.m2row{display:flex;gap:11px;flex-wrap:wrap;}.m2{flex:1;min-width:150px;display:flex;flex-direction:column;gap:6px;padding:13px;border-radius:11px;background:var(--bg);border:1px solid var(--line);}.m2 span{font-size:12px;color:var(--mid);}.m2 i{font-size:11px;color:var(--dim);display:flex;align-items:center;gap:5px;}.m2 .big{font-size:25px;font-weight:700;color:var(--acc);}
.inp-mini{width:62px;padding:3px 6px;font-size:12px;}.inp-n{max-width:130px;font-size:17px;font-weight:700;}
.goalrow{display:flex;gap:12px;align-items:flex-start;}.goalbar{flex:1;padding-top:4px;}.gb-track{height:9px;border-radius:99px;background:var(--bg);border:1px solid var(--line);overflow:hidden;}.gb-fill{height:100%;background:linear-gradient(90deg,#6366F1,var(--acc));border-radius:99px;}.goalbar i{font-size:11.5px;color:var(--mid);display:block;margin-top:7px;}
.mbar{display:flex;align-items:center;gap:11px;margin-bottom:9px;}.mb-l{width:84px;font-size:12px;color:var(--mid);flex-shrink:0;}.mb-track{flex:1;height:8px;border-radius:99px;background:var(--bg);border:1px solid var(--line);overflow:hidden;}.mb-fill{height:100%;border-radius:99px;}.mb-v{font-size:11px;color:var(--mid);width:92px;text-align:right;flex-shrink:0;}

.calc{display:flex;flex-direction:column;gap:11px;}.co{padding:13px 14px;border-radius:12px;border:1px solid;}.co.ok{background:var(--ok-s);border-color:var(--ok-b);}.co.mid{background:var(--warn-s);border-color:var(--warn-b);}.co.bad{background:var(--bad-s);border-color:var(--bad-b);}
.co-m{display:flex;align-items:baseline;gap:10px;margin-bottom:9px;}.co-m b{font-size:23px;font-weight:700;}.co-m span{font-size:13px;color:var(--mid);font-weight:600;}.co.ok .co-m b{color:var(--ok);}.co.mid .co-m b{color:var(--warn);}.co.bad .co-m b{color:var(--bad);}
.co-bar{height:7px;border-radius:99px;background:rgba(0,0,0,.05);overflow:hidden;margin-bottom:8px;}.co-fill{height:100%;border-radius:99px;}.co-fill.ok{background:var(--ok);}.co-fill.mid{background:var(--warn);}.co-fill.bad{background:var(--bad);}.co i{font-size:12px;color:var(--mid);}

.srow{display:flex;gap:10px;padding:9px 0;border-top:1px solid var(--line);align-items:flex-start;}.panel .srow:first-of-type,.bl .srow:first-of-type{border-top:none;}
.rt{font-size:13.5px;line-height:1.5;}.rt.dim{color:var(--mid);}.rf{display:flex;gap:6px;font-size:12.5px;color:var(--mid);margin-top:5px;line-height:1.45;}.rf svg{color:var(--acc);flex-shrink:0;margin-top:3px;}.srow.dn .rt{color:var(--mid);}
.mk{width:19px;height:19px;border-radius:6px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;margin-top:1px;}.mk.ok{background:var(--ok-s);color:var(--ok);border:1px solid var(--ok-b);}.mk.bad{background:var(--bad-s);color:var(--bad);border:1px solid var(--bad-b);}.mk.dim{background:var(--bg);border:1px solid var(--line2);color:var(--dim);}
.box{width:20px;height:20px;border-radius:6px;border:1.5px solid var(--line2);flex-shrink:0;display:flex;align-items:center;justify-content:center;color:#fff;margin-top:1px;background:var(--card);}.box.on{background:var(--ok);border-color:var(--ok);}
.qual{display:flex;flex-wrap:wrap;gap:7px;}.q{font-size:12px;padding:6px 11px;border-radius:8px;background:var(--bg);border:1px solid var(--line2);color:var(--mid);}
.obj{padding:11px 0;border-top:1px solid var(--line);}.panel .obj:first-of-type{border-top:none;}.obj-q{font-size:13px;color:var(--bad);font-weight:500;}.obj-r{display:flex;gap:6px;font-size:12.5px;margin-top:6px;line-height:1.5;}.obj-r svg{color:var(--acc);flex-shrink:0;margin-top:3px;}
.pn-t{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px;}.pn-t b{font-size:15.5px;}.pn-now{font-size:13px;color:var(--mid);line-height:1.5;}.pn-k{font-size:10px;text-transform:uppercase;color:var(--dim);margin-right:8px;font-weight:600;}.pn-r{display:flex;gap:6px;font-size:13px;margin-top:9px;line-height:1.5;padding-top:9px;border-top:1px solid var(--line);}.pn-r svg{color:var(--acc);flex-shrink:0;margin-top:3px;}
.badge{font-size:11px;font-weight:600;padding:3px 9px;border-radius:99px;border:1px solid;white-space:nowrap;}.badge.ok{color:var(--ok);background:var(--ok-s);border-color:var(--ok-b);}.badge.bad{color:var(--bad);background:var(--bad-s);border-color:var(--bad-b);}.badge.mid{color:var(--warn);background:var(--warn-s);border-color:var(--warn-b);}.badge.acc{color:var(--acc);background:var(--acc-s);border-color:#DADBFB;}.badge.dim{color:var(--dim);background:var(--bg);border-color:var(--line2);}

.member{background:var(--card);border:1px solid var(--line);border-radius:13px;padding:14px;margin-bottom:10px;box-shadow:0 1px 2px rgba(16,24,40,.03);}.member.over{border-color:var(--bad-b);}
.mem-r{display:flex;align-items:center;gap:10px;}.mem-n{flex:1;font-weight:600;font-size:15px;background:transparent;border:none;padding:3px 0;}.mem-role{margin-top:6px;font-size:12.5px;background:transparent;border:none;color:var(--mid);padding:2px 0;}
.cap-top{display:flex;justify-content:space-between;align-items:center;font-size:12px;color:var(--mid);margin:12px 0 7px;gap:8px;flex-wrap:wrap;}.cap-e{display:inline-flex;align-items:center;gap:6px;color:var(--dim);font-size:11px;}.cap-in{width:52px;padding:5px 7px;font-size:12.5px;text-align:center;}
.track{height:8px;border-radius:99px;background:var(--bg);border:1px solid var(--line);overflow:hidden;}.fill{height:100%;border-radius:99px;}.fill.ok{background:var(--ok);}.fill.mid{background:var(--warn);}.fill.bad{background:var(--bad);}

.urow{display:flex;flex-direction:column;gap:8px;padding:11px 0;border-top:1px solid var(--line);}.panel .urow:first-of-type{border-top:none;}.urow-b{display:flex;gap:8px;align-items:center;}.urow-b .sel{flex:1;}
.role{padding:13px 0;border-top:1px solid var(--line);}.panel .role:first-of-type{border-top:none;}.role-h{display:flex;align-items:center;gap:8px;margin-bottom:9px;}.role-n{flex:1;font-weight:600;font-size:14.5px;background:transparent;border:none;}.acc{display:flex;flex-wrap:wrap;gap:6px;}.achip{display:inline-flex;align-items:center;gap:5px;padding:6px 11px;border-radius:8px;border:1px solid var(--line2);background:var(--bg);font-size:12px;color:var(--mid);}.achip.on{background:var(--acc-s);border-color:#C9CBFA;color:var(--acc);font-weight:600;}

.fu{display:flex;gap:11px;align-items:flex-start;padding:11px 0;border-top:1px solid var(--line);}.panel .fu:first-of-type{border-top:none;}.fu-d{width:8px;height:8px;border-radius:99px;background:var(--line2);margin-top:5px;flex-shrink:0;}.fu-d.bad{background:var(--bad);}.fu-d.hot{background:var(--warn);}.fu-d.acc{background:var(--acc);}.fu>div{flex:1;min-width:0;}.fu-m{font-size:11.5px;color:var(--dim);margin-top:3px;}.wk-ch{font-size:11px;color:var(--acc);margin-top:4px;}
.link-row{width:100%;display:flex;align-items:center;gap:12px;padding:12px 0;border-top:1px solid var(--line);text-align:left;}.panel .link-row:first-of-type{border-top:none;}.link-row>svg:first-child{color:var(--acc);flex-shrink:0;}.link-row div{flex:1;}.link-row b{font-size:14px;display:block;}.link-row span{font-size:12px;color:var(--mid);}.link-row>svg:last-child{color:var(--dim);}

.flow{margin-top:2px;}.st{display:grid;grid-template-columns:34px 1fr;gap:12px;}.rail{display:flex;flex-direction:column;align-items:center;}
.node{width:32px;height:32px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;border:1px solid var(--line2);background:var(--card);}.node.ok{color:var(--ok);border-color:var(--ok-b);background:var(--ok-s);}.node.mid,.node.fix{color:var(--warn);border-color:var(--warn-b);background:var(--warn-s);}.node.bad{color:var(--bad);border-color:var(--bad-b);background:var(--bad-s);}.node.tune{color:var(--acc);border-color:#DADBFB;background:var(--acc-s);}.node.skip{color:var(--dim);border-color:var(--line2);background:var(--bg);}
.wire{flex:1;width:2px;min-height:22px;margin:3px 0;background:var(--line2);border-radius:2px;}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;margin-bottom:10px;box-shadow:0 1px 2px rgba(16,24,40,.03);overflow:hidden;}.st.open .card{border-color:var(--line2);}
.card-h{width:100%;display:flex;align-items:flex-start;gap:12px;padding:14px;text-align:left;}.ch-l{flex:1;min-width:0;}.ch-tag{font-size:10.5px;font-weight:600;letter-spacing:.1em;color:var(--acc);}.ch-n{font-weight:600;font-size:16px;margin-top:3px;}.ch-h{font-size:11px;color:var(--dim);margin-top:2px;}.ch-w{font-size:12.5px;color:var(--mid);margin-top:5px;line-height:1.45;}
.ch-r{display:flex;align-items:center;gap:9px;flex-shrink:0;}.verdict{font-size:10.5px;font-weight:600;padding:4px 9px;border-radius:99px;border:1px solid;white-space:nowrap;}.verdict.tune{color:var(--acc);background:var(--acc-s);border-color:#DADBFB;}.verdict.fix{color:var(--warn);background:var(--warn-s);border-color:var(--warn-b);}.verdict.skip{color:var(--dim);background:var(--bg);border-color:var(--line2);}
.chev{color:var(--dim);transition:transform .2s;}.st.open .chev{transform:rotate(180deg);}.card-b{padding:2px 14px 16px;}
.state{display:flex;gap:10px;padding:11px 12px;background:var(--bg);border:1px solid var(--line);border-radius:10px;margin-bottom:13px;font-size:13px;line-height:1.5;}.state-k{font-size:10px;text-transform:uppercase;color:var(--dim);font-weight:600;flex-shrink:0;padding-top:2px;}
.bl{margin-bottom:12px;}.bl:last-child{margin-bottom:0;}.bl-h{font-size:10.5px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);margin-bottom:9px;}

.bnav{position:fixed;bottom:0;left:0;right:0;z-index:30;background:rgba(255,255,255,.93);backdrop-filter:blur(12px);border-top:1px solid var(--line);}
.bnav-in{max-width:680px;margin:0 auto;display:flex;padding:6px 6px calc(6px + env(safe-area-inset-bottom));}
.bn{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:7px 2px;border-radius:12px;color:var(--dim);font-size:10.5px;font-weight:500;}.bn.on{color:var(--acc);}
input:focus,select:focus,textarea:focus,button:focus-visible{outline:2px solid var(--acc);outline-offset:1px;}
@media (max-width:560px){.cards{grid-template-columns:repeat(2,1fr);}.fld2{flex-direction:column;gap:0;}.atitle{font-size:20px;}.mb-l{width:66px;}.mb-v{width:78px;}.er-nums{width:100%;justify-content:space-between;}}
`;
