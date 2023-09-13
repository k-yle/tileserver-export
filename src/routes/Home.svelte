<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Paper, { Content as PaperContent } from "@smui/paper";
  import Button from "@smui/button";
  import RecentExports from "../components/RecentExports.svelte";

  const dispatch = createEventDispatcher<{ start: never }>();
</script>

<main>
  <Paper>
    <PaperContent>
      This tool generates a high-quality png image by stitching together tiles
      from a raster tileserver.
      <br />

      <Button variant="raised" on:click={() => dispatch("start")}>Start</Button>
    </PaperContent>
  </Paper>

  <RecentExports />
</main>

<style>
  main {
    padding: 32px;
  }
</style>
