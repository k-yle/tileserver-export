<script lang="ts">
  import TopAppBar, { Row, Section, Title } from "@smui/top-app-bar";
  import IconButton from "@smui/icon-button";
  import Tooltip, { Wrapper as TooltipWrapper } from "@smui/tooltip";
  import Button, { Label as ButtonLabel } from "@smui/button";
  import Dialog, {
    Header as DialogHeader,
    Title as DialogTitle,
    Content as DialogContent,
    Actions as DialogActions,
  } from "@smui/dialog";
  import { createEventDispatcher } from "svelte";
  import AboutPage from "./AboutPage.svelte";

  let modalOpen = false;

  const dispatch = createEventDispatcher<{ onClickHome: never }>();
</script>

<TopAppBar variant="static" dense slot="top">
  <Row>
    <Section>
      <Title
        on:click={() => dispatch("onClickHome")}
        role="button"
        tabindex={0}
        style="cursor:pointer">Tileserver Export</Title
      >
    </Section>
    <Section align="end" toolbar>
      <TooltipWrapper>
        <IconButton
          class="material-icons"
          aria-label="View code on GitHub"
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/k-yle/tileserver-export">code</IconButton
        >
        <Tooltip showDelay={50} hideDelay={50}>View code on GitHub</Tooltip>
      </TooltipWrapper>
      <TooltipWrapper>
        <IconButton
          class="material-icons"
          aria-label="About"
          on:click={() => (modalOpen = true)}>info</IconButton
        >
        <Tooltip showDelay={50} hideDelay={50}>About</Tooltip>
      </TooltipWrapper>
    </Section>
  </Row>
</TopAppBar>

<Dialog
  bind:open={modalOpen}
  fullscreen
  aria-labelledby="modal-title"
  aria-describedby="modal-content"
>
  <DialogHeader>
    <DialogTitle id="modal-title">About</DialogTitle>
  </DialogHeader>
  <DialogContent id="modal-content"><AboutPage /></DialogContent>
  <DialogActions>
    <Button defaultAction>
      <ButtonLabel>Close</ButtonLabel>
    </Button>
  </DialogActions>
</Dialog>
