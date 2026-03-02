import { useState } from "react";
import { Plus, Wallet } from "lucide-react";
import { useCaixaPage } from "@/hooks/useCaixaPage";
import { CaixaResumoCards } from "@/components/caixa/CaixaResumoCards";
import { CaixaFilters } from "@/components/caixa/CaixaFilters";
import { MovimentacoesTable } from "@/components/caixa/MovimentacoesTable";
import { MovimentacaoDialog } from "@/components/caixa/MovimentacaoDialog";
import { Button } from "@/components/ui/button";

export default function Caixa() {
  const hook = useCaixaPage();
  const [dialogOpen, setDialogOpen] = useState(false);

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
          onClick={() => setDialogOpen(true)}
          className="gap-2"
        >
          <Plus size={16} /> Nova Movimentação
        </Button>
      </div>

      <CaixaResumoCards
        resumo={hook.filteredResumo}
        loading={hook.loading}
        hasActiveFilters={hook.hasActiveFilters}
      />

      <CaixaFilters
        popoverOpen={hook.popoverOpen}
        handlePopoverOpenChange={hook.handlePopoverOpenChange}
        draftTipo={hook.draftTipo}
        setDraftTipo={hook.setDraftTipo}
        draftProdutoValue={hook.draftProdutoValue}
        setDraftProdutoValue={hook.setDraftProdutoValue}
        draftFiltro={hook.draftFiltro}
        setDraftFiltro={hook.setDraftFiltro}
        draftComboboxOpen={hook.draftComboboxOpen}
        setDraftComboboxOpen={hook.setDraftComboboxOpen}
        draftPeriodo={hook.draftPeriodo}
        setDraftPeriodo={hook.setDraftPeriodo}
        draftDateRange={hook.draftDateRange}
        setDraftDateRange={hook.setDraftDateRange}
        draftProdutoSelecionado={hook.draftProdutoSelecionado}
        draftProdutosFiltrados={hook.draftProdutosFiltrados}
        activeCount={hook.activeCount}
        hasActiveFilters={hook.hasActiveFilters}
        appliedTipo={hook.appliedTipo}
        appliedProdutoId={hook.appliedProdutoId}
        appliedPeriodo={hook.appliedPeriodo}
        appliedDateRange={hook.appliedDateRange}
        produtos={hook.produtos}
        applyFilters={hook.applyFilters}
        clearFilters={hook.clearFilters}
        removeTipo={hook.removeTipo}
        removeProduto={hook.removeProduto}
        removeDates={hook.removeDates}
      />

      <MovimentacoesTable
        movimentacoes={hook.movimentacoes}
        loading={hook.loading}
        page={hook.page}
        totalPages={hook.totalPages}
        totalItems={hook.totalItems}
        PAGE_SIZE={hook.PAGE_SIZE}
        hasActiveFilters={hook.hasActiveFilters}
        produtos={hook.produtos}
        onPageChange={(p) => hook.fetchMovimentacoes(p)}
      />

      <MovimentacaoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        produtos={hook.produtos}
        onSuccess={() => hook.fetchMovimentacoes(1)}
      />
    </div>
  );
}
