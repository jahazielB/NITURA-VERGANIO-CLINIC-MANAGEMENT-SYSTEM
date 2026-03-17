export const numOrNull = (v) =>
  v === "" || v === null ? null : Number.isFinite(Number(v)) ? Number(v) : null;
export const calcBmi = (w, h) => (w && h ? w / (h / 100) ** 2 : null);
