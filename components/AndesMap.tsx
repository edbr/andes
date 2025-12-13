"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import SidebarFilters from "@/components/SidebarFilters";
import type { Feature, Point } from "geojson";
import type { FilterSpecification } from "maplibre-gl";
import MapLegend from "@/components/MapLegend";
import { Protocol } from "pmtiles";

// ------------------------------------------------------------
// TYPES
// ------------------------------------------------------------
interface VolcanoMountainProperties {
  name?: string;
  ele?: string;
  prominence?: string;
  natural?: "volcano" | "peak";
  image?: string;
  wikipedia?: string;
  wikidata?: string;
  ["volcano:status"]?: string;
  ["volcano:type"]?: string;
}

interface SkiResortProperties {
  name: string;
  ["contact:website"]?: string;
  website?: string;
}

// ------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------
function asLngLat(coords: any): [number, number] {
  return [coords[0], coords[1]];
}

function isPointFeature(feature: any): feature is Feature<Point> {
  return feature?.geometry?.type === "Point";
}

// ------------------------------------------------------------
// MAIN COMPONENT
// ------------------------------------------------------------
export default function AndesMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  // ------------------------------------------------------------
  // Volcano elevation filter
  // ------------------------------------------------------------
  const [filters, setFilters] = useState({
    elevation: [0, 6000],
    difficulty: null as string | null,
    season: null as string | null,
  });

  function applyVolcanoFilters() {
    const map = mapRef.current;
    if (!map?.getLayer("volcano-points")) return;

    const filter: any[] = ["all"];
    filter.push([">=", ["to-number", ["get", "ele"]], filters.elevation[0]]);
    filter.push(["<=", ["to-number", ["get", "ele"]], filters.elevation[1]]);

    map.setFilter("volcano-points", filter as FilterSpecification);
  }

  useEffect(() => applyVolcanoFilters(), [filters]);

  // ------------------------------------------------------------
  // TOGGLES
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
  // MAP INITIALIZATION
  // ------------------------------------------------------------
  useEffect(() => {
    const protocol = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);

    const map = new maplibregl.Map({
      container: mapContainer.current!,
      style: `https://api.maptiler.com/maps/outdoor/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`,
      center: [-71, -38],
      zoom: 5.2,
      pitch: 55,
      bearing: 10,
      maxBounds: [
        [-78, -48],
        [-62, -27],
      ],
      minZoom: 4,
      maxZoom: 14,
    });

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", async () => {
      // ----------------------------------------------------------
      // ICONS
      // ----------------------------------------------------------
      const loadIcon = async (id: string, url: string) => {
        if (map.hasImage(id)) return;
        const res = await map.loadImage(url);
        map.addImage(id, res.data, { pixelRatio: 2 });
      };

      await Promise.all([
        loadIcon("volcano-icon", "/icons/volcano.png"),
        loadIcon("mountain-icon", "/icons/mountain.png"),
        loadIcon("ski-icon", "/icons/ski.png"),
        loadIcon("parking-icon", "/icons/parking.png"),
      ]);

      // ----------------------------------------------------------
      // MOUNTAINS + VOLCANOES (OVERPASS DATA)
      // ----------------------------------------------------------
      map.addSource("mountain-volcano", {
        type: "geojson",
        data: "/data/mountain-volcano-clean.geojson",
      });
      map.addLayer({
        id: "volcano-points",
        type: "symbol",
        source: "mountain-volcano",
        filter: [
          "all",
          ["==", ["get", "natural"], "volcano"],
          ["has", "name"],
          ["!=", ["get", "name"], ""],
        ],
        layout: {
          "icon-image": "volcano-icon",
          "icon-size": 0.9,
          "icon-anchor": "bottom",
          "icon-allow-overlap": true,
        },
      });
      map.addLayer({
        id: "mountain-points",
        type: "symbol",
        source: "mountain-volcano",
        filter: ["==", ["get", "natural"], "peak"],
        layout: {
          "icon-image": "mountain-icon",
          "icon-size": 0.9,
          "icon-anchor": "bottom",
          "icon-allow-overlap": true,
        },
        paint: {
          "icon-opacity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            6, 0,
            8, 1,
          ],
        },
      });

      applyVolcanoFilters();

      // 🌋 Volcano popup
      map.on("click", "volcano-points", (e) => {
        const feature = e.features?.[0];
        if (!feature || !isPointFeature(feature)) return;

        const p = feature.properties as VolcanoMountainProperties;

        const wiki = p.wikipedia
          ? `<a href="https://wikipedia.org/wiki/${p.wikipedia.replace(
              ":",
              "_"
            )}" target="_blank">Wikipedia</a>`
          : "";

        const image = p.image
          ? `<img src="${p.image}" style="width:100%;margin-top:6px;border-radius:6px" />`
          : "";

        new maplibregl.Popup({ maxWidth: "320px" })
          .setLngLat(asLngLat(feature.geometry.coordinates))
          .setHTML(`
            <strong>${p.name ?? "Unnamed volcano"}</strong><br/>
            Elevation: ${p.ele ?? "unknown"} m<br/>
            Prominence: ${p.prominence ?? "unknown"} m<br/>
            Status: ${p["volcano:status"] ?? "unknown"}<br/>
            Type: ${p["volcano:type"] ?? "unknown"}<br/>
            ${wiki}
            ${image}
          `)
          .addTo(map);
      });

      // ⛰️ Mountain popup
      map.on("click", "mountain-points", (e) => {
        const feature = e.features?.[0];
        if (!feature || !isPointFeature(feature)) return;

        const p = feature.properties as VolcanoMountainProperties;

        new maplibregl.Popup()
          .setLngLat(asLngLat(feature.geometry.coordinates))
          .setHTML(`
            <strong>${p.name ?? "Unnamed peak"}</strong><br/>
            Elevation: ${p.ele ?? "unknown"} m<br/>
            Prominence: ${p.prominence ?? "unknown"} m
          `)
          .addTo(map);
      });

      // ----------------------------------------------------------
      // PARKING (CLUSTERED)
      // ----------------------------------------------------------
      map.addSource("parking", {
        type: "geojson",
        data: "/data/parking_points.geojson",
        cluster: true,
        clusterMaxZoom: 11,
        clusterRadius: 50,
      });

      map.addLayer({
        id: "parking-points",
        type: "symbol",
        source: "parking",
        filter: ["!", ["has", "point_count"]],
        layout: {
          "icon-image": "parking-icon",
          "icon-size": [
            "interpolate",
            ["linear"],
            ["zoom"],
            5, 0.2,
            9, 0.45,
          ],
          "icon-allow-overlap": true,
        },
      });

      // ----------------------------------------------------------
      // ROUTES
      // ----------------------------------------------------------
      map.addSource("osm-routes", {
        type: "vector",
        url: "pmtiles:///data/osm_routes.pmtiles",
      });

map.addLayer({
  id: "osm-routes-line",
  type: "line",
  source: "osm-routes",
  "source-layer": "osm_routes_clean", // ← FIXED
  layout: {
    "line-cap": "round",
    "line-join": "round",
  },
  paint: {
    "line-color": [
      "case",

      // Ski routes
      [
        "any",
        ["==", ["get", "route"], "ski"],
        ["==", ["get", "piste:type"], "skitour"]
      ],
      "#00A8FF",

      // Hiking / mountaineering
      [
        "any",
        ["==", ["get", "route"], "hiking"],
        ["==", ["get", "highway"], "path"],
        ["has", "sac_scale"]
      ],
      "#000000",

      // Default
      "#1976D2"
    ],

    "line-width": [
      "interpolate",
      ["linear"],
      ["zoom"],
      5, 0.0,
      7, 1.5,
      9, 1.5,
      11, 1.5
    ],

    "line-opacity": 0.9
  }
});


      // ----------------------------------------------------------
      // SKI RESORTS
      // ----------------------------------------------------------
      map.addSource("ski-resorts", {
        type: "geojson",
        data: "/data/ski_resorts_clean.geojson",
      });

      map.addLayer({
        id: "ski-resorts-points",
        type: "symbol",
        source: "ski-resorts",
        layout: {
          "icon-image": "ski-icon",
          "icon-size": 0.9,
          "icon-anchor": "bottom",
          "icon-allow-overlap": true,
        },
      });

      map.on("click", "ski-resorts-points", (e) => {
        const feature = e.features?.[0];
        if (!feature || !isPointFeature(feature)) return;

        const p = feature.properties as SkiResortProperties;
        const website = p["contact:website"] || p.website;

        new maplibregl.Popup()
          .setLngLat(asLngLat(feature.geometry.coordinates))
          .setHTML(`
            <strong>${p.name}</strong><br/>
            ${
              website
                ? `<a href="${website}" target="_blank">Visit website</a>`
                : `<span style="opacity:.6">No website listed</span>`
            }
          `)
          .addTo(map);
      });
    });

    return () => map.remove();
  }, []);

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
        onToggleMountains={toggleMountains} // ✅
        onToggleParking={toggleParking}
      />

      <div ref={mapContainer} className="w-full h-full" />
      <MapLegend />
    </div>
  );
}