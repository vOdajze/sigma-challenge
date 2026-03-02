import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { DateRange } from "react-day-picker";
import api from "@/services/api";
import type {
  CaixaResumo,
  Produto,
  PaginatedResponse,
  MovimentacoesPaginatedResponse,
} from "@/types";
import { formatAPIDate } from "@/lib/formatters";
import {
  type PeriodoPreset,
  getDateRangeForPeriodo,
} from "@/lib/period-presets";

export const PAGE_SIZE = 10;

export function useCaixaPage() {
  const [filteredResumo, setFilteredResumo] = useState<CaixaResumo | null>(
    null,
  );
  const [movimentacoes, setMovimentacoes] = useState<
    MovimentacoesPaginatedResponse["items"]
  >([]);
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
  const [draftPeriodo, setDraftPeriodo] = useState<PeriodoPreset>("este_mes");
  const [draftDateRange, setDraftDateRange] = useState<DateRange | undefined>(
    () => getDateRangeForPeriodo("este_mes"),
  );

  const [appliedTipo, setAppliedTipo] = useState("");
  const [appliedProdutoId, setAppliedProdutoId] = useState("");
  const [appliedPeriodo, setAppliedPeriodo] =
    useState<PeriodoPreset>("este_mes");
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
      const { data } = await api.get<MovimentacoesPaginatedResponse>(
        `/caixa/movimentacoes?${params}`,
      );
      setMovimentacoes(data.items);
      setTotalPages(data.pages);
      setTotalItems(data.total);
      setPage(data.page);
      setFilteredResumo({
        total_entradas: data.total_entradas,
        total_saidas: data.total_saidas,
        saldo: data.saldo,
      });
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
    fetchMovimentacoes(1);
    fetchProdutos();
  }, []);

  const handlePopoverOpenChange = (open: boolean) => {
    if (open) {
      const periodo = appliedPeriodo;
      setDraftTipo(appliedTipo);
      setDraftProdutoValue(appliedProdutoId || null);
      setDraftPeriodo(periodo);
      setDraftDateRange(
        periodo !== "personalizado" ?
          getDateRangeForPeriodo(periodo)
        : appliedDateRange,
      );
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
    setAppliedPeriodo(draftPeriodo);
    setPopoverOpen(false);
    fetchMovimentacoes(1, draftTipo, newProdutoId, draftDateRange);
  };

  const clearFilters = () => {
    setDraftTipo("");
    setDraftProdutoValue(null);
    setDraftPeriodo("este_mes");
    setDraftDateRange(getDateRangeForPeriodo("este_mes"));
    setAppliedTipo("");
    setAppliedProdutoId("");
    setAppliedDateRange(undefined);
    setAppliedPeriodo("este_mes");
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
    setAppliedPeriodo("este_mes");
    fetchMovimentacoes(1, appliedTipo, appliedProdutoId, undefined);
  };

  return {
    filteredResumo,
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
    draftPeriodo,
    setDraftPeriodo,
    draftDateRange,
    setDraftDateRange,
    appliedTipo,
    appliedProdutoId,
    appliedPeriodo,
    appliedDateRange,
    activeCount,
    hasActiveFilters,
    draftProdutoSelecionado,
    draftProdutosFiltrados,
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
