"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { closeAllMapPanels } from "@/lib/mapUi";
import { cn } from "@/lib/utils";

interface Props {
  map?: maplibregl.Map | null;
}

const SNOW_OPACITY = 0.6;

export default function SnowLayer({ map }: Props) {
  const [enabled, setEnabled] = useState(false);
  const layerAddedRef = useRef(false);

  /* ------------------------------------------------------------
     Add snow layer safely (once per style)
  ------------------------------------------------------------ */
  useEffect(() => {
    if (!map) return;

    function addSnowLayer() {
      if (!map || layerAddedRef.current) return;

      if (!map.isStyleLoaded()) {
        map.once("style.load", addSnowLayer);
        return;
      }

      console.log("❄️ SnowLayer: adding source + layer");

      if (!map.getSource("snow-source")) {
        map.addSource("snow-source", {
          type: "image",
          url: "/snow/snow_test.png",
          coordinates: [
            [-78, -27], // NW
            [-62, -27], // NE
            [-62, -48], // SE
            [-78, -48], // SW
          ],
        });
      }

      if (!map.getLayer("snow-layer")) {
        map.addLayer({
          id: "snow-layer",
          type: "raster",
          source: "snow-source",
          paint: {
            "raster-opacity": enabled ? SNOW_OPACITY : 0,
          },
        });
      }

      layerAddedRef.current = true;
      console.log("❄️ SnowLayer: layer ready");
    }

    addSnowLayer();

    return () => {
      layerAddedRef.current = false;
    };
  }, [map]);
 
  /* ------------------------------------------------------------
     Toggle visibility
  ------------------------------------------------------------ */
  useEffect(() => {
    if (!map || !map.getLayer("snow-layer")) return;

    map.setPaintProperty(
      "snow-layer",
      "raster-opacity",
      enabled ? SNOW_OPACITY : 0
    );
  }, [enabled, map]);

  /* ------------------------------------------------------------
     Render FAB
  ------------------------------------------------------------ */
  return (
    <button
      onClick={() => {
        closeAllMapPanels();
        setEnabled((v) => !v);
      }}
      className={cn("map-ui-fab", enabled && "is-active")}
      aria-label="Toggle snow layer"
      title={enabled ? "Hide snow layer" : "Show snow layer"}
    >
      <img
        src="/icons/ui/icon-snow.svg"
        alt="Snow layer"
        className="w-5 h-5"
        draggable={false}
      />
    </button>
  );
}
