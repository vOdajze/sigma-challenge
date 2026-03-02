export const PALETA_CORES = [
  "#4ade80",
  "#60a5fa",
  "#f97316",
  "#a78bfa",
  "#fb923c",
  "#34d399",
  "#f472b6",
  "#facc15",
  "#38bdf8",
  "#e879f9",
  "#2dd4bf",
  "#fb7185",
];

const corPorUso: Record<string, string> = {};

export function getCorUso(uso: string): string {
  if (!corPorUso[uso]) {
    const index = Object.keys(corPorUso).length % PALETA_CORES.length;
    corPorUso[uso] = PALETA_CORES[index];
  }
  return corPorUso[uso];
}
