import { useMapEvents } from "react-leaflet";
import type { LatLng } from "leaflet";
import { toast } from "sonner";
import * as turf from "@turf/turf";

interface MapClickHandlerProps {
  onMapClick: (latlng: LatLng) => void;
  disabled: boolean;
  geojson: object | null;
}

export function MapClickHandler({
  onMapClick,
  disabled,
  geojson,
}: MapClickHandlerProps) {
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
        toast.warning(
          "Clique dentro de uma região do mapa para registrar um ponto.",
        );
        return;
      }

      onMapClick(e.latlng);
    },
  });
  return null;
}
