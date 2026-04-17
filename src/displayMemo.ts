import memoRaw from "../表示項目メモ.txt?raw";

/** メモファイルの行順（空行除外） */
export const MEMO_ITEM_LABELS: string[] = memoRaw
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line.length > 0);
