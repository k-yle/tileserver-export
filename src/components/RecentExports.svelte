<script lang="ts">
  import List, {
    Text,
    PrimaryText,
    SecondaryText,
    Meta,
    Item,
    Separator,
  } from "@smui/list";
  import Card from "@smui/card";
  import IconButton from "@smui/icon-button";
  import {
    HistoryItem,
    ShortLink,
    recentExports,
  } from "../store/recentExports";
  import { allImageryPromise } from "../api";
  import type { ELI } from "../types";

  function onClickRepeat(item: HistoryItem) {
    window.location.hash = item.code;
  }

  function onClickDelete(item: HistoryItem) {
    recentExports.update((existing) =>
      existing.filter((x) => x.code !== item.code)
    );
  }

  const getLayerNames = (allImagery: Record<string, ELI>, code: ShortLink) => {
    const [, , , , layerIds] = code.split("/");
    const layerNames = layerIds
      .split(",")
      .map((layerId) => allImagery[layerId]?.name || "Unknown");
    return layerNames.join(" + ");
  };
</script>

<h1>Recent Exports</h1>

{#await allImageryPromise}
  Loading...
{:then allImagery}
  <Card variant="outlined" padded>
    <List twoLine nonInteractive>
      {#each $recentExports as recentExport, index (recentExport.code + index)}
        {#if index}
          <Separator />
        {/if}
        <Item>
          <Text>
            <PrimaryText>
              {getLayerNames(allImagery, recentExport.code)}
            </PrimaryText>
            <SecondaryText>Near {recentExport.near}</SecondaryText>
          </Text>
          <Meta>
            <IconButton
              class="material-icons"
              on:click={() => onClickRepeat(recentExport)}
            >
              repeat
            </IconButton>
            <IconButton
              class="material-icons"
              on:click={() => onClickDelete(recentExport)}
            >
              delete
            </IconButton>
          </Meta>
        </Item>
      {/each}
    </List>
  </Card>
{/await}
