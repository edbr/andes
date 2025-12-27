"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import SidebarFilters from "@/components/map/SidebarFilters";
import MapLegend from "@/components/map/MapLegend";
import MapStyleSelector from "@/components/map/MapStyleSelector";
import SearchMap from "@/components/map/SearchMap";
import SnowLayer from "@/components/map/SnowLayer";

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
  const parkingHandlersBoundRef = useRef(false);

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
      pitch: enable3D ? 55 : 0,
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
/* ------------------------
   FILTERS (SAFE: MOUNTAINS + VOLCANOES)
------------------------ */
function applyElevationFilters() {
  const map = mapRef.current;
  if (!map) return;

  const [min, max] = filters.elevation;

  // Volcanoes — MUST restate semantic filter
  if (map.getLayer("volcano-points")) {
    const volcanoFilter: FilterSpecification = [
      "all",
      ["!", ["has", "point_count"]],
      ["has", "natural"],
      ["==", ["get", "natural"], "volcano"],
      [">=", ["to-number", ["get", "ele"]], min],
      ["<=", ["to-number", ["get", "ele"]], max],
    ];

    map.setFilter("volcano-points", volcanoFilter);
  }

  // Mountains — keep in sync
  if (map.getLayer("mountain-points")) {
    const mountainFilter: FilterSpecification = [
      "all",
      ["!", ["has", "point_count"]],
      ["has", "natural"],
      ["==", ["get", "natural"], "peak"],
      [">=", ["to-number", ["get", "ele"]], min],
      ["<=", ["to-number", ["get", "ele"]], max],
    ];

    map.setFilter("mountain-points", mountainFilter);
  }
}

/* ------------------------
   APPLY FILTERS
------------------------ */
useEffect(() => {
  applyElevationFilters();
}, [filters.elevation]);

  /* ------------------------
     ski resort tooltip
  ------------------------ */
  function setupSkiResortTooltips(map: maplibregl.Map) {
  const popup = new maplibregl.Popup({
    closeButton: false,
    closeOnClick: false,
    offset: 12,
    className: "andes-tooltip",
  });

  map.on("mouseenter", "ski-resorts-points", (e) => {
    map.getCanvas().style.cursor = "pointer";

    const feature = e.features?.[0];
    if (!feature) return;

    const name = feature.properties?.name ?? "Ski Resort";
    const country = feature.properties?.country;

    popup
      .setLngLat(e.lngLat)
      .setHTML(
        `<div>
          <div style="font-weight:600">${name}</div>
          ${
            country
              ? `<div style="font-size:11px;opacity:.7">${country}</div>`
              : ""
          }
        </div>`
      )
      .addTo(map);
  });

  map.on("mouseleave", "ski-resorts-points", () => {
    map.getCanvas().style.cursor = "";
    popup.remove();
  });
}
/* ------------------------ elevation toggle----------------------- */
  function setElevationColorVisible(map: maplibregl.Map, visible: boolean) {
  if (!map.getLayer("elevation-color")) return;

  map.setPaintProperty(
    "elevation-color",
    "color-relief-opacity",
    visible ? 0.35 : 0
  );
}
/* ------------------------
   Elevation colors (hypsometric tint)
------------------------ */
function addElevationColorLayer(map: maplibregl.Map) {
  // DEM source (lightweight, no terrain)
  if (!map.getSource("dem")) {
    map.addSource("dem", {
      type: "raster-dem",
      url: `https://api.maptiler.com/tiles/terrain-rgb/tiles.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`,
      tileSize: 256,
      maxzoom: 11,
    });
  }

  // Add layer (opacity defaults to 0 = OFF)
  if (!map.getLayer("elevation-color")) {
    map.addLayer({
      id: "elevation-color",
      type: "color-relief",
      source: "dem",
      paint: {
        "color-relief-opacity": 0,
        "color-relief-color": [
          "interpolate",
          ["linear"],
          ["elevation"],
          0, "#2c7bb6",
          500, "#abd9e9",
          1500, "#ffffbf",
          2500, "#fdae61",
          3500, "#f46d43",
          4500, "#d73027",
          6000, "#ffffff",
        ],
      },
    });
  }

  // Keep it below routes if they exist
  if (
    map.getLayer("elevation-color") &&
    map.getLayer("osm-routes-casing")
  ) {
    map.moveLayer("elevation-color", "osm-routes-casing");
  }
}

/* ------------------------
   Snowline (approximate)
------------------------ */
function addSnowlineLayer(map: maplibregl.Map) {
  // Requires DEM (already added by elevation-color)
  if (!map.getSource("dem")) return;

  if (!map.getLayer("snowline")) {
    map.addLayer({
      id: "snowline",
      type: "color-relief",
      source: "dem",
      paint: {
        // OFF by default
        "color-relief-opacity": 0,
        "color-relief-color": [
          "interpolate",
          ["linear"],
          ["elevation"],

          // meters → subtle snow band
  // Below snowline
  0,    "#d6c3a3",
  2400, "#edc379",

  // Transition zone
  2600, "#fcba03",
  2900, "#2bed96",

  // Likely snow
  3200, "#7a0cf0",
  3600, "#0cf0c2",

  // High alpine
  6000, "#0cf0f0",
],
      },
    });
  }

  // Keep it under routes & labels
  if (
    map.getLayer("snowline") &&
    map.getLayer("osm-routes-casing")
  ) {
    map.moveLayer("snowline", "osm-routes-casing");
  }
}

function setSnowlineVisible(map: maplibregl.Map, visible: boolean) {
  if (!map.getLayer("snowline")) return;

  map.setPaintProperty(
    "snowline",
    "color-relief-opacity",
    visible ? 0.45 : 0
  );
}


/* ------------------------
   MAP BOOTSTRAP
------------------------ */
async function bootstrapMap(map: maplibregl.Map) {
  await loadIcons(map);

  // --- Elevation color overlay (lightweight) ---
  addElevationColorLayer(map);
  addSnowlineLayer(map); // 👈 NEW
  // --- Data layers ---
  addRouteLayers(map);
  addMountainVolcanoLayers(map);
  addParkingLayers(map);
  addSkiResortLayers(map);

  // --- Tooltips ---
  setupSkiResortTooltips(map);
  setupTooltips(map);

  // --- Filters ---
  applyElevationFilters();

  /* ------------------------
     Parking → Google Maps directions
  ------------------------ */
  if (!parkingHandlersBoundRef.current) {
    parkingHandlersBoundRef.current = true;

    map.on("click", "parking-points", (e) => {
      const feature = e.features?.[0];
      if (!feature || feature.geometry.type !== "Point") return;

      const [lng, lat] = feature.geometry.coordinates as [number, number];

      const isMobile =
        /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

      const url = isMobile
        ? `https://maps.google.com/?daddr=${lat},${lng}`
        : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

      window.open(url, "_blank", "noopener,noreferrer");
    });

    map.on("mouseenter", "parking-points", () => {
      map.getCanvas().style.cursor = "pointer";
    });

    map.on("mouseleave", "parking-points", () => {
      map.getCanvas().style.cursor = "";
    });
  }

  /* ------------------------
     DEFAULT VISIBILITY
  ------------------------ */
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
      minZoom: 6,
      maxZoom: 20,
      maxBounds: ANDES_BOUNDS,
    });

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.once("load", () => {
      bootstrapMap(map);
      applyCameraMode(map, is3D);
      // 👇 DEBUG ONLY
      // @ts-ignore
      window.__map = map;
        });

    return () => {
      map.remove();
      mapRef.current = null;
      parkingHandlersBoundRef.current = false;
      defaultsAppliedRef.current = false;
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
    parkingHandlersBoundRef.current = false;

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
          onToggleProtectedAreas={(v) => {
          updateMapLayerVisibility("protected-areas-fill", v, "protectedAreas");
          updateMapLayerVisibility("protected-areas-outline", v);
          updateMapLayerVisibility("protected-areas-icons", v);
          updateMapLayerVisibility("protected-areas-labels", v);
        }}
          onToggleElevationColor={(v) => {
    const map = mapRef.current;
    if (!map) return;
    setElevationColorVisible(map, v);
  }}
    onToggleSnowline={(v) => {
    const map = mapRef.current;
    if (!map) return;
    setSnowlineVisible(map, v);
  }}
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
  <img
    src={
      is3D
        ? "/icons/ui/icon-2d.svg"
        : "/icons/ui/icon-3d.svg"
    }
    alt={is3D ? "2D view" : "3D view"}
    className="w-5 h-5"
    draggable={false}
  />
</button>


        <SearchMap map={mapRef.current ?? undefined} />
        <MapLegend />
         <SnowLayer map={mapRef.current} />
        <MapStyleSelector value={mapStyle} onChange={handleStyleChange} />
      </div>
    </div>
  );
}
