export const money = (n) => "$" + (Number(n) || 0).toLocaleString("ru-RU");

export const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("ru-RU");
};

export const daysSince = (d) => {
  if (!d) return 999;
  return Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
};

export const today = () => new Date().toISOString().slice(0, 10);

export const uid = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now();
};

export const truncate = (str, maxLength) => {
  if (!str) return "";
  return str.length > maxLength ? str.slice(0, maxLength) + "..." : str;
};
