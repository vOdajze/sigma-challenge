import { cn } from "@/lib/utils";
import type { UsoSoloArea } from "@/types";
import { getCorUso } from "@/lib/map-colors";

interface MapaFiltrosProps {
  usos: UsoSoloArea[];
  usosFiltroMapa: Set<string>;
  toggleFiltroMapa: (uso: string) => void;
  onClearFiltros: () => void;
}

export function MapaFiltros({
  usos,
  usosFiltroMapa,
  toggleFiltroMapa,
  onClearFiltros,
}: MapaFiltrosProps) {
  if (usos.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-xs text-muted-foreground mr-1">
        Filtrar regiões:
      </span>
      {usos.map((u) => {
        const ativo = usosFiltroMapa.has(u.desc_uso_solo);
        return (
          <button
            key={u.desc_uso_solo}
            onClick={() => toggleFiltroMapa(u.desc_uso_solo)}
            className={cn(
              "flex items-center gap-1.5 text-xs px-2 py-1 rounded-md border transition-all",
              ativo ?
                "border-foreground bg-accent font-medium"
              : "border-transparent hover:border-muted-foreground/40 text-muted-foreground",
            )}
          >
            <span
              className="inline-block size-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: getCorUso(u.desc_uso_solo) }}
            />
            {u.desc_uso_solo}
          </button>
        );
      })}
      {usosFiltroMapa.size > 0 && (
        <button
          onClick={onClearFiltros}
          className="text-xs px-2 py-1 rounded-md border border-muted-foreground/40 text-muted-foreground hover:text-foreground transition-all"
        >
          Limpar filtros ×
        </button>
      )}
    </div>
  );
}
