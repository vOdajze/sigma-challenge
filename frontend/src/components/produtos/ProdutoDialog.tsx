import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import api from "@/services/api";
import type { Produto } from "@/types";
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

const produtoSchema = z.object({
  nome: z.string().min(1, "Nome obrigatório"),
  descricao: z.string().nullable().optional(),
  preco: z
    .number({ message: "Preço inválido" })
    .gt(0, "Preço deve ser maior que 0"),
  quantidade_estoque: z.number({ message: "Estoque inválido" }).int().min(0),
});

type ProdutoForm = z.infer<typeof produtoSchema>;

interface ProdutoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editando: Produto | null;
  onSuccess: () => void;
}

export function ProdutoDialog({
  open,
  onOpenChange,
  editando,
  onSuccess,
}: ProdutoDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProdutoForm>({ resolver: zodResolver(produtoSchema) });

  useEffect(() => {
    if (open) {
      reset(
        editando ?
          {
            nome: editando.nome,
            descricao: editando.descricao ?? "",
            preco: editando.preco,
            quantidade_estoque: editando.quantidade_estoque,
          }
        : { nome: "", descricao: "", preco: 0, quantidade_estoque: 0 },
      );
    }
  }, [open, editando, reset]);

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
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error("Erro ao salvar produto");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
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
              <p className="text-sm text-destructive">{errors.nome.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>
              Descrição{" "}
              <span className="text-xs text-muted-foreground">(opcional)</span>
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
              <p className="text-sm text-destructive">{errors.preco.message}</p>
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
              onClick={() => onOpenChange(false)}
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
  );
}
