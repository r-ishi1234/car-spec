/** 保存済み順と現在のマスタ順をマージ（欠け・新規を正規順で補完） */
export function mergeOrderedSubset<T extends string>(
  savedOrder: readonly T[],
  canonicalItems: readonly T[]
): T[] {
  const canonSet = new Set(canonicalItems);
  const base = savedOrder.filter((x) => canonSet.has(x));
  const seen = new Set(base);
  for (const x of canonicalItems) {
    if (!seen.has(x)) {
      base.push(x);
      seen.add(x);
    }
  }
  return base;
}

/**
 * fullOrder 上の「表示中」要素だけを並べ替え、非表示の相対位置は維持する。
 */
export function reorderVisibleInFullOrder<T extends string>(
  fullOrder: readonly T[],
  isVisible: (item: T) => boolean,
  fromIndex: number,
  toIndex: number
): T[] {
  const visibleItems = fullOrder.filter(isVisible);
  if (
    fromIndex < 0 ||
    fromIndex >= visibleItems.length ||
    toIndex < 0 ||
    toIndex >= visibleItems.length
  ) {
    return [...fullOrder];
  }
  const nextVisible = [...visibleItems];
  const [removed] = nextVisible.splice(fromIndex, 1);
  nextVisible.splice(toIndex, 0, removed);

  let vi = 0;
  let ii = 0;
  const invisibleItems = fullOrder.filter((item) => !isVisible(item));
  const result: T[] = [];
  for (const item of fullOrder) {
    if (isVisible(item)) {
      result.push(nextVisible[vi++]);
    } else {
      result.push(invisibleItems[ii++]);
    }
  }
  return result;
}
