import { supabase } from "./supabase.js";
import { dealFromDB, dealToDB, cliFromDB, cliToDB } from "../utils/dealHelpers.js";
import toast from "react-hot-toast";

export const loadAllData = async () => {
  try {
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

    if (cl.error) throw new Error(`Clients: ${cl.error.message}`);
    if (dl.error) throw new Error(`Deals: ${dl.error.message}`);
    if (tm.error) throw new Error(`Team: ${tm.error.message}`);
    if (rl.error) throw new Error(`Roles: ${rl.error.message}`);
    if (pf.error) throw new Error(`Profiles: ${pf.error.message}`);
    if (pr.error) throw new Error(`Prices: ${pr.error.message}`);
    if (pk.error) throw new Error(`Packages: ${pk.error.message}`);
    if (wh.error) throw new Error(`Wholesale: ${wh.error.message}`);
    if (rg.error) throw new Error(`Regulations: ${rg.error.message}`);
    if (pg.error) throw new Error(`Progress: ${pg.error.message}`);
    if (st.error) throw new Error(`Settings: ${st.error.message}`);

    const done = {};
    (pg.data || []).forEach((r) => {
      if (r.done) done[r.key] = true;
    });

    const settings = st.data
      ? {
          baseContacts: st.data.base_contacts || 0,
          goal: +st.data.goal || 0,
        }
      : { baseContacts: 0, goal: 0 };

    return {
      clients: (cl.data || []).map(cliFromDB),
      deals: (dl.data || []).map(dealFromDB),
      team: tm.data || [],
      roles: rl.data || [],
      users: (pf.data || []).map((p) => ({
        id: p.id,
        name: p.name || "",
        role: p.role || "designer",
      })),
      prices: pr.data || [],
      packages: pk.data || [],
      wholesale: wh.data || [],
      regulations: rg.data || [],
      done,
      settings,
    };
  } catch (error) {
    toast.error(`Ошибка загрузки: ${error.message}`);
    throw error;
  }
};

export const saveRow = async (table, row) => {
  try {
    const { error } = await supabase.from(table).upsert(row);
    if (error) {
      toast.error(`Ошибка сохранения ${table}: ${error.message}`);
      console.error("save", table, error.message);
      throw error;
    }
    return { success: true };
  } catch (error) {
    throw error;
  }
};

export const dropRow = async (table, id) => {
  try {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) {
      toast.error(`Ошибка удаления ${table}: ${error.message}`);
      console.error("del", table, error.message);
      throw error;
    }
    return { success: true };
  } catch (error) {
    throw error;
  }
};

export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      toast.error(error.message);
      throw error;
    }
    return { data, error: null };
  } catch (error) {
    throw error;
  }
};

export const signUp = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      toast.error(error.message);
      throw error;
    }
    toast.success("Регистрация успешна. Проверь почту или войди.");
    return { data, error: null };
  } catch (error) {
    throw error;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
      throw error;
    }
    return { success: true };
  } catch (error) {
    throw error;
  }
};

export const uploadPdf = async (regulationId, file) => {
  try {
    if (!file) return null;

    const path = `${regulationId}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("docs")
      .upload(path, file, { upsert: true });

    if (error) {
      toast.error(`Ошибка загрузки: ${error.message}`);
      throw error;
    }

    const { data } = supabase.storage.from("docs").getPublicUrl(path);
    return { publicUrl: data.publicUrl, fileName: file.name };
  } catch (error) {
    throw error;
  }
};

export const updateProfile = async (userId, updates) => {
  try {
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId);

    if (error) {
      toast.error(`Ошибка обновления профиля: ${error.message}`);
      throw error;
    }
    return { success: true };
  } catch (error) {
    throw error;
  }
};

export const updateSettings = async (settings) => {
  try {
    const { error } = await supabase
      .from("settings")
      .update({
        base_contacts: settings.baseContacts,
        goal: settings.goal,
      })
      .eq("id", 1);

    if (error) {
      toast.error(`Ошибка обновления настроек: ${error.message}`);
      throw error;
    }
    return { success: true };
  } catch (error) {
    throw error;
  }
};
