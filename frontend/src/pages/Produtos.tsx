import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Sprout,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  SlidersHorizontal,
  ArrowRight,
} from "lucide-react";
import api from "@/services/api";
import type { Produto, PaginatedResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const produtoSchema = z.object({
  nome: z.string().min(1, "Nome obrigatório"),
  descricao: z.string().nullable().optional(),
  preco: z
    .number({ message: "Preço inválido" })
    .gt(0, "Preço deve ser maior que 0"),
  quantidade_estoque: z.number({ message: "Estoque inválido" }).int().min(0),
});

type ProdutoForm = z.infer<typeof produtoSchema>;

interface AdvancedFilters {
  preco_min: string;
  preco_max: string;
  estoque_min: string;
}

const EMPTY_ADVANCED: AdvancedFilters = {
  preco_min: "0",
  preco_max: "",
  estoque_min: "",
};
const PAGE_SIZE = 10;

export default function Produtos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editando, setEditando] = useState<Produto | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const [nome, setNome] = useState("");
  const [nomeQuery, setNomeQuery] = useState("");

  const [draft, setDraft] = useState<AdvancedFilters>(EMPTY_ADVANCED);
  const [applied, setApplied] = useState<AdvancedFilters>(EMPTY_ADVANCED);

  const hasActiveAdvanced =
    (applied.preco_min !== "" && applied.preco_min !== "0") ||
    applied.preco_max !== "" ||
    applied.estoque_min !== "";

  const hasAnyFilter = nomeQuery !== "" || hasActiveAdvanced;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProdutoForm>({ resolver: zodResolver(produtoSchema) });

  const fetchProdutos = async (
    p = 1,
    nomeFiltro = nomeQuery,
    adv: AdvancedFilters = applied,
  ) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(p),
        size: String(PAGE_SIZE),
      });
      if (nomeFiltro.trim()) params.set("nome", nomeFiltro.trim());
      if (adv.preco_min && adv.preco_min !== "0")
        params.set("preco_min", adv.preco_min);
      if (adv.preco_max) params.set("preco_max", adv.preco_max);
      if (adv.estoque_min !== "") params.set("estoque_min", adv.estoque_min);
      const { data } = await api.get<PaginatedResponse<Produto>>(
        `/produtos?${params}`,
      );
      setProdutos(data.items);
      setTotalPages(data.pages);
      setTotalItems(data.total);
      setPage(data.page);
    } catch {
      toast.error("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  };

  // Debounce do nome
  useEffect(() => {
    const t = setTimeout(() => {
      setNomeQuery(nome);
      fetchProdutos(1, nome, applied);
    }, 400);
    return () => clearTimeout(t);
  }, [nome]);

  const applyAdvanced = () => {
    setApplied(draft);
    setPopoverOpen(false);
    fetchProdutos(1, nomeQuery, draft);
  };

  const clearAdvanced = () => {
    setDraft(EMPTY_ADVANCED);
    setApplied(EMPTY_ADVANCED);
    fetchProdutos(1, nomeQuery, EMPTY_ADVANCED);
  };

  const clearAll = () => {
    setNome("");
    setNomeQuery("");
    setDraft(EMPTY_ADVANCED);
    setApplied(EMPTY_ADVANCED);
    fetchProdutos(1, "", EMPTY_ADVANCED);
  };

  const openCriar = () => {
    setEditando(null);
    reset({ nome: "", descricao: "", preco: 0, quantidade_estoque: 0 });
    setDialogOpen(true);
  };

  const openEditar = (produto: Produto) => {
    setEditando(produto);
    reset({
      nome: produto.nome,
      descricao: produto.descricao ?? "",
      preco: produto.preco,
      quantidade_estoque: produto.quantidade_estoque,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (form: ProdutoForm) => {
    try {
      if (editando) {
        const { quantidade_estoque, ...payload } = form;
        await api.patch(`/produtos/${editando.id}`, payload);
        toast.success("Produto atualizado com sucesso");
      } else {
        await api.post("/produtos", form);
        toast.success("Produto cadastrado com sucesso");
      }
      setDialogOpen(false);
      fetchProdutos(page, nomeQuery, applied);
    } catch {
      toast.error("Erro ao salvar produto");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/produtos/${deleteId}`);
      toast.success("Produto removido");
      fetchProdutos(page, nomeQuery, applied);
    } catch (err: any) {
      if (err?.response?.status === 409) {
        toast.error(
          err.response.data?.detail ??
            "Produto possui movimentações e não pode ser removido",
        );
      } else if (err?.response?.status === 404) {
        toast.error("Produto não encontrado");
      } else {
        toast.error("Erro ao remover produto");
      }
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sprout
            size={22}
            className="text-green-600"
          />
          <div>
            <h1 className="text-2xl font-semibold">Produtos & Serviços</h1>
            <p className="text-sm text-muted-foreground">
              Soluções agrícolas e geotecnológicas
            </p>
          </div>
        </div>
        <Button
          onClick={openCriar}
          className="gap-2"
        >
          <Plus size={16} /> Novo Produto
        </Button>
      </div>

      {/* Barra de busca + botão de filtros */}
      <div className="flex gap-2">
        {/* Input de nome */}
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

        {/* Botão de filtros avançados */}
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
              {/* Indicador de filtros ativos */}
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

              {/* Faixa de preço */}
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

              {/* Estoque mínimo */}
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

        {/* Limpar tudo */}
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

      <div className="rounded-md border">
        <div className="min-h-[480px] px-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Preço</TableHead>
                <TableHead className="text-right">Estoque</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ?
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground py-10"
                  >
                    Carregando...
                  </TableCell>
                </TableRow>
              : produtos.length === 0 ?
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground py-10"
                  >
                    {hasAnyFilter ?
                      "Nenhum produto encontrado com esses filtros"
                    : "Nenhum produto cadastrado"}
                  </TableCell>
                </TableRow>
              : produtos.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.nome}</TableCell>
                    <TableCell className="text-muted-foreground max-w-sm truncate">
                      {p.descricao ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">
                        {p.preco.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={
                          p.quantidade_estoque > 0 ? "default" : "destructive"
                        }
                      >
                        {p.quantidade_estoque}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditar(p)}
                        >
                          <Pencil size={15} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(p.id)}
                        >
                          <Trash2 size={15} />
                        </Button>
                      </div>
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
              `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, totalItems)} de ${totalItems} produto${totalItems !== 1 ? "s" : ""}`
            : hasAnyFilter ?
              "Nenhum resultado"
            : "Nenhum produto"}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Página {page} de {Math.max(totalPages, 1)}
            </span>
            <Button
              variant="outline"
              size="icon"
              disabled={page <= 1}
              onClick={() => fetchProdutos(page - 1, nomeQuery, applied)}
            >
              <ChevronLeft size={16} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={page >= totalPages}
              onClick={() => fetchProdutos(page + 1, nomeQuery, applied)}
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
            <DialogTitle>
              {editando ? "Editar Produto" : "Novo Produto"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 pt-2"
          >
            <div className="space-y-1">
              <Label>Nome</Label>
              <Input
                placeholder="Ex: Tomografia do Canavial"
                {...register("nome")}
              />
              {errors.nome && (
                <p className="text-sm text-destructive">
                  {errors.nome.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label>
                Descrição{" "}
                <span className="text-xs text-muted-foreground">
                  (opcional)
                </span>
              </Label>
              <Input
                placeholder="Descreva o serviço ou produto"
                {...register("descricao")}
              />
            </div>
            <div className="space-y-1">
              <Label>Preço (R$)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0,00"
                {...register("preco", { valueAsNumber: true })}
              />
              {errors.preco && (
                <p className="text-sm text-destructive">
                  {errors.preco.message}
                </p>
              )}
            </div>
            {!editando && (
              <div className="space-y-1">
                <Label>Estoque inicial</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  {...register("quantidade_estoque", { valueAsNumber: true })}
                />
                {errors.quantidade_estoque && (
                  <p className="text-sm text-destructive">
                    {errors.quantidade_estoque.message}
                  </p>
                )}
              </div>
            )}
            {editando && (
              <p className="text-xs text-muted-foreground rounded-md border px-3 py-2 bg-muted">
                Para ajustar o estoque, registre uma movimentação de entrada ou
                saída no Fluxo de Caixa.
              </p>
            )}
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
                {isSubmitting ?
                  "Salvando..."
                : editando ?
                  "Salvar alterações"
                : "Cadastrar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover produto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O produto será removido
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
