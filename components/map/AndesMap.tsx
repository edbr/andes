"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import SidebarFilters from "@/components/map/SidebarFilters";
import MapLegend from "@/components/map/MapLegend";
import MapStyleSelector from "@/components/map/MapStyleSelector";

import { registerPMTiles } from "@/map/protocol";
import { loadIcons } from "@/map/icons";
import {
  addRouteLayers,
  addMountainVolcanoLayers,
  addParkingLayers,
  addSkiResortLayers,
} from "@/map/layers";
import { MAP_STYLES, type MapStyleKey } from "@/map/styles";

import type { FilterSpecification } from "maplibre-gl";

// ============================================================
// ANDES MAP
// ============================================================
export default function AndesMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);

  // Hydration guard
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // State
  const [filters, setFilters] = useState({
    elevation: [0, 6000] as [number, number],
  });

  const [mapStyle, setMapStyle] = useState<MapStyleKey>("topo");

  const isMobile =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 768px)").matches;

  const [showSidebar, setShowSidebar] = useState(!isMobile);
  const [showLegend, setShowLegend] = useState(!isMobile);

  // ------------------------------------------------------------
  // TOOLTIP SETUP (SAFE + IDPOTENT)
  // ------------------------------------------------------------
  function setupTooltips(map: maplibregl.Map) {
    if (!popupRef.current) {
      popupRef.current = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 12,
        className: "andes-tooltip",
      });
    }

    // ---- Protected Areas ----
    map.on("mousemove", "protected-areas-fill", (e) => {
      const feature = e.features?.[0];
      if (!feature || !popupRef.current) return;

      map.getCanvas().style.cursor = "pointer";

      const name = feature.properties?.name;
      const category = feature.properties?.category
        ?.replace("_", " ")
        ?.toUpperCase();

      popupRef.current
        .setLngLat(e.lngLat)
        .setHTML(`
          <div class="tooltip">
            <div class="tooltip-title">${name}</div>
            <div class="tooltip-sub">${category}</div>
          </div>
        `)
        .addTo(map);
    });

    map.on("mouseleave", "protected-areas-fill", () => {
      map.getCanvas().style.cursor = "";
      popupRef.current?.remove();
    });
  }

  // ------------------------------------------------------------
  // FILTERS
  // ------------------------------------------------------------
  function applyVolcanoFilters() {
    const map = mapRef.current;
    if (!map?.getLayer("volcano-points")) return;

    const filter: FilterSpecification = [
      "all",
      [">=", ["to-number", ["get", "ele"]], filters.elevation[0]],
      ["<=", ["to-number", ["get", "ele"]], filters.elevation[1]],
    ];

    map.setFilter("volcano-points", filter);
  }

  useEffect(() => {
    applyVolcanoFilters();
  }, [filters]);

  // ------------------------------------------------------------
  // BOOTSTRAP MAP CONTENT
  // ------------------------------------------------------------
  async function bootstrapMap(map: maplibregl.Map) {
    await loadIcons(map);

    addRouteLayers(map);
    addMountainVolcanoLayers(map);
    addParkingLayers(map);
    addSkiResortLayers(map);

    setupTooltips(map);
    applyVolcanoFilters();

    // Default visibility
    map.setLayoutProperty("volcano-points", "visibility", "none");
    map.setLayoutProperty("mountain-points", "visibility", "none");
    map.setLayoutProperty("ski-resorts-points", "visibility", "none");
    map.setLayoutProperty("parking-points", "visibility", "none");
  }

  // ------------------------------------------------------------
  // MAP INIT
  // ------------------------------------------------------------
  useEffect(() => {
    if (!mounted) return;

    registerPMTiles();

    const map = new maplibregl.Map({
      container: mapContainer.current!,
      style: MAP_STYLES[mapStyle].url(
        process.env.NEXT_PUBLIC_MAPTILER_KEY!
      ),
      center: [-71, -38],
      zoom: 5.2,
      pitch: 55,
      bearing: 10,
      minZoom: 4,
      maxZoom: 14,
      maxBounds: [
        [-78, -48],
        [-62, -27],
      ],
    });

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", () => bootstrapMap(map));

    return () => map.remove();
  }, [mounted]);

  // ------------------------------------------------------------
  // STYLE SWITCHING (NO TOOLTIP LOGIC HERE)
  // ------------------------------------------------------------
  function handleStyleChange(style: MapStyleKey) {
    const map = mapRef.current;
    if (!map) return;

    setMapStyle(style);

    map.setStyle(
      MAP_STYLES[style].url(process.env.NEXT_PUBLIC_MAPTILER_KEY!)
    );

    map.once("style.load", () => {
      bootstrapMap(map);
    });
  }

  if (!mounted) return null;

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------
  return (
    <div className="relative w-full h-screen">
      <div className="absolute top-4 left-4 z-50 flex gap-2 md:hidden">
        <button
          onClick={() => setShowSidebar((v) => !v)}
          className="px-3 py-1 text-sm rounded-md bg-white/90 shadow"
        >
          Filters
        </button>
        <button
          onClick={() => setShowLegend((v) => !v)}
          className="px-3 py-1 text-sm rounded-md bg-white/90 shadow"
        >
          Legend
        </button>
      </div>

      {showSidebar && (
        <div className="absolute top-0 left-0 z-40">
          <SidebarFilters
            onFilterChange={setFilters}
            onToggleRoutes={(v) => {}}
            onToggleSkiOnly={() => {}}
            onToggleSkiResorts={(v) => {}}
            onToggleVolcanoes={(v) => {}}
            onToggleMountains={(v) => {}}
            onToggleParking={(v) => {}}
          />
        </div>
      )}

      <div ref={mapContainer} className="w-full h-full" />

      {showLegend && (
        <div className="absolute bottom-4 left-4 z-40">
          <MapLegend />
        </div>
      )}

      <div className="absolute top-4 right-4 z-40 hidden md:block">
        <MapStyleSelector value={mapStyle} onChange={handleStyleChange} />
      </div>
    </div>
  );
}
