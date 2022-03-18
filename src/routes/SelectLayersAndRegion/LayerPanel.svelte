<script lang="ts">
  import List, {
    Item as ListItem,
    Graphic as ListGraphic,
    Label as ListLabel,
    Meta as ListMeta,
  } from "@smui/list";
  import Radio from "@smui/radio";
  import Checkbox from "@smui/checkbox";
  import Tab, { Label as TabLabel } from "@smui/tab";
  import TabBar from "@smui/tab-bar";
  import IconButton from "@smui/icon-button";

  import { onDestroy, onMount } from "svelte";
  import type { Map } from "leaflet";
  import { eliQueryPromise } from "../../api";
  import { toBBox } from "../../helpers";
  import type { ELI, PermaLink } from "../../types";
  import AddCustomLayerModal from "./AddCustomLayerModal.svelte";

  const tabNames = {
    bg: "Backgrounds",
    overlay: "Overlays",
  } as const;
  type TabName = keyof typeof tabNames;

  export let map: Map;
  export let fullSelection: ELI[];
  export let init: PermaLink | null;

  /** these ones are from ELI */
  let standardLayers: ELI[];
  let customLayers: ELI[] = [];

  $: allLayers = standardLayers
    ? [...standardLayers, ...customLayers]
    : undefined;

  let selectedBaseLayer: string = init?.layers[0] || "MAPNIK";
  let selectedOverlays: string[] = init?.layers.slice(1) || [];
  let activeTab: TabName = "bg";

  /** false=closed, true=openAndCreateNew, string=openAndEditStringifedJson */
  let modalOpen: string | true | false = false;

  // we filter out any layers that were selected but are not in the list because the user moved the map
  $: fullSelection = [selectedBaseLayer, ...selectedOverlays]
    .map((id) => allLayers?.find((l) => l.id === id))
    .filter((layer): layer is ELI => !!layer);

  function setHash(newHash: string) {
    window.history.replaceState(
      "",
      "",
      window.location.href.split("#")[0] + (newHash ? `#${newHash}` : "")
    );
  }

  async function syncHashWithMap() {
    const zoom = map.getZoom();
    const centre = map.getCenter();
    const precision = Math.max(0, Math.ceil(Math.log2(zoom)));

    const activeLayerIds = fullSelection
      .map((l) => l.id)
      .filter((id) => id.startsWith("__custom"))
      .join(",");

    setHash(
      [
        zoom,
        centre.lat.toFixed(precision),
        centre.lng.toFixed(precision),
        activeLayerIds,
      ].join("/")
    );
  }

  async function onMove() {
    try {
      syncHashWithMap();
      const eliQuery = await eliQueryPromise;
      if (!eliQuery) return; // error loading ELI

      const zoom = map.getZoom();
      if (zoom < 10) {
        standardLayers = eliQuery(true);
      } else {
        const imagery = eliQuery(toBBox(map.getBounds()));
        const oldKey = standardLayers?.map((x) => x.id).join(",");
        const newKey = imagery.map((x) => x.id).join(",");
        if (oldKey !== newKey) {
          standardLayers = imagery;
        }
      }
    } catch (ex) {
      console.error(ex);
    }
  }

  function remove(layerToRemove: ELI) {
    return () => {
      // unselect the layer if it's currently selected
      if (selectedBaseLayer === layerToRemove.id) {
        selectedBaseLayer = "MAPNIK";
      }
      if (selectedOverlays.includes(layerToRemove.id)) {
        selectedOverlays = selectedOverlays.filter(
          (layerId) => layerId !== layerToRemove.id
        );
      }

      // then delete it
      customLayers = customLayers.filter(
        (layer) => layer.id !== layerToRemove.id
      );
    };
  }

  onMount(() => {
    map.on("moveend", onMove);
    onMove(); // first run
  });

  onDestroy(() => {
    map.off("moveend", onMove);
    setHash("");
  });

  $: backgroundLayers = allLayers?.filter((l) => !(l.overlay || l.transparent));
  $: overlayLayers = allLayers?.filter((l) => l.overlay || l.transparent);

  $: {
    fullSelection; // eslint-disable-line no-unused-expressions -- declaring it as a dependency
    syncHashWithMap();
  }

  const getTabName = (tabId: string) => tabNames[tabId as TabName];
</script>

{#key !!modalOpen}
  <AddCustomLayerModal
    bind:modalOpen
    on:cancel={() => (modalOpen = false)}
    on:add={(e) =>
      (customLayers = [
        ...customLayers.filter((l) => l.id !== e.detail.id),
        e.detail,
      ])}
  />
{/key}

<div class="layerstabs">
  <TabBar tabs={Object.keys(tabNames)} let:tab bind:active={activeTab}>
    <Tab {tab}>
      <TabLabel>{getTabName(tab)}</TabLabel>
    </Tab>
  </TabBar>
</div>

<div class="layers">
  {#if backgroundLayers && overlayLayers}
    {#if activeTab === "bg"}
      <List radioList>
        {#each backgroundLayers as layer (layer.id)}
          <ListItem>
            <ListGraphic>
              <Radio bind:group={selectedBaseLayer} value={layer.id} />
            </ListGraphic>
            <ListLabel>{layer.best ? "⭐ " : ""} {layer.name}</ListLabel>

            {#if layer.id.startsWith("__custom")}
              <ListMeta>
                <IconButton
                  class="material-icons"
                  on:click={() => (modalOpen = JSON.stringify(layer))}
                  >edit</IconButton
                >
                <IconButton class="material-icons" on:click={remove(layer)}
                  >delete</IconButton
                >
              </ListMeta>
            {/if}
          </ListItem>
        {/each}
        <ListItem on:click={() => (modalOpen = true)}>
          <ListLabel><em>Add Custom Layer</em></ListLabel>
        </ListItem>
      </List>
    {:else if activeTab === "overlay"}
      <List checkList>
        {#each overlayLayers as layer (layer.id)}
          <ListItem>
            <ListGraphic>
              <Checkbox bind:group={selectedOverlays} value={layer.id} />
            </ListGraphic>
            <ListLabel>{layer.best ? "⭐ " : ""} {layer.name}</ListLabel>

            {#if layer.id.startsWith("__custom")}
              <ListMeta>
                <IconButton
                  class="material-icons"
                  on:click={() => (modalOpen = JSON.stringify(layer))}
                  >edit</IconButton
                >
                <IconButton class="material-icons" on:click={remove(layer)}
                  >delete</IconButton
                >
              </ListMeta>
            {/if}
          </ListItem>
        {/each}
        <ListItem on:click={() => (modalOpen = true)}>
          <ListLabel><em>Add Custom Layer</em></ListLabel>
        </ListItem>
      </List>
    {/if}
  {:else}
    Loading...
  {/if}
</div>

<style>
  .layerstabs {
    grid-area: layerstabs;
  }
  .layers {
    grid-area: layers;
    height: 100%;
    overflow-y: auto;
  }
</style>
