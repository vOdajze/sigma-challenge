import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { TrendingUp, TrendingDown, Wallet, Plus } from "lucide-react";
import api from "@/services/api";
import type { Movimentacao, CaixaResumo, Produto } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  valor_unitario: z.number().gt(0, "Valor deve ser maior que 0"),
  tipo_movimentacao: z.enum(["entrada", "saida"]),
});

type MovimentacaoForm = z.infer<typeof movimentacaoSchema>;

const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const formatDate = (d: string) =>
  new Date(d).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });

export default function Caixa() {
  const [resumo, setResumo] = useState<CaixaResumo | null>(null);
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
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
      valor_unitario: 0,
      tipo_movimentacao: "entrada",
    },
  });

  const fetchCaixa = async () => {
    try {
      const { data } = await api.get("/caixa");
      if (data.data && data.movimentacoes) {
        setResumo(data.data);
        setMovimentacoes(data.movimentacoes);
      } else {
        setResumo({
          total_entradas: data.total_entradas ?? 0,
          total_saidas: data.total_saidas ?? 0,
          saldo: data.saldo ?? 0,
        });
        setMovimentacoes(data.movimentacoes ?? []);
      }
    } catch {
      toast.error("Erro ao carregar caixa");
    } finally {
      setLoading(false);
    }
  };

  const fetchProdutos = async () => {
    try {
      const { data } = await api.get("/produtos");
      setProdutos(Array.isArray(data) ? data : (data.data ?? []));
    } catch {
      toast.error("Erro ao carregar produtos");
    }
  };

  useEffect(() => {
    fetchCaixa();
    fetchProdutos();
  }, []);

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
      fetchCaixa();
    } catch {
      toast.error("Erro ao registrar movimentação");
    }
  };

  const saldoPositivo = (resumo?.saldo ?? 0) >= 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet
            size={22}
            className="text-blue-600"
          />
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

      <div className="rounded-md border px-4">
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
                  Nenhuma movimentação registrada
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
                      {m.tipo_movimentacao === "entrada" ? "Entrada" : "Saída"}
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
                  setValue("valor_unitario", produto?.preco ?? 0);
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
                  <ComboboxList>
                    {produtosFiltrados.length === 0 ?
                      <ComboboxEmpty>Nenhum produto encontrado.</ComboboxEmpty>
                    : produtosFiltrados.map((p) => (
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
              {errors.produto_id && (
                <p className="text-sm text-destructive">
                  {errors.produto_id.message}
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

            <div className="grid grid-cols-2 gap-4">
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
              <div className="space-y-1">
                <Label>Valor Unitário (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  readOnly
                  className="bg-muted cursor-not-allowed"
                  {...register("valor_unitario", { valueAsNumber: true })}
                />
                {errors.valor_unitario && (
                  <p className="text-sm text-destructive">
                    {errors.valor_unitario.message}
                  </p>
                )}
              </div>
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