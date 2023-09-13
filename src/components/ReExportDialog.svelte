<script lang="ts">
  import Dialog, { Header, Title, Content, Actions } from "@smui/dialog";
  import Button, { Label } from "@smui/button";
  import {
    getDerivedTileDimensions,
    XYZToLatLng,
    type TileDimesion,
  } from "../helpers";
  import type { BBox, ELI, MapSelection } from "../types";
  import { allImageryPromise } from "../api";
  import { ShortLink, shortCodeFromUrl } from "../store";

  export let areaAndLayers: MapSelection | null;
  export let selectedZoom: TileDimesion | null;
  export let hasStarted: boolean;

  function getImageryNames(
    shortCode: ShortLink,
    allImagery: Record<string, ELI>
  ) {
    return shortCode
      .split("/")[4]
      .split(",")
      .map((layerId) => allImagery?.[layerId]?.name || "Unknown")
      .join(" + ");
  }

  function onCancel() {
    // remove the URL hash, which will unmount this component
    window.location.hash = "";
  }

  async function onConfirm() {
    // reconstruct all the options that we need from the short url.
    const [, _zoom, xRange, yRange, layersIds] = $shortCodeFromUrl!.split("/");

    const [minX, offsetX] = xRange.split("+").map(Number);
    const [minY, offsetY] = yRange.split("+").map(Number);

    const maxX = minX + offsetX;
    const maxY = minY + offsetY;
    const zoom = +_zoom;

    const allImageryLayers = await allImageryPromise;
    if (!allImageryLayers) {
      onCancel();
      return;
    }

    const [lat1, lng1] = XYZToLatLng(minX, minY, zoom);
    const [lat2, lng2] = XYZToLatLng(maxX, maxY, zoom);

    const minLat = Math.min(lat1, lat2);
    const maxLat = Math.max(lat1, lat2);
    const minLng = Math.min(lng1, lng2);
    const maxLng = Math.max(lng1, lng2);

    const bbox: BBox = [minLng, minLat, maxLng, maxLat];

    const layers = layersIds
      .split(",")
      .map((layerId) => allImageryLayers[layerId]);

    // upate root app state
    selectedZoom = getDerivedTileDimensions({ zoom, minX, minY, maxX, maxY });
    areaAndLayers = { layers, bbox };
    hasStarted = true;
  }
</script>

{#if $shortCodeFromUrl && !hasStarted}
  <Dialog
    open={!!shortCodeFromUrl}
    fullscreen
    aria-labelledby="reëxport-title"
    aria-describedby="reëxport-content"
    on:SMUIDialog:closed={onCancel}
  >
    <Header>
      <Title id="reëxport-title">Repeat Export</Title>
    </Header>
    <Content id="reëxport-content">
      {#await allImageryPromise}
        Loading…
      {:then allImagery}
        Do you want repeat this export of {getImageryNames(
          $shortCodeFromUrl,
          allImagery
        )}?
      {/await}
    </Content>
    <Actions>
      <Button on:click={onCancel} variant="outlined">
        <Label>Cancel</Label>
      </Button>
      <Button on:click={onConfirm} defaultAction variant="raised">
        <Label>Okay</Label>
      </Button>
    </Actions>
  </Dialog>
{/if}
