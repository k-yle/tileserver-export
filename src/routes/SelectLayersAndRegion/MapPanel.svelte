<script lang="ts">
  import type { MapOptions } from "leaflet";
  import { LeafletMap, TileLayer } from "svelte-leafletjs";
  import type { Coord, ELI, PermaLink } from "../../types";
  import { EditablePolygon } from "../../components";
  import { convertTileUrl } from "../../helpers";

  export let home: Coord;
  export let selectedLayers: ELI[];
  export let rectPlaced: boolean;
  export let init: PermaLink | null;

  $: renderableLayers = selectedLayers?.filter((l) => l.type === "tms");

  let rect: EditablePolygon;
  let map: LeafletMap;

  export function getMap() {
    return map.getMap();
  }
  export function getRectBBox() {
    return rect.getBBox();
  }
  export function addRectangle() {
    rect.addRectangle();
  }

  const mapOptions: MapOptions = {
    center: init ? [init.x, init.y] : home,
    zoom: init?.z ?? 16,
    editable: true,
  };

  function escapeText(unsafe: string) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function attributionToHtml(a: ELI["attribution"]) {
    if (!a?.text) return undefined;

    return a.url
      ? `<a href="${encodeURI(
          a.url
        )}" target="_blank" rel="noopener noreferrer">${escapeText(a.text)}</a>`
      : a.text;
  }
</script>

<LeafletMap options={mapOptions} bind:this={map}>
  {#if renderableLayers}
    {#each renderableLayers as layer, i (layer.id)}
      <TileLayer
        url={convertTileUrl(layer.url)}
        options={{
          attribution: attributionToHtml(layer.attribution),
          minZoom: 0,
          maxZoom: 20,
          maxNativeZoom: layer.max_zoom,
          minNativeZoom: layer.min_zoom,
          zIndex: i,
        }}
      />
    {/each}
  {/if}
  <EditablePolygon bind:ready={rectPlaced} bind:this={rect} />
</LeafletMap>
