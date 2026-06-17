"use client";

import { useEffect, useRef } from "react";

type Farm = {
  id: string;
  name: string;
  boundary?: GeoJSON.Polygon | GeoJSON.MultiPolygon;
};

type Section = {
  id: string;
  name: string;
  farmId: string;
  cropType?: string;
  boundary?: GeoJSON.Polygon;
};

type Asset = {
  id: string;
  name: string;
  assetType: string;
  farmId: string;
  location?: GeoJSON.Point;
};

interface Props {
  farm: Farm | null;
  sections: Section[];
  assets: Asset[];
  onBoundaryUpdate: (farmId: string, boundary: GeoJSON.Polygon) => void;
  /** GeoJSON FeatureCollection from /import-export/farms/:id/geojson (preferred) */
  geoJSON?: GeoJSON.FeatureCollection | null;
}

const ASSET_EMOJI: Record<string, string> = {
  vehicle: "🚜",
  irrigation: "💧",
  sensor: "📡",
  storage: "🏚️",
};

export default function MapView({ farm, sections, assets, onBoundaryUpdate, geoJSON }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const layersRef = useRef<import("leaflet").LayerGroup | null>(null);

  /* init Leaflet map once */
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const init = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      // @ts-expect-error _getIconUrl
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const map = L.map(containerRef.current!, {
        center: [9.082, 8.675], // Nigeria centroid
        zoom: 6,
        zoomControl: true,
      });

      // Satellite tile layer (ESRI World Imagery — free, no token required)
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "Tiles © Esri — Source: Esri, DigitalGlobe, USDA FSA",
          maxZoom: 19,
        }
      ).addTo(map);

      // Labels overlay on top of satellite
      L.tileLayer(
        "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 19, opacity: 0.7 }
      ).addTo(map);

      layersRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
    };

    init();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        layersRef.current = null;
      }
    };
  }, []);

  /* redraw layers whenever data changes */
  useEffect(() => {
    const draw = async () => {
      if (!mapRef.current || !layersRef.current) return;
      const L = (await import("leaflet")).default;

      layersRef.current.clearLayers();

      // ── Prefer the unified GeoJSON FeatureCollection from import-export ──
      if (geoJSON && geoJSON.features?.length > 0) {
        geoJSON.features.forEach((feature) => {
          const type = feature.properties?.featureType as string;
          const name = feature.properties?.name as string ?? "";

          if (type === "farm") {
            // Yellow dashed farm boundary
            const layer = L.geoJSON(feature as GeoJSON.GeoJsonObject, {
              style: { color: "#FFEB3B", weight: 3, dashArray: "6 4", fillOpacity: 0.06, fillColor: "#FFEB3B" },
            }).addTo(layersRef.current!);
            layer.bindPopup(`<strong>${name}</strong><br/>Farm boundary`);
            try {
              const b = layer.getBounds();
              if (b.isValid()) mapRef.current!.fitBounds(b, { padding: [30, 30] });
            } catch { /* ignore */ }

          } else if (type === "section") {
            // Green fill for sections
            const cropType = feature.properties?.cropType as string ?? "";
            const areaHa   = parseFloat(feature.properties?.areaHectares ?? "0").toFixed(2);
            const layer = L.geoJSON(feature as GeoJSON.GeoJsonObject, {
              style: { color: "#ffffff", weight: 1.5, fillOpacity: 0.4, fillColor: feature.properties?.color ?? "#4CAF50" },
            }).addTo(layersRef.current!);
            layer.bindPopup(`
              <strong>${name}</strong><br/>
              ${cropType ? `Crop: ${cropType}<br/>` : ""}
              Area: ${areaHa} ha
            `);

          } else if (type === "asset" && feature.geometry?.type === "Point") {
            const [lng, lat] = (feature.geometry as GeoJSON.Point).coordinates;
            const assetType  = (feature.properties?.type ?? "other") as string;
            const emoji      = ASSET_EMOJI[assetType] ?? "⚙️";
            const icon = L.divIcon({
              html: `<span style="font-size:20px;line-height:1">${emoji}</span>`,
              className: "",
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            });
            const marker = L.marker([lat, lng], { icon }).addTo(layersRef.current!);
            marker.bindPopup(`<strong>${name}</strong><br/>${assetType}`);
          }
        });
        return;
      }

      // ── Fallback: render from separate farms/sections/assets props ──
      if (farm?.boundary) {
        const farmLayer = L.geoJSON(farm.boundary as GeoJSON.GeoJsonObject, {
          style: { color: "#FFEB3B", weight: 3, dashArray: "6 4", fillOpacity: 0.06, fillColor: "#FFEB3B" },
        }).addTo(layersRef.current!);
        farmLayer.bindPopup(`<strong>${farm.name}</strong><br/>Farm boundary`);
        try {
          const b = farmLayer.getBounds();
          if (b.isValid()) mapRef.current!.fitBounds(b, { padding: [30, 30] });
        } catch { /* ignore */ }
      }

      sections.forEach((s) => {
        if (!s.boundary) return;
        const layer = L.geoJSON(s.boundary as GeoJSON.GeoJsonObject, {
          style: { color: "#ffffff", weight: 1.5, fillOpacity: 0.4, fillColor: "#4CAF50" },
        }).addTo(layersRef.current!);
        layer.bindPopup(`<strong>${s.name}</strong>${s.cropType ? `<br/>Crop: ${s.cropType}` : ""}`);
      });

      assets.forEach((a) => {
        if (!a.location) return;
        const [lng, lat] = a.location.coordinates;
        const emoji = ASSET_EMOJI[a.assetType] ?? "⚙️";
        const icon = L.divIcon({
          html: `<span style="font-size:20px;line-height:1">${emoji}</span>`,
          className: "",
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });
        const marker = L.marker([lat, lng], { icon }).addTo(layersRef.current!);
        marker.bindPopup(`<strong>${a.name}</strong><br/>${a.assetType}`);
      });
    };

    draw();
  }, [farm, sections, assets, geoJSON]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" style={{ minHeight: 400 }} />

      {!farm && !geoJSON && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white/90 dark:bg-[#161b22]/90 border border-gray-200 dark:border-[#30363d] rounded-2xl px-6 py-4 text-center shadow-xl backdrop-blur-sm">
            <p className="text-sm font-bold text-gray-700 dark:text-[#c9d1d9]">Select or register a farm</p>
            <p className="text-xs text-gray-400 dark:text-[#484f58] mt-1">Farm boundaries and assets will appear here</p>
          </div>
        </div>
      )}
    </div>
  );
}
