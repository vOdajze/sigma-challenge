import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import api from "@/services/api";
import type { Produto } from "@/types";
import { formatBRL } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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

interface MovimentacaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produtos: Produto[];
  onSuccess: () => void;
}

export function MovimentacaoDialog({
  open,
  onOpenChange,
  produtos,
  onSuccess,
}: MovimentacaoDialogProps) {
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

  useEffect(() => {
    if (open) {
      reset({ produto_id: 0, quantidade: 1, tipo_movimentacao: "entrada" });
      setProdutoValue(null);
      setFiltro("");
      setComboboxOpen(false);
    }
  }, [open, reset]);

  const onSubmit = async (form: MovimentacaoForm) => {
    try {
      await api.post("/caixa/movimentacao", form);
      toast.success("Movimentação registrada");
      onOpenChange(false);
      onSuccess();
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

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
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
              onClick={() => onOpenChange(false)}
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
  );
}
