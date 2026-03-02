import type { DateRange } from "react-day-picker";

export type PeriodoPreset =
  | "hoje"
  | "ontem"
  | "esta_semana"
  | "este_mes"
  | "ultimos_30_dias"
  | "personalizado";

export const PERIODO_LABELS: Record<PeriodoPreset, string> = {
  hoje: "Hoje",
  ontem: "Ontem",
  esta_semana: "Esta semana",
  este_mes: "Este mês",
  ultimos_30_dias: "Últimos 30 dias",
  personalizado: "Personalizado",
};

export function getDateRangeForPeriodo(
  periodo: PeriodoPreset,
): DateRange | undefined {
  if (periodo === "personalizado") return undefined;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  switch (periodo) {
    case "hoje":
      return { from: today, to: today };
    case "ontem": {
      const d = new Date(today);
      d.setDate(d.getDate() - 1);
      return { from: d, to: d };
    }
    case "esta_semana": {
      const start = new Date(today);
      const day = today.getDay();
      start.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
      return { from: start, to: today };
    }
    case "este_mes": {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      return { from: start, to: today };
    }
    case "ultimos_30_dias": {
      const start = new Date(today);
      start.setDate(today.getDate() - 29);
      return { from: start, to: today };
    }
  }
}
