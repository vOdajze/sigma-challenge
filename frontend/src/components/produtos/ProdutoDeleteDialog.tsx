import { toast } from "sonner";
import api from "@/services/api";
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

interface ProdutoDeleteDialogProps {
  deleteId: number | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ProdutoDeleteDialog({
  deleteId,
  onOpenChange,
  onSuccess,
}: ProdutoDeleteDialogProps) {
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/produtos/${deleteId}`);
      toast.success("Produto removido");
      onSuccess();
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
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog
      open={!!deleteId}
      onOpenChange={onOpenChange}
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
  );
}
