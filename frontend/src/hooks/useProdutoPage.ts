import { useState, useEffect } from "react";
import { toast } from "sonner";
import api from "@/services/api";
import type { Produto, PaginatedResponse } from "@/types";

export interface AdvancedFilters {
  preco_min: string;
  preco_max: string;
  estoque_min: string;
}

export const EMPTY_ADVANCED: AdvancedFilters = {
  preco_min: "0",
  preco_max: "",
  estoque_min: "",
};

export const PAGE_SIZE = 10;

export function useProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
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

  return {
    produtos,
    loading,
    page,
    totalPages,
    totalItems,
    popoverOpen,
    setPopoverOpen,
    nome,
    setNome,
    nomeQuery,
    draft,
    setDraft,
    applied,
    hasActiveAdvanced,
    hasAnyFilter,
    fetchProdutos,
    applyAdvanced,
    clearAdvanced,
    clearAll,
    PAGE_SIZE,
  };
}
