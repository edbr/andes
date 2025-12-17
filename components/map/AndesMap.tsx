"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import SidebarFilters from "@/components/map/SidebarFilters";
import MapLegend from "@/components/map/MapLegend";
import MapStyleSelector from "@/components/map/MapStyleSelector";
import SearchMap from "@/components/map/SearchMap";

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

/* ============================================================
   TYPES
============================================================ */
type LayerVisibilityState = {
  routes: boolean;
  volcanoes: boolean;
  mountains: boolean;
  skiResorts: boolean;
  parking: boolean;
  protectedAreas: boolean;
};

/* ============================================================
   CONSTANTS
============================================================ */
const ANDES_BOUNDS: [[number, number], [number, number]] = [
  [-78, -48],
  [-62, -27],
];

/* ============================================================
   ANDES MAP
============================================================ */
export default function AndesMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const defaultsAppliedRef = useRef(false);

  /* ------------------------
     STATE
  ------------------------ */
  const [mounted, setMounted] = useState(false);
  const [mapStyle, setMapStyle] = useState<MapStyleKey>("topo");
  const [is3D, setIs3D] = useState(false);

  const [filters, setFilters] = useState({
    elevation: [0, 6000] as [number, number],
  });

  const [layerVisibility, setLayerVisibility] =
    useState<LayerVisibilityState>({
      routes: true,
      volcanoes: false,
      mountains: false,
      skiResorts: false,
      parking: false,
      protectedAreas: true,
    });

  useEffect(() => setMounted(true), []);

  /* ------------------------
     CAMERA HELPERS
  ------------------------ */
  function applyCameraMode(map: maplibregl.Map, enable3D: boolean) {
    map.easeTo({
      pitch: enable3D ? 65 : 0,
      bearing: enable3D ? 10 : 0,
      duration: 800,
      essential: true,
    });
  }

  /* ------------------------
     HELPERS
  ------------------------ */
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

  /* ------------------------
     TOOLTIP
  ------------------------ */
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
        .setHTML(
          `<div>
             <div style="font-weight:600">${name}</div>
             <div style="font-size:11px;opacity:.7">${category}</div>
           </div>`
        )
        .addTo(map);
    });

    map.on("mouseleave", "protected-areas-fill", () => {
      map.getCanvas().style.cursor = "";
      popupRef.current?.remove();
    });

    map.on("click", () => {
      document.dispatchEvent(new Event("close-map-panels"));
    });
  }

  /* ------------------------
     FILTERS
  ------------------------ */
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

  /* ------------------------
     MAP BOOTSTRAP
  ------------------------ */
  async function bootstrapMap(map: maplibregl.Map) {
    await loadIcons(map);

    addRouteLayers(map);
    addMountainVolcanoLayers(map);
    addParkingLayers(map);
    addSkiResortLayers(map);

    setupTooltips(map);
    applyVolcanoFilters();

    if (!defaultsAppliedRef.current) {
      updateMapLayerVisibility("osm-routes-line", true, "routes");
      updateMapLayerVisibility("osm-routes-casing", true);
      updateMapLayerVisibility("volcano-points", false, "volcanoes");
      updateMapLayerVisibility("mountain-points", false, "mountains");
      updateMapLayerVisibility("ski-resorts-points", false, "skiResorts");
      updateMapLayerVisibility("parking-points", false, "parking");
      updateMapLayerVisibility(
        "protected-areas-fill",
        false,
        "protectedAreas"
      );
      defaultsAppliedRef.current = true;
    }

    requestAnimationFrame(() => map.resize());
    setTimeout(() => map.resize(), 100);
  }

  /* ------------------------
     MAP INIT
  ------------------------ */
  useEffect(() => {
    if (!mounted || !mapContainerRef.current) return;
    if (mapRef.current) return;

    registerPMTiles();

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLES[mapStyle].url(
        process.env.NEXT_PUBLIC_MAPTILER_KEY!
      ),
      center: [-71, -38],
      zoom: 5.2,
      pitch: 0,
      bearing: 0,
      minZoom: 4,
      maxZoom: 14,
      maxBounds: ANDES_BOUNDS,
    });

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.once("load", () => {
      bootstrapMap(map);
      applyCameraMode(map, is3D);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [mounted]);

  /* ------------------------
     STYLE SWITCH
  ------------------------ */
  function handleStyleChange(style: MapStyleKey) {
    const map = mapRef.current;
    if (!map) return;

    setMapStyle(style);
    defaultsAppliedRef.current = false;

    map.setStyle(
      MAP_STYLES[style].url(process.env.NEXT_PUBLIC_MAPTILER_KEY!)
    );

    map.once("style.load", () => {
      bootstrapMap(map);
      applyCameraMode(map, is3D);
    });
  }

  if (!mounted) return null;

  /* ------------------------
     RENDER
  ------------------------ */
  return (
    <div
      className="fixed inset-0 w-full overflow-hidden"
      style={{ height: "100dvh" }}
    >
      {/* MAP CONTAINER */}
      <div
        ref={mapContainerRef}
        className="absolute inset-0"
        style={{ height: "100%", width: "100%" }}
      />

      {/* UI STACK */}
      <div className="absolute top-4 left-4 z-50 flex flex-col gap-3 pt-[env(safe-area-inset-top)]">
        <SidebarFilters
          onFilterChange={setFilters}
          onToggleRoutes={(v) => {
            updateMapLayerVisibility("osm-routes-line", v, "routes");
            updateMapLayerVisibility("osm-routes-casing", v);
          }}
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
          onToggleProtectedAreas={(v) =>
            updateMapLayerVisibility(
              "protected-areas-fill",
              v,
              "protectedAreas"
            )
          }
          onToggleSkiOnly={() => {}}
        />

        <button
          onClick={() => {
            const map = mapRef.current;
            if (!map) return;

            const next = !is3D;
            setIs3D(next);
            applyCameraMode(map, next);
          }}
          className="map-ui-fab"
          title={is3D ? "Switch to 2D" : "Switch to 3D"}
        >
          {is3D ? "2D" : "3D"}
        </button>

        <SearchMap map={mapRef.current ?? undefined} />
        <MapLegend />
        <MapStyleSelector value={mapStyle} onChange={handleStyleChange} />
      </div>
    </div>
  );
}
