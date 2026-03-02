import { useState, useEffect } from "react";
import { toast } from "sonner";
import api from "@/services/api";
import type { PontoResponse, UsoSoloArea } from "@/types";

export function useMapaPage() {
  const [pontos, setPontos] = useState<PontoResponse[]>([]);
  const [geojson, setGeojson] = useState<object | null>(null);
  const [usos, setUsos] = useState<UsoSoloArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [buscaUso, setBuscaUso] = useState("");
  const [usosFiltroMapa, setUsosFiltroMapa] = useState<Set<string>>(new Set());

  const usosFiltrados = usos.filter((u) =>
    u.desc_uso_solo.toLowerCase().includes(buscaUso.toLowerCase()),
  );

  const pontosFiltrados =
    usosFiltroMapa.size === 0 ?
      pontos
    : pontos.filter((p) => usosFiltroMapa.has(p.desc_uso_solo));

  const toggleFiltroMapa = (uso: string) => {
    setUsosFiltroMapa((prev) => {
      const next = new Set(prev);
      if (next.has(uso)) next.delete(uso);
      else next.add(uso);
      return next;
    });
  };

  const fetchPontos = async () => {
    try {
      const { data } = await api.get("/gis/pontos");
      setPontos(data.pontos ?? []);
    } catch {
      toast.error("Erro ao carregar pontos");
    }
  };

  const fetchGeojson = async () => {
    try {
      const { data } = await api.get("/gis/geojson");
      setGeojson(data);
    } catch {
      toast.error("Erro ao carregar GeoJSON");
    }
  };

  const fetchUsos = async () => {
    try {
      const { data: usosList } = await api.get<string[]>("/gis/usos-solo");
      const areas = await Promise.all(
        usosList.map((uso: string) =>
          api
            .get<UsoSoloArea>(`/gis/usos-solo/${encodeURIComponent(uso)}`)
            .then((r) => r.data),
        ),
      );
      setUsos(areas);
    } catch {
      toast.error("Erro ao carregar usos do solo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPontos();
    fetchGeojson();
    fetchUsos();
  }, []);

  return {
    pontos,
    geojson,
    usos,
    loading,
    buscaUso,
    setBuscaUso,
    usosFiltroMapa,
    setUsosFiltroMapa,
    usosFiltrados,
    pontosFiltrados,
    toggleFiltroMapa,
    fetchPontos,
  };
}
