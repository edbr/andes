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

// ------------------------------------------------------------
// MAIN
// ------------------------------------------------------------
export default function AndesMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  // ------------------------------------------------------------
  // STATE
  // ------------------------------------------------------------
  const [filters, setFilters] = useState({
    elevation: [0, 6000] as [number, number],
  });

  const [mapStyle, setMapStyle] = useState<MapStyleKey>("topo");

  const [layerVisibility, setLayerVisibility] = useState({
  routes: true,
  volcanoes: false,
  mountains: false,
  skiResorts: false,
  parking: false,
});

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
      if (map?.getLayer(id)) {
        map.setLayoutProperty(id, "visibility", visible ? "visible" : "none");
      }
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
  // MAP INIT
  // ------------------------------------------------------------
  useEffect(() => {
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
  }, []);

  // ------------------------------------------------------------
  // HANDLE MAP STYLE CHANGE
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
  // UI
  // ------------------------------------------------------------
  return (
    <div className="relative w-full h-screen">
      <SidebarFilters
        onFilterChange={setFilters}
        onToggleRoutes={toggleRoutes}
        onToggleSkiOnly={toggleSkiRoutesOnly}
        onToggleSkiResorts={toggleSkiResorts}
        onToggleVolcanoes={toggleVolcanoes}
        onToggleMountains={toggleMountains}
        onToggleParking={toggleParking}
      />

      <MapStyleSelector
        value={mapStyle}
        onChange={handleStyleChange}
      />

      <div ref={mapContainer} className="w-full h-full" />

      <MapLegend />
    </div>
  );
}
