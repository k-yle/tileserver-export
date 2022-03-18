<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Button from "@smui/button";
  import Card, { PrimaryAction, Media } from "@smui/card";
  import { OverzoomIcon, TooManyTilesIcon } from "../components";
  import {
    convertTileUrl,
    getTileDimensions,
    IS_SUPERUSER,
    latLngToXYZ,
    MAX_TILES_PER_LAYER,
    populateTileUrl,
    TileDimesion,
  } from "../helpers";
  import type { MapSelection } from "../types";

  type ZoomLevel = TileDimesion & { overzoom: boolean };

  const dispatch = createEventDispatcher<{ back: never; select: ZoomLevel }>();

  export let areaAndLayers: MapSelection;

  const maxZoom = Math.min(
    ...areaAndLayers.layers.map((l) => l.max_zoom ?? 22)
  );
  const minZoom = Math.max(...areaAndLayers.layers.map((l) => l.min_zoom ?? 1));

  const isDisabled = (l: ZoomLevel) => l.tiles > MAX_TILES_PER_LAYER;

  const zoomLevels = new Array(21)
    .fill(0)
    .map((_, i) => ({
      ...getTileDimensions(i + 1, areaAndLayers.bbox),
      overzoom: i + 1 < minZoom || i + 1 > maxZoom,
    }))
    .filter((x): x is ZoomLevel => !!x.zoom);

  const [minLng, minLat, maxLng, maxLat] = areaAndLayers.bbox;

  function getDemoTiles(z: number) {
    const [x, y] = latLngToXYZ(
      minLat + (maxLat - minLat) / 2,
      minLng + (maxLng - minLng) / 2,
      z
    );

    const urls = areaAndLayers.layers
      .map((layer) => populateTileUrl(convertTileUrl(layer.url), x, y, z))
      .map((url) => `url("${url}")`)
      .reverse() // first is the top in css
      .join(",");

    return `background-image:${urls};`;
  }

  function onSelect(zoomLevel: ZoomLevel) {
    return () => {
      const problematic = isDisabled(zoomLevel) || zoomLevel.overzoom;

      // allow superUsers to continue, but prompt them first
      if (problematic) {
        if (IS_SUPERUSER) {
          const msg =
            "This selection is problematic, are you sure you want to continue?";
          // eslint-disable-next-line no-alert -- only admins see this
          if (!window.confirm(msg)) return;
        } else return;
      }

      dispatch("select", zoomLevel);
    };
  }
</script>

<main>
  <Button variant="outlined" on:click={() => dispatch("back")}>Back</Button>

  <strong>Step 3:</strong> Choose the level of detail you want. A small portion
  of your selected area is shown in the preview.

  <div class="flex">
    {#each zoomLevels as zoomLevel (zoomLevel.zoom)}
      <Card style="width:256px">
        <PrimaryAction on:click={onSelect(zoomLevel)}>
          <div style="padding: 1rem;">
            <h2 class="mdc-typography--headline6">
              Zoom {zoomLevel.zoom}
              {#if zoomLevel.overzoom}
                <OverzoomIcon />
              {/if}
              {#if isDisabled(zoomLevel)}
                <TooManyTilesIcon />
              {/if}
            </h2>
            <h3 class="mdc-typography--subtitle2">
              {zoomLevel.width}×{zoomLevel.height}
            </h3>
            {zoomLevel.tiles * areaAndLayers.layers.length} tiles / {(
              (zoomLevel.width * zoomLevel.height) /
              1e6
            ).toFixed(1)} MP
          </div>
          <Media aspectRatio="square" style={getDemoTiles(zoomLevel.zoom)} />
        </PrimaryAction>
      </Card>
    {/each}
  </div>

  <style>
    main {
      padding: 16px;
    }
    .flex {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: flex-start;
      gap: 32px;
      padding: 16px;
    }
    .flex h2 {
      margin: 0;
    }
    .flex h3 {
      margin: 0;
      color: #888;
    }
  </style>
</main>
