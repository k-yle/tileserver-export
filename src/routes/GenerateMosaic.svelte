<script lang="ts">
  import { createEventDispatcher, onDestroy, onMount } from "svelte";
  import Button from "@smui/button";
  import { Icon } from "@smui/icon-button";
  import LinearProgress from "@smui/linear-progress";
  import Paper, {
    Title as PaperTitle,
    Content as PaperContent,
  } from "@smui/paper";

  import type { MapSelection } from "../types";
  import {
    CONCURRENT,
    convertTileUrl,
    getCentroid,
    populateTileUrl,
    TileDimesion,
  } from "../helpers";
  import { HistoryItem, recentExports, ShortLink } from "../store";
  import { geocode } from "../api";

  const dispatch = createEventDispatcher<{ back: never }>();

  export let layerConfig: MapSelection;
  export let tileConfig: TileDimesion;

  let canvas: HTMLCanvasElement;
  const controller = new AbortController();
  let final: { blobUrl: string; failed: number };

  let progress = 0;

  const totalRequests = layerConfig.layers.length * tileConfig.tiles;

  async function loadImage(src: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = reject;
    });
  }

  async function storeInHistory() {
    // update the URL hash to include all the options
    const { zoom, minX, maxX, minY, maxY } = tileConfig;
    const layerIds = layerConfig.layers.map((layer) => layer.id).join(",");
    const newHash: ShortLink = `#/${zoom}/${minX}+${maxX - minX}/${minY}+${
      maxY - minY
    }/${layerIds}`;

    window.history.replaceState(
      "",
      "",
      window.location.href.split("#")[0] + newHash
    );

    // store the most recent exports
    const newItem: HistoryItem = {
      code: newHash,
      near: await geocode(getCentroid(layerConfig.bbox)),
    };
    recentExports.update((existing) => [...existing, newItem]);
  }

  onMount(async () => {
    storeInHistory(); // no await, this can happen in parallel

    const ctx = canvas.getContext("2d")!;

    canvas.width = tileConfig.xCount * 256;
    canvas.height = tileConfig.yCount * 256;

    type Tile = { projX: number; projY: number; img: HTMLImageElement };
    const tiles: Tile[] = [];
    const errored: (() => Promise<Tile>)[] = [];
    const tilePromises: (() => Promise<Tile>)[] = [];

    for (let i = 0; i < tileConfig.xCount; i += 1) {
      for (let j = 0; j < tileConfig.yCount; j += 1) {
        for (const layer of layerConfig.layers) {
          if (controller.signal.aborted) return;

          const x = i + tileConfig.minX;
          const y = j + tileConfig.minY;

          const imgSrc = populateTileUrl(
            convertTileUrl(layer.url),
            x,
            y,
            tileConfig.zoom
          );

          tilePromises.push(async () => {
            const img = await loadImage(imgSrc);
            return { img, projX: i * 256, projY: j * 256 };
          });
        }
      }
    }

    while (tilePromises.length) {
      const nextChunk = tilePromises.splice(0, CONCURRENT);
      progress += CONCURRENT;

      const result = await Promise.all(
        nextChunk.map((f) =>
          f().catch(() => {
            errored.push(f);
            return undefined;
          })
        )
      );
      tiles.push(...result.filter((x): x is Tile => !!x));
    }

    let failed = 0;
    // retry the ones that errored one by one, and only retry once.
    for (const f of errored) {
      try {
        tiles.push(await f());
      } catch {
        failed += 1;
      }
    }

    for (const tile of tiles) {
      ctx.drawImage(tile.img, tile.projX, tile.projY);
    }

    canvas.toBlob((blob) => {
      final = { blobUrl: URL.createObjectURL(blob!), failed };
    });
  });

  onDestroy(controller.abort);

  const attributionRequired = layerConfig.layers.some(
    (l) => l.attribution?.required
  );
  const attributions = layerConfig.layers
    .filter((l) => l.attribution?.text)
    .map((l) => l.attribution);

  async function onClickShare() {
    const layerNames = layerConfig.layers
      .map((layer) => layer.name)
      .join(" + ");

    await navigator.share({
      title: `Export of ${layerNames}`,
      url: window.location.href,
    });
  }
</script>

<main>
  <Paper>
    <PaperTitle>Attribution</PaperTitle>
    <PaperContent>
      You {#if attributionRequired}<strong>must</strong>{:else}should{/if} display
      the following attribution alongside your map:
      <aside>
        {#each attributions as attribution (attribution?.text)}
          {#if attribution?.url}
            <a href={attribution.url} target="_blank" rel="noopener noreferrer"
              >{attribution.text}</a
            >
          {:else}
            {attribution?.text}
          {/if}
          <br />
        {/each}
      </aside>
    </PaperContent>
  </Paper>

  {#if final}
    <Paper>
      <PaperTitle>Image Generated!</PaperTitle>
      <PaperContent>
        <Button variant="raised" href={final.blobUrl} download="map.png"
          >Download</Button
        >
        <Button variant="raised" on:click={onClickShare}>Share Link</Button>
        {#if final.failed}
          <br />
          <br />
          <Icon class="material-icons" style="color:#ff9800">error</Icon>
          {final.failed / totalRequests}% of the image failed to download
        {/if}
      </PaperContent>
    </Paper>
  {:else}
    <Paper>
      <PaperTitle>Generating Image...</PaperTitle>
      <PaperContent>
        <LinearProgress progress={progress / totalRequests} />
        <br />

        <Button variant="outlined" on:click={() => dispatch("back")}
          >Cancel</Button
        >
      </PaperContent>
    </Paper>

    <details>
      <summary>Show Preview</summary>
      <div class="canvasContainer">
        <canvas bind:this={canvas} />
      </div>
    </details>
  {/if}
</main>

<style>
  main {
    padding: 16px;
  }
  main > :global(*) {
    margin: 32px 0;
  }

  aside {
    background-color: #f2f2f2;
    padding: 8px;
    font-family: monospace;
  }

  .canvasContainer {
    width: 100%;
    max-height: 520px;
    overflow: auto;
    background-color: #f2f2f2;
    border-radius: 8px;
  }
</style>
