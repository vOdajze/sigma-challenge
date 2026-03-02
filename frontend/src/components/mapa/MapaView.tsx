import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from "react-leaflet";
import type { LatLng } from "leaflet";
import "leaflet/dist/leaflet.css";
import "@/lib/leaflet-fix.ts";
import type { PontoResponse } from "@/types";
import { getCorUso } from "@/lib/map-colors";
import { MapClickHandler } from "./MapClickHandler";
import { FitBoundsToGeoJSON } from "./FitBoundsToGeoJson";

interface MapaViewProps {
  geojson: object | null;
  pontosFiltrados: PontoResponse[];
  usosFiltroMapa: Set<string>;
  dialogOpen: boolean;
  onMapClick: (latlng: LatLng) => void;
}

export function MapaView({
  geojson,
  pontosFiltrados,
  usosFiltroMapa,
  dialogOpen,
  onMapClick,
}: MapaViewProps) {
  if (!geojson) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
        Carregando mapa...
      </div>
    );
  }

  return (
    <MapContainer
      center={[-15, -50]}
      zoom={4}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapClickHandler
        onMapClick={onMapClick}
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
              e.target.setStyle({
                fillOpacity: 0.85,
                weight: 2.5,
                color: "#fff",
                fillColor: cor,
              });
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
  );
}
