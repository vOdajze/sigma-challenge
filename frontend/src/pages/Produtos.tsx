import { useState } from "react";
import { Plus } from "lucide-react";
import type { Produto } from "@/types";
import { useProdutosPage } from "@/hooks/useProdutosPage";
import { ProdutosFilters } from "@/components/produtos/ProdutosFilters";
import { ProdutosTable } from "@/components/produtos/ProdutosTable";
import { ProdutoDialog } from "@/components/produtos/ProdutoDialog";
import { ProdutoDeleteDialog } from "@/components/produtos/ProdutoDeleteDialog";
import { Button } from "@/components/ui/button";

export default function Produtos() {
  const hook = useProdutosPage();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editando, setEditando] = useState<Produto | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div>
            <h1 className="text-2xl font-semibold">Produtos & Serviços</h1>
            <p className="text-sm text-muted-foreground">
              Soluções agrícolas e geotecnológicas
            </p>
          </div>
        </div>
        <Button
          onClick={() => {
            setEditando(null);
            setDialogOpen(true);
          }}
          className="gap-2"
        >
          <Plus size={16} /> Novo Produto
        </Button>
      </div>

      <ProdutosFilters
        nome={hook.nome}
        setNome={hook.setNome}
        draft={hook.draft}
        setDraft={hook.setDraft}
        applied={hook.applied}
        popoverOpen={hook.popoverOpen}
        setPopoverOpen={hook.setPopoverOpen}
        hasActiveAdvanced={hook.hasActiveAdvanced}
        hasAnyFilter={hook.hasAnyFilter}
        applyAdvanced={hook.applyAdvanced}
        clearAdvanced={hook.clearAdvanced}
        clearAll={hook.clearAll}
      />

      <ProdutosTable
        produtos={hook.produtos}
        loading={hook.loading}
        page={hook.page}
        totalPages={hook.totalPages}
        totalItems={hook.totalItems}
        PAGE_SIZE={hook.PAGE_SIZE}
        hasAnyFilter={hook.hasAnyFilter}
        onEdit={(p) => {
          setEditando(p);
          setDialogOpen(true);
        }}
        onDelete={setDeleteId}
        onPageChange={(p) => hook.fetchProdutos(p)}
      />

      <ProdutoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editando={editando}
        onSuccess={() => hook.fetchProdutos(hook.page)}
      />

      <ProdutoDeleteDialog
        deleteId={deleteId}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        onSuccess={() => {
          setDeleteId(null);
          hook.fetchProdutos(hook.page);
        }}
      />
    </div>
  );
}
