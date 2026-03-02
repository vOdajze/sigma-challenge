export const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const formatDate = (d: string) =>
  new Date(d).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });

export const formatAPIDate = (d: Date) => d.toISOString().split("T")[0];

export const formatDisplayDate = (d: Date) => d.toLocaleDateString("pt-BR");
