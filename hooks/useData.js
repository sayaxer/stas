import { useState, useEffect } from "react";
import { loadAllData } from "../lib/supabaseQueries.js";

export const useData = (session) => {
  const [data, setData] = useState({
    clients: [],
    deals: [],
    team: [],
    roles: [],
    users: [],
    prices: [],
    packages: [],
    wholesale: [],
    regulations: [],
    done: {},
    settings: { baseContacts: 0, goal: 0 },
  });
  const [loading, setLoading] = useState(false);

  const resetData = () => {
    setData({
      clients: [],
      deals: [],
      team: [],
      roles: [],
      users: [],
      prices: [],
      packages: [],
      wholesale: [],
      regulations: [],
      done: {},
      settings: { baseContacts: 0, goal: 0 },
    });
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await loadAllData();
      setData(result);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      loadData();
    } else {
      resetData();
    }
  }, [session]);

  const updateData = (key, value) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  return {
    data,
    loading,
    loadData,
    updateData,
    resetData,
  };
};
