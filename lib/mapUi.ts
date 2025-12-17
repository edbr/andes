// lib/mapUi.ts
export function closeAllMapPanels() {
  document.dispatchEvent(new Event("close-map-panels"));
}
