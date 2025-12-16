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
// TYPES
// ============================================================
type SelectedProtectedArea = {
  id: string;
  name: string;
  category: string;
};

type LayerVisibilityState = {
  routes: boolean;
  volcanoes: boolean;
  mountains: boolean;
  skiResorts: boolean;
  parking: boolean;
};

// ============================================================
// ANDES MAP
// ============================================================
export default function AndesMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const defaultsAppliedRef = useRef(false);

  // ------------------------------------------------------------
  // STATE
  // ------------------------------------------------------------
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [filters, setFilters] = useState({
    elevation: [0, 6000] as [number, number],
  });

  const [mapStyle, setMapStyle] = useState<MapStyleKey>("topo");

  const [layerVisibility, setLayerVisibility] =
    useState<LayerVisibilityState>({
      routes: true,
      volcanoes: false,
      mountains: false,
      skiResorts: false,
      parking: false,
    });

  const [selectedArea, setSelectedArea] =
    useState<SelectedProtectedArea | null>(null);

  const isMobile =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 768px)").matches;

  const [showSidebar, setShowSidebar] = useState(!isMobile);
  const [showLegend, setShowLegend] = useState(!isMobile);

  // ------------------------------------------------------------
  // HELPERS
  // ------------------------------------------------------------
  function updateMapLayerVisibility(
    layerId: string,
    visible: boolean,
    key?: keyof LayerVisibilityState
  ) {
    const map = mapRef.current;
    if (!map || !map.getLayer(layerId)) return;

    map.setLayoutProperty(
      layerId,
      "visibility",
      visible ? "visible" : "none"
    );

    if (key) {
      setLayerVisibility((prev) => ({ ...prev, [key]: visible }));
    }
  }

  // ------------------------------------------------------------
  // TOOLTIP + CLICK INTERACTIONS
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
          <div class="andes-tooltip tooltip">
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

    map.on("click", "protected-areas-fill", (e) => {
      const feature = e.features?.[0];
      if (!feature) return;

      setSelectedArea({
        id: feature.id?.toString() ?? crypto.randomUUID(),
        name: feature.properties?.name ?? "Unnamed Area",
        category: feature.properties?.category ?? "unknown",
      });
    });

    map.on("click", (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ["protected-areas-fill"],
      });

      if (!features.length) {
        setSelectedArea(null);
      }
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

    // Apply defaults ONCE
    if (!defaultsAppliedRef.current) {
      updateMapLayerVisibility("route-lines", true, "routes");
      updateMapLayerVisibility("volcano-points", false, "volcanoes");
      updateMapLayerVisibility("mountain-points", false, "mountains");
      updateMapLayerVisibility("ski-resorts-points", false, "skiResorts");
      updateMapLayerVisibility("parking-points", false, "parking");
      defaultsAppliedRef.current = true;
    } else {
      // Reapply current state on style reload
      const mapping: Record<keyof LayerVisibilityState, string> = {
        routes: "route-lines",
        volcanoes: "volcano-points",
        mountains: "mountain-points",
        skiResorts: "ski-resorts-points",
        parking: "parking-points",
      };

      (Object.keys(layerVisibility) as (keyof LayerVisibilityState)[]).forEach(
        (key) => {
          updateMapLayerVisibility(mapping[key], layerVisibility[key]);
        }
      );
    }
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
  // STYLE SWITCHING
  // ------------------------------------------------------------
  function handleStyleChange(style: MapStyleKey) {
    const map = mapRef.current;
    if (!map) return;

    setMapStyle(style);
    map.setStyle(
      MAP_STYLES[style].url(process.env.NEXT_PUBLIC_MAPTILER_KEY!)
    );

    map.once("style.load", () => bootstrapMap(map));
  }

  if (!mounted) return null;

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------
  return (
    <div className="relative w-full h-screen">
      {/* Mobile controls */}
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

      {/* Sidebar */}
      {showSidebar && (
        <div className="absolute top-0 left-0 z-40">
          <SidebarFilters
            onFilterChange={setFilters}
            onToggleRoutes={(v) =>
              updateMapLayerVisibility("route-lines", v, "routes")
            }
            onToggleVolcanoes={(v) =>
              updateMapLayerVisibility("volcano-points", v, "volcanoes")
            }
            onToggleMountains={(v) =>
              updateMapLayerVisibility("mountain-points", v, "mountains")
            }
            onToggleSkiResorts={(v) =>
              updateMapLayerVisibility("ski-resorts-points", v, "skiResorts")
            }
            onToggleParking={(v) =>
              updateMapLayerVisibility("parking-points", v, "parking")
            }
            onToggleSkiOnly={() => {}}
          />
        </div>
      )}

      {/* Map */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Legend */}
      {showLegend && (
        <div className="absolute bottom-4 left-4 z-40">
          <MapLegend />
        </div>
      )}

      {/* Style selector */}
      <div className="absolute top-4 right-4 z-40 hidden md:block">
        <MapStyleSelector value={mapStyle} onChange={handleStyleChange} />
      </div>

      {/* Info panel */}
      <ProtectedAreaPanel
        area={selectedArea}
        onClose={() => setSelectedArea(null)}
      />
    </div>
  );
}

// ============================================================
// INFO PANEL
// ============================================================
function ProtectedAreaPanel({
  area,
  onClose,
}: {
  area: SelectedProtectedArea | null;
  onClose: () => void;
}) {
  if (!area) return null;

  return (
    <aside className="absolute top-0 right-0 z-40 h-full w-80 bg-white border-l shadow-lg p-4 overflow-y-auto">
      <button
        onClick={onClose}
        className="mb-4 text-sm text-slate-600 hover:text-slate-900"
      >
        Close
      </button>

      <h2 className="text-lg font-semibold">{area.name}</h2>
      <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
        {area.category}
      </p>
    </aside>
  );
}
