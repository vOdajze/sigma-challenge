import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
} from "lucide-react";
import api from "@/services/api";
import { useCaixaPage } from "@/hooks/useCaixaPage";
import { DateRangePicker } from "@/components/shared/DataRangePicker";
import { formatBRL, formatDate, formatDisplayDate } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

const movimentacaoSchema = z.object({
  produto_id: z.number().gt(0, "Selecione um produto"),
  quantidade: z.number().int().gt(0, "Quantidade deve ser maior que 0"),
  tipo_movimentacao: z.enum(["entrada", "saida"]),
});

type MovimentacaoForm = z.infer<typeof movimentacaoSchema>;

export default function Caixa() {
  const {
    resumo,
    movimentacoes,
    produtos,
    loading,
    page,
    totalPages,
    totalItems,
    popoverOpen,
    draftProdutoValue,
    setDraftProdutoValue,
    draftFiltro,
    setDraftFiltro,
    draftComboboxOpen,
    setDraftComboboxOpen,
    draftTipo,
    setDraftTipo,
    draftDateRange,
    setDraftDateRange,
    appliedTipo,
    appliedProdutoId,
    appliedDateRange,
    activeCount,
    hasActiveFilters,
    draftProdutoSelecionado,
    draftProdutosFiltrados,
    fetchResumo,
    fetchMovimentacoes,
    handlePopoverOpenChange,
    applyFilters,
    clearFilters,
    removeTipo,
    removeProduto,
    removeDates,
    PAGE_SIZE,
  } = useCaixaPage();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [produtoValue, setProdutoValue] = useState<string | null>(null);
  const [filtro, setFiltro] = useState("");
  const [comboboxOpen, setComboboxOpen] = useState(false);

  const produtoSelecionado = produtos.find(
    (p) => String(p.id) === produtoValue,
  );
  const produtosFiltrados = produtos.filter((p) =>
    p.nome.toLowerCase().includes(filtro.toLowerCase()),
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MovimentacaoForm>({
    resolver: zodResolver(movimentacaoSchema),
    defaultValues: {
      produto_id: 0,
      quantidade: 1,
      tipo_movimentacao: "entrada",
    },
  });

  const handleOpenDialog = () => {
    reset();
    setProdutoValue(null);
    setFiltro("");
    setComboboxOpen(false);
    setDialogOpen(true);
  };

  const onSubmit = async (form: MovimentacaoForm) => {
    try {
      await api.post("/caixa/movimentacao", form);
      toast.success("Movimentação registrada");
      setDialogOpen(false);
      reset();
      setProdutoValue(null);
      setFiltro("");
      setComboboxOpen(false);
      fetchResumo();
      fetchMovimentacoes(1, appliedTipo, appliedProdutoId, appliedDateRange);
    } catch (err: any) {
      if (err?.response?.status === 400) {
        toast.error(err.response.data?.detail ?? "Estoque insuficiente");
      } else if (err?.response?.status === 404) {
        toast.error("Produto não encontrado");
      } else {
        toast.error("Erro ao registrar movimentação");
      }
    }
  };

  const saldoPositivo = (resumo?.saldo ?? 0) >= 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div>
            <h1 className="text-2xl font-semibold">Fluxo de Caixa</h1>
            <p className="text-sm text-muted-foreground">
              Movimentações de entrada e saída
            </p>
          </div>
        </div>
        <Button
          onClick={handleOpenDialog}
          className="gap-2"
        >
          <Plus size={16} /> Nova Movimentação
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Entradas
            </CardTitle>
            <TrendingUp
              size={18}
              className="text-green-500"
            />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {loading ? "—" : formatBRL(resumo?.total_entradas ?? 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Saídas
            </CardTitle>
            <TrendingDown
              size={18}
              className="text-red-500"
            />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-500">
              {loading ? "—" : formatBRL(resumo?.total_saidas ?? 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Saldo
            </CardTitle>
            <Wallet
              size={18}
              className={saldoPositivo ? "text-green-500" : "text-red-500"}
            />
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold ${saldoPositivo ? "text-green-600" : "text-red-500"}`}
            >
              {loading ? "—" : formatBRL(resumo?.saldo ?? 0)}
            </p>
          </CardContent>
        </Card>
      </div>

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
                        <ComboboxEmpty>
                          Nenhum produto encontrado.
                        </ComboboxEmpty>
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
                {produtos.find((p) => String(p.id) === appliedProdutoId)
                  ?.nome ?? `Produto #${appliedProdutoId}`}
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

      <div className="rounded-md border">
        <div className="min-h-[480px] px-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead className="text-center">Tipo</TableHead>
                <TableHead className="text-right">Qtd</TableHead>
                <TableHead className="text-right">Valor Unit.</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ?
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-10"
                  >
                    Carregando...
                  </TableCell>
                </TableRow>
              : movimentacoes.length === 0 ?
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-10"
                  >
                    {hasActiveFilters ?
                      "Nenhuma movimentação encontrada com esses filtros"
                    : "Nenhuma movimentação registrada"}
                  </TableCell>
                </TableRow>
              : movimentacoes.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">
                      {produtos.find((p) => p.id === m.produto_id)?.nome ??
                        `Produto #${m.produto_id}`}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          m.tipo_movimentacao === "entrada" ?
                            "default"
                          : "destructive"
                        }
                      >
                        {m.tipo_movimentacao === "entrada" ?
                          "Entrada"
                        : "Saída"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{m.quantidade}</TableCell>
                    <TableCell className="text-right">
                      {formatBRL(m.valor_unitario)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatBRL(m.valor_total)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-sm">
                      {formatDate(m.data_movimentacao)}
                    </TableCell>
                  </TableRow>
                ))
              }
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <span className="text-sm text-muted-foreground">
            {totalItems > 0 ?
              `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, totalItems)} de ${totalItems} movimentaç${totalItems !== 1 ? "ões" : "ão"}`
            : hasActiveFilters ?
              "Nenhum resultado"
            : "Nenhuma movimentação"}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Página {page} de {Math.max(totalPages, 1)}
            </span>
            <Button
              variant="outline"
              size="icon"
              disabled={page <= 1}
              onClick={() => fetchMovimentacoes(page - 1)}
            >
              <ChevronLeft size={16} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={page >= totalPages}
              onClick={() => fetchMovimentacoes(page + 1)}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Movimentação</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 pt-2"
          >
            <div className="space-y-1">
              <Label>Produto</Label>
              <Combobox
                value={produtoValue}
                onValueChange={(val) => {
                  setProdutoValue(val);
                  const produto =
                    val ? produtos.find((p) => String(p.id) === val) : null;
                  setValue("produto_id", produto?.id ?? 0);
                  setFiltro("");
                }}
                inputValue={
                  comboboxOpen ? filtro
                  : produtoSelecionado ?
                    produtoSelecionado.nome
                  : filtro
                }
                onInputValueChange={(val: string) => setFiltro(val)}
                onOpenChange={(open) => {
                  setComboboxOpen(open);
                  if (open) setFiltro("");
                }}
              >
                <ComboboxInput
                  placeholder="Pesquisar produto..."
                  showClear={!!produtoValue}
                />
                <ComboboxContent>
                  <ComboboxList className="max-h-48 overflow-y-auto">
                    {produtosFiltrados.length === 0 ?
                      <ComboboxEmpty>Nenhum produto encontrado.</ComboboxEmpty>
                    : produtosFiltrados.map((p) => (
                        <ComboboxItem
                          key={p.id}
                          value={String(p.id)}
                        >
                          <span>{p.nome}</span>
                          <span className="ml-auto text-xs text-muted-foreground shrink-0">
                            {formatBRL(p.preco)}
                            {" · "}
                            <span
                              className={
                                p.quantidade_estoque > 0 ?
                                  "text-green-600"
                                : "text-red-500"
                              }
                            >
                              {p.quantidade_estoque} em estoque
                            </span>
                          </span>
                        </ComboboxItem>
                      ))
                    }
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
              {errors.produto_id && (
                <p className="text-sm text-destructive">
                  {errors.produto_id.message}
                </p>
              )}
              {produtoSelecionado && (
                <p className="text-xs text-muted-foreground pt-1">
                  Preço unitário:{" "}
                  <span className="font-medium text-foreground">
                    {formatBRL(produtoSelecionado.preco)}
                  </span>
                  {" · "}Estoque disponível:{" "}
                  <span
                    className={`font-medium ${produtoSelecionado.quantidade_estoque > 0 ? "text-green-600" : "text-red-500"}`}
                  >
                    {produtoSelecionado.quantidade_estoque}
                  </span>
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Tipo</Label>
              <Select
                defaultValue="entrada"
                onValueChange={(v) =>
                  setValue("tipo_movimentacao", v as "entrada" | "saida")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="saida">Saída</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Quantidade</Label>
              <Input
                type="number"
                min={1}
                placeholder="1"
                {...register("quantidade", { valueAsNumber: true })}
              />
              {errors.quantidade && (
                <p className="text-sm text-destructive">
                  {errors.quantidade.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Registrando..." : "Registrar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
