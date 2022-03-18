<script lang="ts">
  import L from "leaflet";
  import { getContext } from "svelte";
  import { LeafletContext, Rectangle } from "svelte-leafletjs";
  import { toBBox } from "../helpers";
  import type { Coord } from "../types";

  const { getMap } = getContext<LeafletContext.Map>(L);
  const map = getMap();

  let rect: Rectangle;

  // props
  export let ready = false;
  export function getBBox() {
    return toBBox(rect.getRectangle().getBounds());
  }

  let initRect: Coord[];

  export function addRectangle() {
    const bounds = map.getBounds();
    const [N, S, E, W] = [
      bounds.getNorth(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getWest(),
    ];

    initRect = [
      [N, W],
      [N, E],
      [S, E],
      [S, W],
      [N, W],
    ];
    map.setZoom(map.getZoom() - 1);
    ready = true;
  }

  $: if (rect) {
    rect.getRectangle().enableEdit(map);
  }
</script>

{#if initRect}
  <Rectangle
    latLngBounds={initRect}
    color="#ff0000"
    fillColor="#ff0000"
    bind:this={rect}
  />
{/if}
