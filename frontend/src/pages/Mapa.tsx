import { useState, useCallback } from "react";
import type { LatLng } from "leaflet";
import { Plus } from "lucide-react";
import { useMapaPage } from "@/hooks/useMapaPage";
import { MapaView } from "@/components/mapa/MapaView";
import { MapaFiltros } from "@/components/mapa/MapaFiltros";
import { UsosSoloCard } from "@/components/mapa/UsosSoloCard";
import { PontosCard } from "@/components/mapa/PontosCard";
import { PontoDialog } from "@/components/mapa/PontoDialog";
import { Button } from "@/components/ui/button";

export default function Mapa() {
  const hook = useMapaPage();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [initialCoords, setInitialCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const handleMapClick = useCallback((latlng: LatLng) => {
    setInitialCoords({
      lat: parseFloat(latlng.lat.toFixed(6)),
      lng: parseFloat(latlng.lng.toFixed(6)),
    });
    setDialogOpen(true);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Mapa GIS</h1>
          <p className="text-sm text-muted-foreground">
            Clique dentro de uma região no mapa para registrar um ponto de
            amostragem ou clique no botão do lado direito.
          </p>
        </div>
        <Button
          onClick={() => {
            setInitialCoords(null);
            setDialogOpen(true);
          }}
          className="gap-2"
        >
          <Plus size={16} /> Novo Ponto
        </Button>
      </div>

      <div className="rounded-md border overflow-hidden h-[500px] relative z-0">
        <MapaView
          geojson={hook.geojson}
          pontosFiltrados={hook.pontosFiltrados}
          usosFiltroMapa={hook.usosFiltroMapa}
          dialogOpen={dialogOpen}
          onMapClick={handleMapClick}
        />
      </div>

      <MapaFiltros
        usos={hook.usos}
        usosFiltroMapa={hook.usosFiltroMapa}
        toggleFiltroMapa={hook.toggleFiltroMapa}
        onClearFiltros={() => hook.setUsosFiltroMapa(new Set())}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UsosSoloCard
          usosFiltrados={hook.usosFiltrados}
          loading={hook.loading}
          buscaUso={hook.buscaUso}
          setBuscaUso={hook.setBuscaUso}
        />
        <PontosCard
          pontos={hook.pontos}
          pontosFiltrados={hook.pontosFiltrados}
          usosFiltroMapa={hook.usosFiltroMapa}
        />
      </div>

      <PontoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialCoords={initialCoords}
        onSuccess={hook.fetchPontos}
      />
    </div>
  );
}
