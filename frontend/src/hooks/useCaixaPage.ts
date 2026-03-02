import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { DateRange } from "react-day-picker";
import api from "@/services/api";
import type {
  Movimentacao,
  CaixaResumo,
  Produto,
  PaginatedResponse,
} from "@/types";
import { formatAPIDate } from "@/lib/formatters";

export const PAGE_SIZE = 10;

export function useCaixaPage() {
  const [resumo, setResumo] = useState<CaixaResumo | null>(null);
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const [draftProdutoValue, setDraftProdutoValue] = useState<string | null>(
    null,
  );
  const [draftFiltro, setDraftFiltro] = useState("");
  const [draftComboboxOpen, setDraftComboboxOpen] = useState(false);
  const [draftTipo, setDraftTipo] = useState("");
  const [draftDateRange, setDraftDateRange] = useState<DateRange | undefined>();

  const [appliedTipo, setAppliedTipo] = useState("");
  const [appliedProdutoId, setAppliedProdutoId] = useState("");
  const [appliedDateRange, setAppliedDateRange] = useState<
    DateRange | undefined
  >();

  const activeCount = [appliedTipo, appliedProdutoId, appliedDateRange].filter(
    Boolean,
  ).length;
  const hasActiveFilters = activeCount > 0;

  const draftProdutoSelecionado = produtos.find(
    (p) => String(p.id) === draftProdutoValue,
  );

  const draftProdutosFiltrados = produtos.filter((p) =>
    p.nome.toLowerCase().includes(draftFiltro.toLowerCase()),
  );

  const fetchResumo = async () => {
    try {
      const { data } = await api.get("/caixa");
      setResumo(
        data.data ?? {
          total_entradas: data.total_entradas ?? 0,
          total_saidas: data.total_saidas ?? 0,
          saldo: data.saldo ?? 0,
        },
      );
    } catch {
      toast.error("Erro ao carregar resumo do caixa");
    }
  };

  const fetchMovimentacoes = async (
    p = 1,
    tipo = appliedTipo,
    produtoId = appliedProdutoId,
    dateRange = appliedDateRange,
  ) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(p),
        size: String(PAGE_SIZE),
      });
      if (tipo) params.set("tipo", tipo);
      if (produtoId) params.set("produto_id", produtoId);
     if (dateRange?.from)
        params.set("data_inicio", formatAPIDate(dateRange.from));
      if (dateRange?.to) params.set("data_fim", formatAPIDate(dateRange.to));
      const { data } = await api.get<PaginatedResponse<Movimentacao>>(
        `/caixa/movimentacoes?${params}`,
      );
      setMovimentacoes(data.items);
      setTotalPages(data.pages);
      setTotalItems(data.total);
      setPage(data.page);
    } catch {
      toast.error("Erro ao carregar movimentações");
    } finally {
      setLoading(false);
    }
  };

  const fetchProdutos = async () => {
    try {
      const { data } = await api.get<PaginatedResponse<Produto>>(
        "/produtos?page=1&size=100",
      );
      setProdutos(data.items);
    } catch {
      toast.error("Erro ao carregar produtos");
    }
  };

  useEffect(() => {
    fetchResumo();
    fetchMovimentacoes(1, "", "", undefined);
    fetchProdutos();
  }, []);

  const handlePopoverOpenChange = (open: boolean) => {
    if (open) {
      setDraftTipo(appliedTipo);
      setDraftProdutoValue(appliedProdutoId || null);
      setDraftDateRange(appliedDateRange);
      setDraftFiltro("");
      setDraftComboboxOpen(false);
    }
    setPopoverOpen(open);
  };

  const applyFilters = () => {
    const newProdutoId = draftProdutoValue ?? "";
    setAppliedTipo(draftTipo);
    setAppliedProdutoId(newProdutoId);
    setAppliedDateRange(draftDateRange);
    setPopoverOpen(false);
    fetchMovimentacoes(1, draftTipo, newProdutoId, draftDateRange);
  };

  const clearFilters = () => {
    setDraftTipo("");
    setDraftProdutoValue(null);
    setDraftDateRange(undefined);
    setAppliedTipo("");
    setAppliedProdutoId("");
    setAppliedDateRange(undefined);
    fetchMovimentacoes(1, "", "", undefined);
  };

  const removeTipo = () => {
    setAppliedTipo("");
    setDraftTipo("");
    fetchMovimentacoes(1, "", appliedProdutoId, appliedDateRange);
  };

  const removeProduto = () => {
    setAppliedProdutoId("");
    setDraftProdutoValue(null);
    fetchMovimentacoes(1, appliedTipo, "", appliedDateRange);
  };

  const removeDates = () => {
    setAppliedDateRange(undefined);
    setDraftDateRange(undefined);
    fetchMovimentacoes(1, appliedTipo, appliedProdutoId, undefined);
  };

  return {
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
  };
}
