export function toggleSelect(
  item: any,
  ctrlKey: boolean,
  shiftKey: boolean,
  selected: Set<number>,
  items: Array<any>,
  lastSelected: number,
  selectFn: Function,
  deselectFn: Function,
  clearFn: Function
) {
  const isNodeSelected = selected.has(item.id)

  if (shiftKey && lastSelected > 0) {
    const nodeIdx = items.findIndex((itm: any) => itm.id === item.id)
    const lastIdx = items.findIndex((itm: any) => itm.id === lastSelected)

    let start = nodeIdx
    let end = lastIdx
    if (start > end) {
      ;[start, end] = [end, start]
    }

    for (let i = start; i <= end; i++) {
      if (isNodeSelected) {
        deselectFn(items[i])
      } else {
        selectFn(items[i])
      }
    }
    return
  }

  if (!ctrlKey) {
    clearFn()
  }

  if (isNodeSelected) {
    deselectFn(item)
    return
  }

  selectFn(item)
}
