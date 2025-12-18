"use client";

import { useEffect, useRef, useState } from "react";
import { MAP_STYLES, MapStyleKey } from "@/map/styles";
import { closeAllMapPanels } from "@/lib/mapUi";

interface Props {
  value: MapStyleKey;
  onChange: (style: MapStyleKey) => void;
}

export default function MapStyleSelector({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const closeTimeout = useRef<number | null>(null);

  /* ------------------------------------------------------------
     Close with animation (safe + idempotent)
  ------------------------------------------------------------ */
  function close() {
    if (closing || closeTimeout.current) return;

    setClosing(true);
    closeTimeout.current = window.setTimeout(() => {
      setOpen(false);
      setClosing(false);
      closeTimeout.current = null;
    }, 200);
  }

  /* ------------------------------------------------------------
     Global close handler
  ------------------------------------------------------------ */
  useEffect(() => {
    function handleGlobalClose() {
      if (open) close();
    }

    document.addEventListener("close-map-panels", handleGlobalClose);
    return () => {
      document.removeEventListener("close-map-panels", handleGlobalClose);
    };
  }, [open]);

  /* ------------------------------------------------------------
     ESC key support
  ------------------------------------------------------------ */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && open) close();
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* ======================================================
          FAB — ALWAYS VISIBLE
      ====================================================== */}
      <button
        onClick={() => {
          if (closing) return;

          if (open) {
            close();
          } else {
            closeAllMapPanels();
            setOpen(true);
          }
        }}
        className="map-ui-fab"
        aria-label="Change map style"
      >
        <img
          src="/icons/ui/icon-layers.svg"
          alt="Map styles"
          className="w-5 h-5"
          draggable={false}
        />
      </button>

      {/* ======================================================
          BOTTOM SHEET
      ====================================================== */}
      {open && (
        <div className="map-ui-sheet">
          {/* Backdrop */}
          <div className="map-ui-backdrop" onClick={close} />

          {/* Panel */}
          <div className={`map-ui-panel ${closing ? "closing" : ""}`}>
            <div className="map-ui-header">
              <div className="map-ui-grabber" />

              <h3 className="map-ui-title">Map Style</h3>

              <button
                onClick={close}
                className="map-ui-close-btn"
                aria-label="Close map style"
              >
                <img
                  src="/icons/ui/icon-close.svg"
                  alt="Close"
                  className="w-4 h-4"
                  draggable={false}
                />
              </button>
            </div>

            <select
              className="
                w-full
                text-sm
                border
                rounded-md
                px-3
                py-2
                bg-white
                focus:outline-none
                focus:ring-1
                focus:ring-slate-300
              "
              value={value}
              onChange={(e) =>
                onChange(e.target.value as MapStyleKey)
              }
            >
              {Object.entries(MAP_STYLES).map(([key, s]) => (
                <option key={key} value={key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </>
  );
}
