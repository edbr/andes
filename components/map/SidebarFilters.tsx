"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { closeAllMapPanels } from "@/lib/mapUi";

interface Props {
  onFilterChange: (filters: any) => void;
  onToggleRoutes: (visible: boolean) => void;
  onToggleSkiOnly: (skiOnly: boolean) => void;
  onToggleSkiResorts: (visible: boolean) => void;
  onToggleVolcanoes: (visible: boolean) => void;
  onToggleMountains: (visible: boolean) => void;
  onToggleParking: (visible: boolean) => void;
  onToggleProtectedAreas: (visible: boolean) => void;
}

export default function SidebarFilters(props: Props) {
  const {
    onFilterChange,
    onToggleRoutes,
    onToggleSkiOnly,
    onToggleSkiResorts,
    onToggleVolcanoes,
    onToggleMountains,
    onToggleParking,
    onToggleProtectedAreas,
  } = props;

  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef<number | null>(null);

  const [elevation, setElevation] = useState<[number, number]>([0, 6000]);

  const [layers, setLayers] = useState({
    routes: true,
    skiResorts: false,
    volcanoes: false,
    mountains: false,
    parking: false,
    protectedAreas: false,
  });

  /* ------------------------------------------------------------
     Close panel (idempotent + animated)
  ------------------------------------------------------------ */
  function closePanel() {
    if (!open || closing) return;

    setClosing(true);
    closeTimer.current = window.setTimeout(() => {
      setOpen(false);
      setClosing(false);
      closeTimer.current = null;
    }, 200);
  }

  /* ------------------------------------------------------------
     External close signal
  ------------------------------------------------------------ */
  useEffect(() => {
    function handleGlobalClose() {
      closePanel();
    }

    document.addEventListener("close-map-panels", handleGlobalClose);
    return () => {
      document.removeEventListener("close-map-panels", handleGlobalClose);
    };
  }, [open, closing]);

  /* ------------------------------------------------------------
     Layer toggle helper
  ------------------------------------------------------------ */
  function toggleLayer<K extends keyof typeof layers>(
    key: K,
    value: boolean,
    callback: (v: boolean) => void
  ) {
    setLayers((prev) => ({ ...prev, [key]: value }));
    callback(value);
  }

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
        aria-label="Open map filters"
      >
        <img
          src="/icons/ui/icon-filter.svg"
          alt="Filters"
          className="w-5 h-5"
          draggable={false}
        />
      </button>

      {/* ======================================================
          BOTTOM SHEET
      ====================================================== */}
      {open && (
        <div className="map-ui-sheet">
          <div className="map-ui-backdrop" onClick={closePanel} />

          <div className={`map-ui-panel ${closing ? "closing" : ""}`}>
            {/* Header */}
            <div className="map-ui-header">
              <div className="map-ui-grabber" />
              <h3 className="map-ui-title">Filters</h3>

              <button
                onClick={closePanel}
                className="map-ui-close-btn"
                aria-label="Close filters"
              >
                <img
                  src="/icons/ui/icon-close.svg"
                  alt="Close"
                  className="w-4 h-4"
                  draggable={false}
                />
              </button>
            </div>

            <Card className="border-0 shadow-none p-0 space-y-2 bg-transparent">
              {/* Elevation */}
              <div className="map-ui-section">
                <Label className="map-ui-section-label py-2">
                  Elevation (m)
                </Label>

                <Slider
                  min={0}
                  max={6000}
                  step={100}
                  value={elevation}
                  onValueChange={(v) => {
                    setElevation(v as [number, number]);
                    onFilterChange({ elevation: v });
                  }}
                />

                <p className="text-xs text-muted-foreground mt-1 py-2">
                  {elevation[0]}m – {elevation[1]}m
                </p>
              </div>

              {/* Layers */}
{/* Layers */}
<div className="pt-2 border-t space-y-4">
  <ToggleRow
    icon="/icons/markers/marker-protected-48.png"
    label="Protected Areas"
    checked={layers.protectedAreas}
    onChange={(v) =>
      toggleLayer("protectedAreas", v, onToggleProtectedAreas)
    }
  />

  <ToggleRow
    icon="/icons/markers/marker-volcano-48.png"
    label="Volcanoes"
    checked={layers.volcanoes}
    onChange={(v) =>
      toggleLayer("volcanoes", v, onToggleVolcanoes)
    }
  />

  <ToggleRow
    icon="/icons/markers/marker-mountain-48.png"
    label="Mountains"
    checked={layers.mountains}
    onChange={(v) =>
      toggleLayer("mountains", v, onToggleMountains)
    }
  />

  <ToggleRow
    icon="/icons/markers/marker-resort-48.png"
    label="Ski Resorts"
    checked={layers.skiResorts}
    onChange={(v) =>
      toggleLayer("skiResorts", v, onToggleSkiResorts)
    }
  />

  <ToggleRow
    icon="/icons/markers/marker-parking-48.png"
    label="Parking"
    checked={layers.parking}
    onChange={(v) =>
      toggleLayer("parking", v, onToggleParking)
    }
  />

  <ToggleRow
    icon="/icons/markers/marker-route-48.png"
    label="Routes"
    checked={layers.routes}
    onChange={(v) => {
      toggleLayer("routes", v, onToggleRoutes);
      if (!v) onToggleSkiOnly(false);
    }}
  />
</div>

            </Card>
          </div>
        </div>
      )}
    </>
  );
}

/* --------------------------------
   Toggle Row
-------------------------------- */

function ToggleRow({
  label,
  icon,
  checked,
  onChange,
}: {
  label: string;
  icon?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="map-ui-toggle-row flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {icon && (
          <img
            src={icon}
            alt=""
            className="w-8 h-8 object-contain opacity-80"
            draggable={false}
          />
        )}
        <span>{label}</span>
      </div>

      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
