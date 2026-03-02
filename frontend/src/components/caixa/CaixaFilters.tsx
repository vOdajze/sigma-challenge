import { X, SlidersHorizontal } from "lucide-react";
import type { DateRange } from "react-day-picker";
import type { Produto } from "@/types";
import { DateRangePicker } from "@/components/shared/DateRangePicker.tsx";
import { formatBRL, formatDisplayDate } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";

interface CaixaFiltersProps {
  popoverOpen: boolean;
  handlePopoverOpenChange: (open: boolean) => void;
  draftTipo: string;
  setDraftTipo: (v: string) => void;
  draftProdutoValue: string | null;
  setDraftProdutoValue: (v: string | null) => void;
  draftFiltro: string;
  setDraftFiltro: (v: string) => void;
  draftComboboxOpen: boolean;
  setDraftComboboxOpen: (v: boolean) => void;
  draftDateRange: DateRange | undefined;
  setDraftDateRange: (v: DateRange | undefined) => void;
  draftProdutoSelecionado: Produto | undefined;
  draftProdutosFiltrados: Produto[];
  activeCount: number;
  hasActiveFilters: boolean;
  appliedTipo: string;
  appliedProdutoId: string;
  appliedDateRange: DateRange | undefined;
  produtos: Produto[];
  applyFilters: () => void;
  clearFilters: () => void;
  removeTipo: () => void;
  removeProduto: () => void;
  removeDates: () => void;
}

export function CaixaFilters({
  popoverOpen,
  handlePopoverOpenChange,
  draftTipo,
  setDraftTipo,
  draftProdutoValue,
  setDraftProdutoValue,
  draftFiltro,
  setDraftFiltro,
  draftComboboxOpen,
  setDraftComboboxOpen,
  draftDateRange,
  setDraftDateRange,
  draftProdutoSelecionado,
  draftProdutosFiltrados,
  activeCount,
  hasActiveFilters,
  appliedTipo,
  appliedProdutoId,
  appliedDateRange,
  produtos,
  applyFilters,
  clearFilters,
  removeTipo,
  removeProduto,
  removeDates,
}: CaixaFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <Popover
        open={popoverOpen}
        onOpenChange={handlePopoverOpenChange}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="gap-2 relative"
          >
            <SlidersHorizontal size={15} />
            Filtros
            {activeCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[300px] p-4"
          align="start"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Filtros</h4>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Limpar tudo
                </button>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                Tipo
              </Label>
              <Select
                value={draftTipo || "all"}
                onValueChange={(v) => setDraftTipo(v === "all" ? "" : v)}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="saida">Saída</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                Produto
              </Label>
              <Combobox
                value={draftProdutoValue}
                onValueChange={(val) => {
                  setDraftProdutoValue(val);
                  setDraftFiltro("");
                }}
                inputValue={
                  draftComboboxOpen ? draftFiltro
                  : draftProdutoSelecionado ?
                    draftProdutoSelecionado.nome
                  : draftFiltro
                }
                onInputValueChange={(val: string) => setDraftFiltro(val)}
                onOpenChange={(open) => {
                  setDraftComboboxOpen(open);
                  if (open) setDraftFiltro("");
                }}
              >
                <ComboboxInput
                  placeholder="Todos os produtos..."
                  showClear={!!draftProdutoValue}
                />
                <ComboboxContent>
                  <ComboboxList className="max-h-48 overflow-y-auto">
                    {draftProdutosFiltrados.length === 0 ?
                      <ComboboxEmpty>Nenhum produto encontrado.</ComboboxEmpty>
                    : draftProdutosFiltrados.map((p) => (
                        <ComboboxItem
                          key={p.id}
                          value={String(p.id)}
                        >
                          <span>{p.nome}</span>
                          <span className="ml-auto text-xs text-muted-foreground">
                            {formatBRL(p.preco)}
                          </span>
                        </ComboboxItem>
                      ))
                    }
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Período
                </Label>
                {draftDateRange && (
                  <button
                    onClick={() => setDraftDateRange(undefined)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Limpar
                  </button>
                )}
              </div>
              <DateRangePicker
                value={draftDateRange}
                onChange={setDraftDateRange}
              />
            </div>

            <Button
              className="w-full"
              size="sm"
              onClick={applyFilters}
            >
              Aplicar filtros
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1.5 items-center">
          {appliedTipo && (
            <Badge
              variant="secondary"
              className="gap-1 pr-1 font-normal"
            >
              {appliedTipo === "entrada" ? "Entrada" : "Saída"}
              <button onClick={removeTipo}>
                <X size={11} />
              </button>
            </Badge>
          )}
          {appliedProdutoId && (
            <Badge
              variant="secondary"
              className="gap-1 pr-1 font-normal"
            >
              {produtos.find((p) => String(p.id) === appliedProdutoId)?.nome ??
                `Produto #${appliedProdutoId}`}
              <button onClick={removeProduto}>
                <X size={11} />
              </button>
            </Badge>
          )}
          {appliedDateRange && (
            <Badge
              variant="secondary"
              className="gap-1 pr-1 font-normal"
            >
              {appliedDateRange.from && appliedDateRange.to ?
                `${formatDisplayDate(appliedDateRange.from)} → ${formatDisplayDate(appliedDateRange.to)}`
              : appliedDateRange.from ?
                `A partir de ${formatDisplayDate(appliedDateRange.from)}`
              : `Até ${formatDisplayDate(appliedDateRange.to!)}`}
              <button onClick={removeDates}>
                <X size={11} />
              </button>
            </Badge>
          )}
          <button
            onClick={clearFilters}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors ml-1"
          >
            Limpar tudo
          </button>
        </div>
      )}
    </div>
  );
}
