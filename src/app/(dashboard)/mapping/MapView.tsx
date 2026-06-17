"use client";

import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

const GEO_BASE =
  process.env.NEXT_PUBLIC_GEO_API_URL || "https://finite-enmu.sa.pipeops.app/api/v1";

interface FarmMapProps {
  farmId: string;
  authToken: string;
  tenantId: string;
}

export const FarmMap: React.FC<FarmMapProps> = ({ farmId, authToken, tenantId }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || !farmId) return;

    // Clean up previous map instance when farmId changes
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // 1. Initialize Mapbox
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: [3.358, 7.168], // Nigeria fallback
      zoom: 13,
    });
    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.on("load", async () => {
      try {
        // 2. Fetch GeoJSON from the geo service
        const response = await fetch(
          `${GEO_BASE}/import-export/farms/${farmId}/geojson`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "x-tenant-id": tenantId,
            },
          }
        );
        const geojson = await response.json();

        // 3. Add GeoJSON source
        map.addSource("farm-features", {
          type: "geojson",
          data: geojson,
        });

        // 4. Sections — fill
        map.addLayer({
          id: "sections-fill",
          type: "fill",
          source: "farm-features",
          filter: ["==", ["get", "featureType"], "section"],
          paint: {
            "fill-color": ["coalesce", ["get", "color"], "#4CAF50"],
            "fill-opacity": 0.4,
          },
        });

        // 5. Sections — border
        map.addLayer({
          id: "sections-stroke",
          type: "line",
          source: "farm-features",
          filter: ["==", ["get", "featureType"], "section"],
          paint: {
            "line-color": "#FFFFFF",
            "line-width": 1.5,
          },
        });

        // 6. Assets — orange circles
        map.addLayer({
          id: "assets-circle",
          type: "circle",
          source: "farm-features",
          filter: ["==", ["get", "featureType"], "asset"],
          paint: {
            "circle-radius": 6,
            "circle-color": "#FF5722",
            "circle-stroke-color": "#FFFFFF",
            "circle-stroke-width": 1,
          },
        });

        // 7. Farm boundary — yellow dashed line
        map.addLayer({
          id: "farm-boundary-line",
          type: "line",
          source: "farm-features",
          filter: ["==", ["get", "featureType"], "farm"],
          paint: {
            "line-color": "#FFEB3B",
            "line-width": 3,
            "line-dasharray": [2, 2],
          },
        });

        // 8. Auto-fit to farm bounds
        const farmFeature = geojson.features?.find(
          (f: GeoJSON.Feature) => f.properties?.featureType === "farm"
        );
        if (farmFeature?.geometry?.type === "Polygon") {
          const coordinates = (farmFeature.geometry as GeoJSON.Polygon).coordinates[0];
          const bounds = coordinates.reduce(
            (acc: mapboxgl.LngLatBounds, coord) => acc.extend(coord as [number, number]),
            new mapboxgl.LngLatBounds(
              coordinates[0] as [number, number],
              coordinates[0] as [number, number]
            )
          );
          map.fitBounds(bounds, { padding: 40 });
        }

        // ── Click interaction: sections popup ──
        map.on("click", "sections-fill", (e) => {
          const properties = e.features?.[0]?.properties;
          if (!properties) return;
          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(
              `<div style="font-family:sans-serif;padding:5px;">
                <h4 style="margin:0 0 5px 0;">${properties.name ?? ""}</h4>
                <strong>Type:</strong> ${properties.type ?? "section"}<br/>
                <strong>Crop:</strong> ${properties.cropType ?? "N/A"}<br/>
                <strong>Area:</strong> ${parseFloat(properties.areaHectares ?? "0").toFixed(2)} ha
              </div>`
            )
            .addTo(map);
        });

        // ── Click interaction: assets popup ──
        map.on("click", "assets-circle", (e) => {
          const properties = e.features?.[0]?.properties;
          if (!properties) return;
          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(
              `<div style="font-family:sans-serif;padding:5px;">
                <h4 style="margin:0 0 5px 0;">${properties.name ?? ""}</h4>
                <strong>Type:</strong> ${properties.type ?? "asset"}
              </div>`
            )
            .addTo(map);
        });

        // Cursor pointer on hover
        map.on("mouseenter", "sections-fill", () => { map.getCanvas().style.cursor = "pointer"; });
        map.on("mouseleave", "sections-fill", () => { map.getCanvas().style.cursor = ""; });
        map.on("mouseenter", "assets-circle",  () => { map.getCanvas().style.cursor = "pointer"; });
        map.on("mouseleave", "assets-circle",  () => { map.getCanvas().style.cursor = ""; });

      } catch (error) {
        console.error("Error loading farm geospatial data:", error);
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [farmId, authToken, tenantId]);

  return (
    <div ref={mapContainerRef} style={{ width: "100%", height: "100%", minHeight: 400 }} />
  );
};
