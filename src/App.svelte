<script lang="ts">
  import "svelte-material-ui/bare.css";

  import { homeLocationPromise } from "./api";
  import type { MapSelection } from "./types";
  import type { TileDimesion } from "./helpers";
  import { Navbar } from "./components";
  import {
    Home,
    SelectLayersAndRegion,
    SelectZoom,
    GenerateMosaic,
  } from "./routes";

  let areaAndLayers: MapSelection | null = null;
  let selectedZoom: TileDimesion | null = null;
  let hasStarted = !!window.location.hash;

  function onClickHome() {
    selectedZoom = null;
    areaAndLayers = null;
    hasStarted = false;
  }
</script>

{#if hasStarted && areaAndLayers && selectedZoom}
  <Navbar on:onClickHome={onClickHome} />
  <GenerateMosaic
    layerConfig={areaAndLayers}
    tileConfig={selectedZoom}
    on:back={() => (selectedZoom = null)}
  />
{:else if hasStarted && areaAndLayers}
  <Navbar on:onClickHome={onClickHome} />
  <SelectZoom
    {areaAndLayers}
    on:back={() => (areaAndLayers = null)}
    on:select={(e) => (selectedZoom = e.detail)}
  />
{:else if hasStarted}
  <main>
    <div class="header">
      <Navbar on:onClickHome={onClickHome} />
    </div>

    {#await homeLocationPromise}
      Loading...
    {:then home}
      <SelectLayersAndRegion
        {home}
        on:select={(e) => (areaAndLayers = e.detail)}
      />
    {/await}
  </main>
{:else}
  <Navbar />
  <Home on:start={() => (hasStarted = true)} />
{/if}

<style>
  :global(html, body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
    height: 100%;
  }

  :global(code) {
    color: #e83e8c;
  }

  :root {
    --mdc-theme-primary: #00838f;
  }

  main {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: min-content min-content min-content 1fr;
    gap: 0px 0px;
    grid-template-areas:
      "header header"
      "status status"
      "layerstabs map"
      "layers map";
    height: 100%;
  }

  .header {
    grid-area: header;
  }
</style>
