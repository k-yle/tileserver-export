import { writable } from "svelte/store";

export type ShortLink =
  `#/${number}/${number}+${number}/${number}+${number}/${string}`;

export type HistoryItem = {
  code: ShortLink;
  near: string;
};

const defaultValue: HistoryItem[] = JSON.parse(
  localStorage.recentExports || "[]"
);

/** list of recently exported layers */
export const recentExports = writable<HistoryItem[]>(defaultValue);

recentExports.subscribe((value) => {
  localStorage.recentExports = JSON.stringify(value);
});
