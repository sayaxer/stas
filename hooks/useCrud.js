import { useState, useCallback } from "react";
import { saveRow, dropRow } from "../lib/supabaseQueries.js";
import { dealToDB, cliToDB } from "../utils/dealHelpers.js";
import { uid } from "../utils/formatters.js";
import toast from "react-hot-toast";

export const useCrud = (table, mapper, initialState = []) => {
  const [items, setItems] = useState(initialState);

  const addItem = useCallback(
    (item) => {
      const newItem = { ...item, id: uid() };
      setItems((prev) => [newItem, ...prev]);
      saveRow(table, mapper(newItem)).catch(() => {
        setItems((prev) => prev.filter((i) => i.id !== newItem.id));
      });
      return newItem;
    },
    [table, mapper]
  );

  const updateItem = useCallback(
    (id, updates) => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );
    },
    []
  );

  const commitItem = useCallback(
    (id) => {
      const item = items.find((i) => i.id === id);
      if (item) {
        saveRow(table, mapper(item));
      }
    },
    [items, table, mapper]
  );

  const deleteItem = useCallback(
    (id) => {
      setItems((prev) => prev.filter((item) => item.id !== id));
      dropRow(table, id);
    },
    [table]
  );

  return {
    items,
    setItems,
    addItem,
    updateItem,
    commitItem,
    deleteItem,
  };
};
