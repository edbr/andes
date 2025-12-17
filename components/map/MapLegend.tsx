"use client";

import { useEffect, useRef, useState } from "react";
import { Map, X } from "lucide-react";
import { closeAllMapPanels } from "@/lib/mapUi";

export default function MapLegend() {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const closeTimeout = useRef<number | null>(null);

  // ------------------------------------------------------------
  // Close with animation (safe + idempotent)
  // ------------------------------------------------------------
  function close() {
    if (closeTimeout.current) return;

    setClosing(true);
    closeTimeout.current = window.setTimeout(() => {
      setOpen(false);
      setClosing(false);
      closeTimeout.current = null;
    }, 200);
  }

  // ------------------------------------------------------------
  // Global close handler (map click, other panels)
  // ------------------------------------------------------------
  useEffect(() => {
    function handleClose() {
      if (open) close();
    }

    document.addEventListener("close-map-panels", handleClose);
    return () => {
      document.removeEventListener("close-map-panels", handleClose);
    };
  }, [open]);

  return (
    <>
      {/* ======================================================
          FAB — ALWAYS VISIBLE
      ====================================================== */}
      <button
        onClick={() => {
        closeAllMapPanels();
        setOpen(true);
      }}
        className="map-ui-fab"
        aria-label="Open map legend"
      >
        <Map className="w-5 h-5" />
      </button>

      {/* ======================================================
          BOTTOM SHEET
      ====================================================== */}
      {open && (
        <div className="map-ui-sheet">
          {/* Backdrop (tap-through allowed) */}
          <div className="map-ui-backdrop" onClick={close} />

          {/* Panel */}
          <div className={`map-ui-panel ${closing ? "closing" : ""}`}>
            {/* Header */}
            <div className="map-ui-header">
              <div className="map-ui-grabber" />
              <h3 className="map-ui-title">Map Legend</h3>

              <button
                onClick={close}
                className="map-ui-close-btn"
                aria-label="Close legend"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* =========================
                POINT FEATURES
            ========================= */}
            <div className="map-ui-section">
              <span className="map-ui-section-label">Points</span>

              <LegendRow
                icon="/icons/ski.png"
                label="Ski Resort / Base Area"
                size="w-6 h-6"
              />
              <LegendRow
                icon="/icons/volcano.png"
                label="Volcano (Ski Objective)"
                size="w-6 h-6"
              />
              <LegendRow
                icon="/icons/mountain.png"
                label="Major Mountain / Peak"
                size="w-5 h-5"
              />
              <LegendRow
                icon="/icons/parking.png"
                label="Parking / Trailhead"
                size="w-4 h-4"
              />
            </div>

            {/* =========================
                LINE FEATURES
            ========================= */}
            <div className="map-ui-section">
              <span className="map-ui-section-label">Routes</span>

              <LegendLine
                color="#4FC3F7"
                label="Ski Route / Ski Tour"
              />
              <LegendLine
                color="#5A5A5A"
                label="Mountain Hiking / Alpine Access"
              />
              <LegendLine
                color="#B0B8C0"
                label="Urban / Lowland Path"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* --------------------------------
   Helper components
-------------------------------- */

function LegendRow({
  icon,
  label,
  size,
}: {
  icon: string;
  label: string;
  size: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-2">
      <img src={icon} alt={label} className={`${size} object-contain`} />
      <span className="text-gray-800 text-sm">{label}</span>
    </div>
  );
}

function LegendLine({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-2">
      <span
        className="inline-block w-6 h-[3px] rounded"
        style={{ backgroundColor: color }}
      />
      <span className="text-gray-800 text-sm">{label}</span>
    </div>
  );
}
