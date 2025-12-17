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
  protectedAreas: boolean; // ✅ NEW
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
      protectedAreas: true,
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

    map.on("click", () => {
    document.dispatchEvent(new Event("close-map-panels"));
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
  // MAPLIBRE RE-MEASURE AFTER LOAD
  // ------------------------------------------------------------
useEffect(() => {
  if (!mapRef.current) return;

  const map = mapRef.current;

  const resize = () => {
    map.resize();
  };

  // Initial fix
  requestAnimationFrame(resize);

  // Orientation changes
  window.addEventListener("orientationchange", resize);
  window.addEventListener("resize", resize);

  return () => {
    window.removeEventListener("orientationchange", resize);
    window.removeEventListener("resize", resize);
  };
}, []);


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
      updateMapLayerVisibility("protected-areas-fill", false, "protectedAreas");
      defaultsAppliedRef.current = true;
    } else {
      // Reapply current state on style reload
      const mapping: Record<keyof LayerVisibilityState, string> = {
        routes: "route-lines",
        volcanoes: "volcano-points",
        mountains: "mountain-points",
        skiResorts: "ski-resorts-points",
        parking: "parking-points",
        protectedAreas: "protected-areas-fill",
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
  <div className="relative w-full h-dvh">
    {/* Map UI stack */}
    <div className="absolute top-4 left-4 z-50 flex flex-col gap-3 pt-[env(safe-area-inset-top)]">
      <SidebarFilters
  onFilterChange={setFilters}

  onToggleRoutes={(v: boolean) => {
    updateMapLayerVisibility("osm-routes-line", v, "routes");
    updateMapLayerVisibility("osm-routes-casing", v);
  }}

  onToggleVolcanoes={(v: boolean) =>
    updateMapLayerVisibility("volcano-points", v, "volcanoes")
  }

  onToggleMountains={(v: boolean) =>
    updateMapLayerVisibility("mountain-points", v, "mountains")
  }

  onToggleSkiResorts={(v: boolean) =>
    updateMapLayerVisibility("ski-resorts-points", v, "skiResorts")
  }

  onToggleParking={(v: boolean) =>
    updateMapLayerVisibility("parking-points", v, "parking")
  }

  onToggleProtectedAreas={(v: boolean) =>
    updateMapLayerVisibility("protected-areas-fill", v, "protectedAreas")
  }

  onToggleSkiOnly={() => {}}
/>


      <MapLegend />

      <MapStyleSelector
        value={mapStyle}
        onChange={handleStyleChange}
      />
    </div>

    {/* Map */}
    <div ref={mapContainer} className="w-full h-full" />
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
