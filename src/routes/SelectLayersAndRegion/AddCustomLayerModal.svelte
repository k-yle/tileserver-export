<script lang="ts">
  import Dialog, { Header, Title, Content, Actions } from "@smui/dialog";
  import SegmentedButton, { Segment } from "@smui/segmented-button";
  import Textfield from "@smui/textfield";
  import Checkbox from "@smui/checkbox";
  import FormField from "@smui/form-field";
  import Button, { Label } from "@smui/button";

  import { createEventDispatcher, onMount } from "svelte";
  import type { ELI } from "../../types";
  import { Token } from "../../components";
  import { convertTileUrl } from "../../helpers";

  const options: ELI["type"][] = ["tms", "wmts"];

  const dispatch = createEventDispatcher<{ add: ELI; cancel: never }>();

  /** false=closed, true=openAndCreateNew, string=openAndEditStringifedJson */
  export let modalOpen: string | true | false;
  let existing: ELI | null;
  let open: boolean;

  $: existing =
    typeof modalOpen === "string" ? (JSON.parse(modalOpen) as ELI) : null;
  $: open = !!modalOpen;

  let type: typeof options[number] = "tms";
  let url = "";
  let transparent = false;

  onMount(() => {
    if (existing) {
      type = existing.type;
      url = existing.url;
      transparent = existing.overlay ?? false;
    }
  });

  function getLayerName() {
    const finalUrl = url.trim();
    try {
      return new URL(convertTileUrl(finalUrl)).host;
    } catch {
      return finalUrl.replace(/https?:\/\//, "").split("/")[0];
    }
  }

  function onAdd() {
    dispatch("add", {
      id: existing?.id || `__custom${Math.random()}`,
      name: `Custom - ${getLayerName()}`,
      type,
      url: url.trim(),
      overlay: transparent,
    });
  }
</script>

<Dialog
  bind:open
  fullscreen
  aria-labelledby="fullscreen-title"
  aria-describedby="fullscreen-content"
  on:SMUIDialog:closed={() => dispatch("cancel")}
>
  <Header>
    <Title id="fullscreen-title">Add Custom Imagery</Title>
  </Header>
  <Content id="fullscreen-content">
    Enter the URL of the tileserver.
    <br />
    <SegmentedButton
      segments={options}
      let:segment
      singleSelect
      bind:selected={type}
    >
      <Segment {segment}>
        <Label>{segment.toUpperCase()}</Label>
      </Segment>
    </SegmentedButton>
    <br />

    {#if type === "tms"}
      For TMS, your URL must include <code><Token>z</Token></code>,
      <code><Token>x</Token></code>, and <code><Token>y</Token></code>.
      <br />
      <br />
      <strong>Example:</strong>
      <br />
      <code
        >https://<Token>switch:a,b,c</Token>.tile.openstreetmap.org/<Token
          >zoom</Token
        >/<Token>x</Token>/<Token>y</Token>.png</code
      >
    {:else}
      For WMTS, your URL must include <code><Token>bbox</Token></code>. You can
      also use the following placeholders:
      <ul>
        <li>
          <code><Token>proj</Token></code> - will always be
          <code>EPSG:3857</code>
        </li>
        <li>
          <code><Token>wkid</Token></code> - will always be <code>3857</code>
        </li>
        <li>
          <code><Token>width</Token></code>, <code><Token>height</Token></code>
          - will always be <code>256</code>
        </li>
      </ul>

      <strong>Example:</strong>
      <br />
      <code
        >https://example.com/arcgis/rest/services/my_layer/MapServer/export?dpi=96&transparent={transparent
          ? "true"
          : "false"}&format=png32&layers=show:0,1,23&bbox=<Token>bbox</Token
        >&bboxSR=<Token>wkid</Token>&imageSR=<Token>wkid</Token>&size=<Token
          >width</Token
        >,<Token>height</Token>&f=image</code
      >
    {/if}
    <br />
    <br />

    <Textfield
      style="width: 100%;"
      textarea
      bind:value={url}
      label="Tileserver URL"
    />

    <br />

    <FormField align="end">
      <Checkbox bind:checked={transparent} />
      <span slot="label">Transparent</span>
    </FormField>

    <br />
    <br />
  </Content>
  <Actions>
    <Button on:click={() => dispatch("cancel")} variant="outlined">
      <Label>Cancel</Label>
    </Button>
    <Button on:click={onAdd} defaultAction variant="raised">
      <Label>Add</Label>
    </Button>
  </Actions>
</Dialog>
