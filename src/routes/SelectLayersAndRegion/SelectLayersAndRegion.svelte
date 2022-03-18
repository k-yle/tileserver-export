<script lang="ts">
  import "leaflet/dist/leaflet.css";
  import "leaflet-editable";

  import { createEventDispatcher } from "svelte";
  import Button from "@smui/button";

  import type { Coord, ELI, MapSelection, PermaLink } from "../../types";
  import LayerPanel from "./LayerPanel.svelte";
  import MapPanel from "./MapPanel.svelte";

  const dispatch = createEventDispatcher<{ select: MapSelection }>();

  let rectPlaced = false;
  let mapPanel: MapPanel;
  let selectedLayers: ELI[];

  export let home: Coord;

  /** the params from the URL, if they're valid */
  const init = ((): PermaLink | null => {
    const [_z, _x, _y, _layers] = window.location.hash.slice(1).split("/");
    const [z, x, y] = [+_z, +_x, +_y];
    const layers = _layers?.split(",");

    if (Number.isNaN(z) || Number.isNaN(x) || Number.isNaN(y)) return null;
    if (!layers?.length) return null;

    return { x, y, z, layers };
  })();

  function go() {
    const bbox = mapPanel.getRectBBox();

    dispatch("select", { layers: selectedLayers, bbox });
  }
</script>

<div class="status">
  {#if rectPlaced}
    <strong>Step 2:</strong> Drag the red box to refine the extract area.
    <Button variant="raised" on:click={go}>Next</Button>
  {:else}
    <strong>Step 1:</strong> Select an imagery source, and move the map to the
    approximate area you want to export.
    <Button variant="raised" on:click={mapPanel.addRectangle}>Next</Button>
  {/if}
</div>

{#if mapPanel}
  <LayerPanel
    map={mapPanel.getMap()}
    {init}
    bind:fullSelection={selectedLayers}
  />
{/if}

<div class="map">
  <MapPanel
    bind:this={mapPanel}
    {home}
    {selectedLayers}
    {init}
    bind:rectPlaced
  />
</div>

<style>
  .status {
    grid-area: status;
    padding: 16px;
  }
  .map {
    grid-area: map;
    z-index: 0; /* so that the dialog shows on top */
  }
</style>
