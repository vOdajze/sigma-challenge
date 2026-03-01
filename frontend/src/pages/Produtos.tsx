import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Sprout } from "lucide-react";
import api from "@/services/api";
import type { Produto } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  descricao: z.string().min(1, "Descrição obrigatória"),
  preco: z
    .number({ message: "Preço inválido" })
    .gt(0, "Preço deve ser maior que 0"),
});

type ProdutoForm = z.infer<typeof produtoSchema>;

export default function Produtos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editando, setEditando] = useState<Produto | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProdutoForm>({
    resolver: zodResolver(produtoSchema),
  });
  const fetchProdutos = async () => {
    try {
      const { data } = await api.get("/produtos");
      setProdutos(Array.isArray(data) ? data : (data.data ?? []));
    } catch {
      toast.error("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, []);

  const openCriar = () => {
    setEditando(null);
    reset({ nome: "", descricao: "", preco: 0 });
    setDialogOpen(true);
  };

  const openEditar = (produto: Produto) => {
    setEditando(produto);
    reset({
      nome: produto.nome,
      descricao: produto.descricao,
      preco: produto.preco,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (form: ProdutoForm) => {
    try {
      if (editando) {
        await api.patch(`/produtos/${editando.id}`, form);
        toast.success("Produto atualizado com sucesso");
      } else {
        await api.post("/produtos", form);
        toast.success("Produto cadastrado com sucesso");
      }
      setDialogOpen(false);
      fetchProdutos();
    } catch {
      toast.error("Erro ao salvar produto");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/produtos/${deleteId}`);
      toast.success("Produto removido");
      fetchProdutos();
    } catch {
      toast.error("Erro ao remover produto");
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

      <div className="rounded-md border px-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-right">Preço</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ?
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground py-10"
                >
                  Carregando...
                </TableCell>
              </TableRow>
            : produtos.length === 0 ?
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground py-10"
                >
                  Nenhum produto cadastrado
                </TableCell>
              </TableRow>
            : produtos.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.nome}</TableCell>
                  <TableCell className="text-muted-foreground max-w-sm truncate">
                    {p.descricao}
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
              <Label>Descrição</Label>
              <Input
                placeholder="Descreva o serviço ou produto"
                {...register("descricao")}
              />
              {errors.descricao && (
                <p className="text-sm text-destructive">
                  {errors.descricao.message}
                </p>
              )}
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
