import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

export function FitBoundsToGeoJSON({ data }: { data: object }) {
  const map = useMap();

  useEffect(() => {
    try {
      const bounds = L.geoJSON(data as any).getBounds();
      if (bounds.isValid()) map.fitBounds(bounds, { padding: [30, 30] });
    } catch {}
  }, [data, map]);

  return null;
}
