/**
 * Resolve the next tab in an accessible horizontal tablist.
 *
 * Returns null for keys the tablist does not handle so the browser keeps its
 * normal keyboard behavior. Arrow keys wrap; Home/End jump to the edges.
 */
export function getTabTargetIndex(
  currentIndex: number,
  key: string,
  count: number
): number | null {
  if (!Number.isInteger(count) || count <= 0) return null;
  if (!Number.isInteger(currentIndex) || currentIndex < 0 || currentIndex >= count) {
    return null;
  }

  switch (key) {
    case "ArrowRight":
      return (currentIndex + 1) % count;
    case "ArrowLeft":
      return (currentIndex - 1 + count) % count;
    case "Home":
      return 0;
    case "End":
      return count - 1;
    default:
      return null;
  }
}
