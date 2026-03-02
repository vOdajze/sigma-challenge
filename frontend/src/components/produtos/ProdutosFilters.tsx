import { Search, X, SlidersHorizontal, ArrowRight } from "lucide-react";
import type { AdvancedFilters } from "@/hooks/useProdutosPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ProdutosFiltersProps {
  nome: string;
  setNome: (v: string) => void;
  draft: AdvancedFilters;
  setDraft: React.Dispatch<React.SetStateAction<AdvancedFilters>>;
  applied: AdvancedFilters;
  popoverOpen: boolean;
  setPopoverOpen: (v: boolean) => void;
  hasActiveAdvanced: boolean;
  hasAnyFilter: boolean;
  applyAdvanced: () => void;
  clearAdvanced: () => void;
  clearAll: () => void;
}

export function ProdutosFilters({
  nome,
  setNome,
  draft,
  setDraft,
  applied,
  popoverOpen,
  setPopoverOpen,
  hasActiveAdvanced,
  hasAnyFilter,
  applyAdvanced,
  clearAdvanced,
  clearAll,
}: ProdutosFiltersProps) {
  return (
    <div className="flex gap-2">
      <div className="relative flex-1 max-w-sm">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
        <Input
          placeholder="Pesquisar por nome..."
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="pl-9 pr-9"
        />
        {nome && (
          <button
            onClick={() => setNome("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <Popover
        open={popoverOpen}
        onOpenChange={setPopoverOpen}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="gap-2 relative"
          >
            <SlidersHorizontal size={15} />
            Filtros
            {hasActiveAdvanced && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                {
                  [
                    applied.preco_min !== "0" && applied.preco_min,
                    applied.preco_max,
                    applied.estoque_min,
                  ].filter(Boolean).length
                }
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-80 p-4"
          align="end"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Filtros avançados</h4>
              {hasActiveAdvanced && (
                <button
                  onClick={clearAdvanced}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Limpar
                </button>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                Faixa de preço (R$)
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="0"
                  min={0}
                  step="0.01"
                  value={draft.preco_min}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, preco_min: e.target.value }))
                  }
                  className="text-sm"
                />
                <ArrowRight
                  size={14}
                  className="shrink-0 text-muted-foreground"
                />
                <Input
                  type="number"
                  placeholder="Máx"
                  min={0}
                  step="0.01"
                  value={draft.preco_max}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, preco_max: e.target.value }))
                  }
                  className="text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                Estoque mínimo
              </Label>
              <Input
                type="number"
                placeholder="Ex: 0 lista zerados, 1 lista com estoque"
                min={0}
                value={draft.estoque_min}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, estoque_min: e.target.value }))
                }
                className="text-sm"
              />
            </div>

            <Button
              className="w-full"
              size="sm"
              onClick={applyAdvanced}
            >
              Aplicar filtros
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {hasAnyFilter && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAll}
          className="gap-1 text-muted-foreground hover:text-foreground"
        >
          <X size={14} /> Limpar tudo
        </Button>
      )}
    </div>
  );
}
