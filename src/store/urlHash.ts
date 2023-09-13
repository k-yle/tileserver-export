import { writable, derived } from "svelte/store";
import type { ShortLink } from "./recentExports";

/** reactive version of {@link window.location.hash} */
export const urlHash = writable<string>(window.location.hash);

window.addEventListener(
  "popstate",
  () => urlHash.set(window.location.hash),
  false
);

export const shortCodeFromUrl = derived(urlHash, ($urlHash) => {
  return $urlHash.startsWith("#/") ? <ShortLink>$urlHash : undefined;
});
