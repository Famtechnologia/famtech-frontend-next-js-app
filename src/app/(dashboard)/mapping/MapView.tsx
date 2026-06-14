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
}

export default function MapView({ farm, sections, assets, onBoundaryUpdate }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const layersRef = useRef<import("leaflet").LayerGroup | null>(null);

  /* init map once */
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const init = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      /* Fix broken default icon paths in webpack */
      // @ts-expect-error _getIconUrl
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const map = L.map(containerRef.current!, {
        center: [9.082, 8.675], // Nigeria centroid
        zoom: 6,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

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

  /* redraw layers when data changes */
  useEffect(() => {
    const draw = async () => {
      if (!mapRef.current || !layersRef.current) return;
      const L = (await import("leaflet")).default;

      layersRef.current.clearLayers();

      const bounds: [number, number][] = [];

      /* Farm boundary */
      if (farm?.boundary) {
        const farmLayer = L.geoJSON(farm.boundary as GeoJSON.GeoJsonObject, {
          style: { color: "#22c55e", weight: 2.5, fillOpacity: 0.08, fillColor: "#22c55e" },
        }).addTo(layersRef.current!);
        farmLayer.bindPopup(`<strong>${farm.name}</strong><br/>Farm boundary`);
        farmLayer.getBounds().isValid() && bounds.push(...Object.values(farmLayer.getBounds()) as unknown as [number,number][]);
        try {
          const b = farmLayer.getBounds();
          if (b.isValid()) mapRef.current!.fitBounds(b, { padding: [30, 30] });
        } catch { /* ignore */ }
      }

      /* Section boundaries */
      sections.forEach(s => {
        if (!s.boundary) return;
        const layer = L.geoJSON(s.boundary as GeoJSON.GeoJsonObject, {
          style: { color: "#f97316", weight: 2, fillOpacity: 0.12, fillColor: "#f97316" },
        }).addTo(layersRef.current!);
        layer.bindPopup(`<strong>${s.name}</strong>${s.cropType ? `<br/>Crop: ${s.cropType}` : ""}`);
      });

      /* Asset markers */
      assets.forEach(a => {
        if (!a.location) return;
        const [lng, lat] = a.location.coordinates;
        const emoji = a.assetType === "vehicle" ? "🚜" : a.assetType === "irrigation" ? "💧" : a.assetType === "sensor" ? "📡" : a.assetType === "storage" ? "🏚️" : "⚙️";
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
  }, [farm, sections, assets]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" style={{ minHeight: 400 }} />

      {/* Map hint overlay */}
      {!farm && (
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
