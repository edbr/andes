"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import maplibregl from "maplibre-gl";
import { closeAllMapPanels } from "@/lib/mapUi";

interface Props {
  map?: maplibregl.Map | null;
}

type SearchResult = {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  class: string;
  type: string;
};

/* ============================================================
   Ranking helper — soft preference for outdoor features
============================================================ */
function scoreResult(p: SearchResult) {
  let score = 0;

  if (p.class === "natural") score += 3;
  if (p.class === "leisure") score += 2;
  if (p.class === "boundary") score += 1;

  if (p.type?.includes("lake")) score += 3;
  if (p.type?.includes("volcano")) score += 4;
  if (p.type?.includes("peak")) score += 4;
  if (p.type?.includes("mountain")) score += 4;
  if (p.type?.includes("park")) score += 2;
  if (p.type?.includes("valley")) score += 2;

  return score;
}

export default function MapSearch({ map }: Props) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  const closeTimeout = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ------------------------------------------------------------
     Helpers
  ------------------------------------------------------------ */

  function getBoundsParam() {
    if (!map) return "";
    const b = map.getBounds();
    return `&viewbox=${b.getWest()},${b.getNorth()},${b.getEast()},${b.getSouth()}&bounded=1`;
  }

  function openDirections(place: SearchResult) {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`,
      "_blank"
    );
  }

  function selectResult(place: SearchResult) {
    if (!map) return;

    map.flyTo({
      center: [Number(place.lon), Number(place.lat)],
      zoom: Math.max(map.getZoom(), 12),
      speed: 0.8,
    });

    close();
  }

  /* ------------------------------------------------------------
     Open / Close
  ------------------------------------------------------------ */

  function openPanel() {
    closeAllMapPanels();
    setOpen(true);
  }

  function close() {
    if (closeTimeout.current) return;

    setClosing(true);
    closeTimeout.current = window.setTimeout(() => {
      setOpen(false);
      setClosing(false);
      setResults([]);
      setQuery("");
      closeTimeout.current = null;
    }, 200);
  }

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  useEffect(() => {
    function handleClose() {
      if (open) close();
    }

    document.addEventListener("close-map-panels", handleClose);
    return () =>
      document.removeEventListener("close-map-panels", handleClose);
  }, [open]);

  /* ------------------------------------------------------------
     Search
  ------------------------------------------------------------ */

  async function runSearch(value: string) {
    setQuery(value);

    if (value.length < 3) {
      setResults([]);
      return;
    }

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        value
      )}${getBoundsParam()}`
    );

    const data: SearchResult[] = await res.json();

    const ranked = data
      .map((p) => ({ ...p, _score: scoreResult(p) }))
      .sort((a, b) => b._score - a._score)
      .slice(0, 8);

    setResults(ranked);
  }

  /* ------------------------------------------------------------
     Render
  ------------------------------------------------------------ */

  return (
    <>
      {/* FAB */}
      <button
        onClick={openPanel}
        className="map-ui-fab"
        aria-label="Search map"
      >
        <Search />
      </button>

      {open && (
        <div className="map-ui-sheet">
          <div className="map-ui-backdrop" onClick={close} />

          <div className={`map-ui-panel ${closing ? "closing" : ""}`}>
            {/* Header */}
            <div className="map-ui-header">
              <div className="map-ui-grabber" />
              <h3 className="map-ui-title">Search</h3>

              <button
                onClick={close}
                className="map-ui-close-btn"
                aria-label="Close search"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Input */}
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => runSearch(e.target.value)}
               inputMode="search"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              placeholder="Search lakes, peaks, volcanoes, parks…"
              className="
                w-full
                mb-3
                rounded-md
                border
                px-3
                py-2
                text-sm
                focus:outline-none
                focus:ring-1
                focus:ring-slate-300
              "
            />

            {/* Results */}
            <ul className="space-y-2">
              {results.map((place) => (
                <li
                  key={place.place_id}
                  className="
                    rounded-md
                    px-3
                    py-2
                    border
                    bg-white
                    flex
                    items-center
                    justify-between
                    gap-3
                  "
                >
                  <button
                    onClick={() => selectResult(place)}
                    className="text-left flex-1"
                  >
                    <div className="font-medium text-slate-900">
                      {place.display_name.split(",")[0]}
                    </div>
                    <div className="text-xs text-slate-500">
                      {place.display_name}
                    </div>
                  </button>

                  <button
                    onClick={() => openDirections(place)}
                    className="
                      text-xs
                      px-2
                      py-1
                      rounded
                      border
                      hover:bg-slate-100
                    "
                  >
                    Directions
                  </button>
                </li>
              ))}

              {query.length >= 3 && results.length === 0 && (
                <li className="text-xs text-slate-500 px-2">
                  No places found in this area
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
