<script>
  import { Icon } from "@smui/icon-button";
  import Tooltip, { Wrapper as TooltipWrapper } from "@smui/tooltip";
</script>

<TooltipWrapper>
  <Icon
    class="material-icons"
    style="color:#f44336"
    aria-label="This zoom level is too detailed">warning</Icon
  >
  <Tooltip showDelay={50} hideDelay={50}
    >This zoom level is too detailed</Tooltip
  >
</TooltipWrapper>
