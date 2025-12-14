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
// ANDES MAP (Client-only, hydration-safe)
// ============================================================
export default function AndesMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  // ------------------------------------------------------------
  // HYDRATION GUARD (CRITICAL)
  // ------------------------------------------------------------
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // ------------------------------------------------------------
  // STATE
  // ------------------------------------------------------------
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
  // VISIBILITY TOGGLES
  // ------------------------------------------------------------
  const toggleLayer =
    (id: string) => (visible: boolean) => {
      const map = mapRef.current;
      if (!map?.getLayer(id)) return;

      map.setLayoutProperty(
        id,
        "visibility",
        visible ? "visible" : "none"
      );
    };

  const toggleRoutes = toggleLayer("osm-routes-line");
  const toggleSkiResorts = toggleLayer("ski-resorts-points");
  const toggleVolcanoes = toggleLayer("volcano-points");
  const toggleMountains = toggleLayer("mountain-points");
  const toggleParking = toggleLayer("parking-points");

  function toggleSkiRoutesOnly(skiOnly: boolean) {
    const map = mapRef.current;
    if (!map?.getLayer("osm-routes-line")) return;

    map.setFilter(
      "osm-routes-line",
      skiOnly
        ? [
            "any",
            ["==", ["get", "route"], "ski"],
            ["==", ["get", "piste:type"], "skitour"],
          ]
        : ["all"]
    );
  }

  // ------------------------------------------------------------
  // MAP BOOTSTRAP (called on load + style change)
  // ------------------------------------------------------------
  async function bootstrapMap(map: maplibregl.Map) {
    await loadIcons(map);

    addRouteLayers(map);
    addMountainVolcanoLayers(map);
    addParkingLayers(map);
    addSkiResortLayers(map);

    applyVolcanoFilters();

    // Default visibility: routes only
    map.setLayoutProperty("volcano-points", "visibility", "none");
    map.setLayoutProperty("mountain-points", "visibility", "none");
    map.setLayoutProperty("ski-resorts-points", "visibility", "none");
    map.setLayoutProperty("parking-points", "visibility", "none");
  }

  // ------------------------------------------------------------
  // MAP INITIALIZATION
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

    map.on("load", () => {
      bootstrapMap(map);
    });

    return () => {
      map.remove();
    };
  }, [mounted]);

  // ------------------------------------------------------------
  // MAP STYLE CHANGE HANDLER
  // ------------------------------------------------------------
  function handleStyleChange(style: MapStyleKey) {
    const map = mapRef.current;
    if (!map) return;

    setMapStyle(style);

    map.setStyle(
      MAP_STYLES[style].url(process.env.NEXT_PUBLIC_MAPTILER_KEY!)
    );

    // IMPORTANT: re-add everything after style reload
    map.once("style.load", () => {
      bootstrapMap(map);
    });
  }

  // ------------------------------------------------------------
  // SSR SAFETY
  // ------------------------------------------------------------
  if (!mounted) {
    return null;
  }

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------
  return (
    <div className="relative w-full h-screen">
      {/* =========================
          Mobile Toggles
      ========================= */}
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

      {/* =========================
          Sidebar
      ========================= */}
      {showSidebar && (
        <div className="absolute top-0 left-0 z-40">
          <SidebarFilters
            onFilterChange={setFilters}
            onToggleRoutes={toggleRoutes}
            onToggleSkiOnly={toggleSkiRoutesOnly}
            onToggleSkiResorts={toggleSkiResorts}
            onToggleVolcanoes={toggleVolcanoes}
            onToggleMountains={toggleMountains}
            onToggleParking={toggleParking}
          />
        </div>
      )}

      {/* =========================
          Map Canvas (never animated)
      ========================= */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* =========================
          Legend
      ========================= */}
      {showLegend && (
        <div className="absolute bottom-4 left-4 z-40">
          <MapLegend />
        </div>
      )}

      {/* =========================
          Style Selector (desktop)
      ========================= */}
      <div className="absolute top-4 right-4 z-40 hidden md:block">
        <MapStyleSelector
          value={mapStyle}
          onChange={handleStyleChange}
        />
      </div>
    </div>
  );
}
