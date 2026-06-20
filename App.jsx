import React, { useState, useEffect } from "react";
import { supabase } from "./supabase.js";
import { LogOut, Plus, Trash2, Loader2 } from "lucide-react";

const VERTICALS = ["iGaming", "Crypto", "Dating", "Affiliate", "Белая", "Другое"];

export default function App() {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [authMsg, setAuthMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [profile, setProfile] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) { loadProfile(); loadClients(); }
    else { setProfile(null); setClients([]); }
  }, [session]); // eslint-disable-line

  const loadProfile = async () => {
    const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
    setProfile(data);
  };
  const loadClients = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
    if (error) setAuthMsg(error.message);
    setClients(data || []);
    setLoading(false);
  };

  const signIn = async () => { setBusy(true); setAuthMsg(""); const { error } = await supabase.auth.signInWithPassword({ email, password: pw }); if (error) setAuthMsg(error.message); setBusy(false); };
  const signUp = async () => { setBusy(true); setAuthMsg(""); const { error } = await supabase.auth.signUp({ email, password: pw }); if (error) setAuthMsg(error.message); else setAuthMsg("Готово. Если включено подтверждение email — проверь почту. Иначе нажми «Войти»."); setBusy(false); };
  const signOut = async () => { await supabase.auth.signOut(); };

  const addClient = async () => {
    const c = { name: "Новый клиент", vertical: "iGaming", status: "new" };
    const { data, error } = await supabase.from("clients").insert(c).select().single();
    if (error) { setAuthMsg(error.message); return; }
    if (data) setClients([data, ...clients]);
  };
  const updClient = async (id, patch) => { setClients(clients.map((c) => (c.id === id ? { ...c, ...patch } : c))); await supabase.from("clients").update(patch).eq("id", id); };
  const delClient = async (id) => { setClients(clients.filter((c) => c.id !== id)); await supabase.from("clients").delete().eq("id", id); };

  if (!ready) return <div style={S.center}><style>{css}</style><Loader2 className="spin" size={22} /></div>;

  if (!session) {
    return (
      <div style={S.wrap}><style>{css}</style>
        <div style={S.card}>
          <div style={S.logo}>SR</div>
          <h1 style={S.h1}>Кокпит</h1>
          <p style={S.sub}>Вход для команды</p>
          <div style={S.tabs}>
            <button style={{ ...S.tab, ...(mode === "signin" ? S.tabOn : {}) }} onClick={() => { setMode("signin"); setAuthMsg(""); }}>Войти</button>
            <button style={{ ...S.tab, ...(mode === "signup" ? S.tabOn : {}) }} onClick={() => { setMode("signup"); setAuthMsg(""); }}>Регистрация</button>
          </div>
          <input style={S.inp} placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input style={S.inp} type="password" placeholder="пароль (мин. 6 символов)" value={pw} onChange={(e) => setPw(e.target.value)} />
          {authMsg && <div style={S.msg}>{authMsg}</div>}
          <button style={S.btn} disabled={busy} onClick={mode === "signin" ? signIn : signUp}>{busy ? "..." : mode === "signin" ? "Войти" : "Зарегистрироваться"}</button>
        </div>
      </div>
    );
  }

  return (
    <div style={S.app}><style>{css}</style>
      <header style={S.head}>
        <div style={S.hl}><b>Кокпит</b><span style={S.dim}>· {profile?.name || session.user.email}</span><span style={S.role}>{profile?.role || "—"}</span></div>
        <button style={S.ghost} onClick={signOut}><LogOut size={15} /> выйти</button>
      </header>
      <main style={S.main}>
        <div style={S.barRow}><h2 style={S.h2}>Клиенты</h2><button style={S.btnS} onClick={addClient}><Plus size={15} /> клиент</button></div>
        <p style={S.note}>Это общий список из базы Supabase — все, кто вошёл, видят и меняют одно и то же. Так проверяем, что сервер, вход и доступ работают. Обнови страницу у второго аккаунта — увидишь те же данные.</p>
        {loading && <div style={S.dim}>Загрузка…</div>}
        {clients.map((c) => (
          <div key={c.id} style={S.client}>
            <input style={S.cin} value={c.name || ""} onChange={(e) => updClient(c.id, { name: e.target.value })} />
            <select style={S.sel} value={c.vertical || "iGaming"} onChange={(e) => updClient(c.id, { vertical: e.target.value })}>{VERTICALS.map((v) => <option key={v}>{v}</option>)}</select>
            <button style={S.del} onClick={() => delClient(c.id)}><Trash2 size={14} /></button>
          </div>
        ))}
        {!clients.length && !loading && <div style={S.empty}>Пусто. Добавь клиента — он сохранится в общей базе.</div>}
      </main>
    </div>
  );
}

const S = {
  center: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F5F6F8", color: "#4F46E5" },
  wrap: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F5F6F8", padding: 24, fontFamily: "Inter,-apple-system,sans-serif" },
  card: { width: "100%", maxWidth: 360, background: "#fff", border: "1px solid #E8EBEF", borderRadius: 18, padding: "26px 24px", boxShadow: "0 8px 40px -12px rgba(16,24,40,.12)" },
  logo: { width: 44, height: 44, borderRadius: 12, background: "#4F46E5", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16 },
  h1: { fontSize: 23, fontWeight: 700, margin: "16px 0 0", color: "#101522", fontFamily: "Inter,sans-serif" },
  sub: { fontSize: 13, color: "#5C6675", margin: "2px 0 18px" },
  tabs: { display: "flex", gap: 6, background: "#F0F1F4", borderRadius: 11, padding: 4, marginBottom: 16 },
  tab: { flex: 1, padding: "8px 0", borderRadius: 8, border: "none", background: "none", fontSize: 13.5, fontWeight: 600, color: "#5C6675", cursor: "pointer", fontFamily: "inherit" },
  tabOn: { background: "#fff", color: "#101522", boxShadow: "0 1px 2px rgba(16,24,40,.06)" },
  inp: { width: "100%", padding: "11px 12px", border: "1px solid #DCE0E6", borderRadius: 10, fontSize: 14, marginBottom: 10, fontFamily: "inherit", boxSizing: "border-box" },
  msg: { fontSize: 12.5, color: "#5C6675", background: "#F0F1F4", borderRadius: 9, padding: "9px 11px", marginBottom: 10, lineHeight: 1.45 },
  btn: { width: "100%", padding: "11px 0", border: "none", borderRadius: 11, background: "#4F46E5", color: "#fff", fontSize: 14.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  app: { minHeight: "100vh", background: "#F5F6F8", fontFamily: "Inter,-apple-system,sans-serif", color: "#101522" },
  head: { background: "#fff", borderBottom: "1px solid #E8EBEF", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
  hl: { display: "flex", alignItems: "center", gap: 8, fontSize: 15, flexWrap: "wrap" },
  dim: { color: "#5C6675", fontSize: 13, fontWeight: 400 },
  role: { fontSize: 11, fontWeight: 600, color: "#4F46E5", background: "#EEEEFE", border: "1px solid #DADBFB", borderRadius: 99, padding: "2px 9px" },
  ghost: { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 12px", border: "1px solid #DCE0E6", borderRadius: 10, background: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer", color: "#101522", fontFamily: "inherit" },
  main: { maxWidth: 640, margin: "0 auto", padding: "22px 16px 60px" },
  barRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
  h2: { fontSize: 22, fontWeight: 700, margin: 0 },
  btnS: { display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 14px", border: "none", borderRadius: 11, background: "#4F46E5", color: "#fff", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  note: { fontSize: 12.5, color: "#5C6675", background: "#EEEEFE", border: "1px solid #DADBFB", borderRadius: 12, padding: "12px 14px", margin: "14px 0", lineHeight: 1.5 },
  client: { display: "flex", gap: 9, alignItems: "center", background: "#fff", border: "1px solid #E8EBEF", borderRadius: 12, padding: 10, marginBottom: 9 },
  cin: { flex: 1, padding: "9px 11px", border: "1px solid #DCE0E6", borderRadius: 9, fontSize: 14, fontFamily: "inherit", minWidth: 0 },
  sel: { padding: "9px 10px", border: "1px solid #DCE0E6", borderRadius: 9, fontSize: 13, background: "#F5F6F8", fontFamily: "inherit", cursor: "pointer" },
  del: { padding: 8, border: "none", background: "none", color: "#98A1AE", cursor: "pointer" },
  empty: { padding: 26, textAlign: "center", color: "#98A1AE", fontSize: 13.5, border: "1px dashed #DCE0E6", borderRadius: 13, background: "#fff" },
};

const css = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
body{margin:0;}
.spin{animation:spin 1s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}
input:focus,select:focus,button:focus-visible{outline:2px solid #4F46E5;outline-offset:1px;}
`;
