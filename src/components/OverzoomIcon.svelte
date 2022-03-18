<script>
  import { Icon } from "@smui/icon-button";
  import Tooltip, { Wrapper as TooltipWrapper } from "@smui/tooltip";
</script>

<TooltipWrapper>
  <Icon
    class="material-icons"
    style="color:#ff9800"
    aria-label="Your imagery does not support this zoom Level">warning</Icon
  >
  <Tooltip showDelay={50} hideDelay={50}
    >Your imagery does not support this zoom Level</Tooltip
  >
</TooltipWrapper>
