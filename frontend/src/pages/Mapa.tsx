import { useEffect, useState, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  GeoJSON,
  useMapEvents,
  useMap,
} from "react-leaflet";
import type { LatLng } from "leaflet";
import "leaflet/dist/leaflet.css";
import "@/lib/leaflet-fix.ts";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Map, Plus, Layers, Pin } from "lucide-react";
import api from "@/services/api";
import type { PontoResponse, UsoSoloArea } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import L from "leaflet";
import { cn } from "@/lib/utils";
import * as turf from "@turf/turf";

const PALETA_CORES = [
  "#4ade80", "#60a5fa", "#f97316", "#a78bfa",
  "#fb923c", "#34d399", "#f472b6", "#facc15",
  "#38bdf8", "#e879f9", "#2dd4bf", "#fb7185",
];

const corPorUso: Record<string, string> = {};
function getCorUso(uso: string): string {
  if (!corPorUso[uso]) {
    const index = Object.keys(corPorUso).length % PALETA_CORES.length;
    corPorUso[uso] = PALETA_CORES[index];
  }
  return corPorUso[uso];
}

const pontoSchema = z.object({
  latitude: z.number({ message: "Latitude inválida" }).min(-90).max(90),
  longitude: z.number({ message: "Longitude inválida" }).min(-180).max(180),
});

type PontoForm = z.infer<typeof pontoSchema>;

function MapClickHandler({
  onMapClick,
  disabled,
  geojson,
}: {
  onMapClick: (latlng: LatLng) => void;
  disabled: boolean;
  geojson: object | null;
}) {
  useMapEvents({
    click(e) {
      if (disabled || !geojson) return;

      const pt = turf.point([e.latlng.lng, e.latlng.lat]);
      const fc = geojson as GeoJSON.FeatureCollection;
      const dentro = fc.features?.some((feature) => {
        try {
          if (
            feature.geometry.type === "Polygon" ||
            feature.geometry.type === "MultiPolygon"
          ) {
            return turf.booleanPointInPolygon(pt, feature as any);
          }
        } catch {}
        return false;
      });

      if (!dentro) {
        toast.warning("Clique dentro de uma região do mapa para registrar um ponto.");
        return;
      }

      onMapClick(e.latlng);
    },
  });
  return null;
}

function FitBoundsToGeoJSON({ data }: { data: object }) {
  const map = useMap();
  useEffect(() => {
    try {
      const bounds = L.geoJSON(data as any).getBounds();
      if (bounds.isValid()) map.fitBounds(bounds, { padding: [30, 30] });
    } catch {}
  }, [data, map]);
  return null;
}

export default function Mapa() {
  const [pontos, setPontos] = useState<PontoResponse[]>([]);
  const [geojson, setGeojson] = useState<object | null>(null);
  const [usos, setUsos] = useState<UsoSoloArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [buscaUso, setBuscaUso] = useState("");
  const [usosFiltroMapa, setUsosFiltroMapa] = useState<Set<string>>(new Set());

  const usosFiltrados = usos.filter((u) =>
    u.desc_uso_solo.toLowerCase().includes(buscaUso.toLowerCase()),
  );

  const pontosFiltrados =
    usosFiltroMapa.size === 0
      ? pontos
      : pontos.filter((p) => usosFiltroMapa.has(p.desc_uso_solo));

  const toggleFiltroMapa = (uso: string) => {
    setUsosFiltroMapa((prev) => {
      const next = new Set(prev);
      if (next.has(uso)) next.delete(uso);
      else next.add(uso);
      return next;
    });
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PontoForm>({
    resolver: zodResolver(pontoSchema),
  });

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

  const handleMapClick = useCallback(
    (latlng: LatLng) => {
      setValue("latitude", parseFloat(latlng.lat.toFixed(6)));
      setValue("longitude", parseFloat(latlng.lng.toFixed(6)));
      setDialogOpen(true);
    },
    [setValue],
  );

  const onSubmit = async (form: PontoForm) => {
    try {
      await api.post("/gis/pontos", form);
      toast.success("Ponto registrado com sucesso");
      setDialogOpen(false);
      reset();
      fetchPontos();
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      toast.error(detail ?? "Erro ao registrar ponto");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Map size={22} className="text-emerald-600" />
          <div>
            <h1 className="text-2xl font-semibold">Mapa GIS</h1>
            <p className="text-sm text-muted-foreground">
              Clique dentro de uma região ou clique no botão no canto direito para registrar um ponto de amostragem.
            </p>
          </div>
        </div>
        <Button onClick={() => { reset(); setDialogOpen(true); }} className="gap-2">
          <Plus size={16} /> Novo Ponto
        </Button>
      </div>

      <div className="rounded-md border overflow-hidden h-[500px] relative z-0">
        {!geojson ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            Carregando mapa...
          </div>
        ) : (
          <MapContainer center={[-15, -50]} zoom={4} className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapClickHandler
              onMapClick={handleMapClick}
              disabled={dialogOpen}
              geojson={geojson}
            />
            <FitBoundsToGeoJSON data={geojson} />

            <GeoJSON
              key={`geojson-${Array.from(usosFiltroMapa).join(",")}`}
              data={geojson as any}
              style={(feature) => {
                const uso = feature?.properties?.desc_uso_solo ?? "";
                const cor = getCorUso(uso);
                const emDestaque =
                  usosFiltroMapa.size === 0 || usosFiltroMapa.has(uso);
                return {
                  color: "#fff",
                  weight: emDestaque ? 1.5 : 0.5,
                  fillOpacity: emDestaque ? 0.55 : 0.08,
                  fillColor: cor,
                };
              }}
              onEachFeature={(feature, layer) => {
                const uso = feature?.properties?.desc_uso_solo ?? "Desconhecido";
                const cor = getCorUso(uso);

                layer.bindTooltip(uso, { sticky: true });

                layer.on({
                  mouseover: (e) => {
                    const emDestaque =
                      usosFiltroMapa.size === 0 || usosFiltroMapa.has(uso);
                    if (!emDestaque) return;
                    e.target.setStyle({ fillOpacity: 0.85, weight: 2.5, color: "#fff", fillColor: cor });
                    e.target.bringToFront();
                  },
                  mouseout: (e) => {
                    const emDestaque =
                      usosFiltroMapa.size === 0 || usosFiltroMapa.has(uso);
                    e.target.setStyle({
                      fillOpacity: emDestaque ? 0.55 : 0.08,
                      weight: emDestaque ? 1.5 : 0.5,
                      color: "#fff",
                      fillColor: cor,
                    });
                  },
                });
              }}
            />

            {pontosFiltrados.map((p) => (
              <Marker
                key={p.id}
                position={[p.latitude, p.longitude]}
                eventHandlers={{
                  click: (e) => e.originalEvent.stopPropagation(),
                }}
              >
                <Popup>
                  <div className="text-sm space-y-1">
                    <p className="font-medium">{p.desc_uso_solo}</p>
                    <p className="text-muted-foreground">
                      {p.latitude.toFixed(6)}, {p.longitude.toFixed(6)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(p.created_at).toLocaleString("pt-BR")}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      {usos.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-muted-foreground mr-1">Filtrar regiões:</span>
          {usos.map((u) => {
            const ativo = usosFiltroMapa.has(u.desc_uso_solo);
            return (
              <button
                key={u.desc_uso_solo}
                onClick={() => toggleFiltroMapa(u.desc_uso_solo)}
                className={cn(
                  "flex items-center gap-1.5 text-xs px-2 py-1 rounded-md border transition-all",
                  ativo
                    ? "border-foreground bg-accent font-medium"
                    : "border-transparent hover:border-muted-foreground/40 text-muted-foreground",
                )}
              >
                <span
                  className="inline-block size-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: getCorUso(u.desc_uso_solo) }}
                />
                {u.desc_uso_solo}
              </button>
            );
          })}
          {usosFiltroMapa.size > 0 && (
            <button
              onClick={() => setUsosFiltroMapa(new Set())}
              className="text-xs px-2 py-1 rounded-md border border-muted-foreground/40 text-muted-foreground hover:text-foreground transition-all"
            >
              Limpar filtros ×
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Layers size={16} /> Usos do Solo
            </CardTitle>
            <Input
              placeholder="Buscar uso do solo..."
              value={buscaUso}
              onChange={(e) => setBuscaUso(e.target.value)}
              className="mt-2"
            />
          </CardHeader>
          <CardContent className="px-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Área (m²)</TableHead>
                  <TableHead className="text-right">Área (km²)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : usosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                      Nenhum resultado para "{buscaUso}"
                    </TableCell>
                  </TableRow>
                ) : (
                  usosFiltrados.map((u) => (
                    <TableRow key={u.desc_uso_solo}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block size-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: getCorUso(u.desc_uso_solo) }}
                          />
                          <span className="font-medium">{u.desc_uso_solo}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {u.area_m2.toLocaleString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {u.area_km2.toLocaleString("pt-BR", { minimumFractionDigits: 4 })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Pin size={16} /> Pontos Registrados
              <Badge variant="secondary" className="ml-auto">
                {pontosFiltrados.length}
                {usosFiltroMapa.size > 0 && (
                  <span className="ml-1 text-muted-foreground">/ {pontos.length}</span>
                )}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Uso do Solo</TableHead>
                  <TableHead className="text-right">Latitude</TableHead>
                  <TableHead className="text-right">Longitude</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pontosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                      {usosFiltroMapa.size > 0
                        ? "Nenhum ponto nas regiões selecionadas"
                        : "Nenhum ponto registrado"}
                    </TableCell>
                  </TableRow>
                ) : (
                  pontosFiltrados.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block size-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: getCorUso(p.desc_uso_solo) }}
                          />
                          <span className="font-medium">{p.desc_uso_solo}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm font-mono">
                        {p.latitude.toFixed(5)}
                      </TableCell>
                      <TableCell className="text-right text-sm font-mono">
                        {p.longitude.toFixed(5)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Ponto de Amostragem</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              O uso do solo será identificado automaticamente pelas coordenadas.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Latitude</Label>
                <Input
                  type="number"
                  step="any"
                  placeholder="-21.176700"
                  {...register("latitude", { valueAsNumber: true })}
                />
                {errors.latitude && (
                  <p className="text-sm text-destructive">{errors.latitude.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label>Longitude</Label>
                <Input
                  type="number"
                  step="any"
                  placeholder="-47.820800"
                  {...register("longitude", { valueAsNumber: true })}
                />
                {errors.longitude && (
                  <p className="text-sm text-destructive">{errors.longitude.message}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Registrando..." : "Registrar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}