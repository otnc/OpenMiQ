/**
 * Zeroes the alpha of every pixel outside a centered rounded-rect mask, in
 * place, on a flat RGBA buffer (`size * size * 4` bytes — what both pngjs'
 * `PNG#data` and pureimage's `Bitmap#data` use). Shared by emojiSwatch.ts
 * and fontSwatch.ts so both kinds of application emoji read as the same
 * rounded-square shape.
 */
export function applyRoundedCorners(
  data: Uint8Array,
  size: number,
  radius: number,
): void {
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!insideRoundedRect(x, y, size, radius)) {
        data[((size * y + x) << 2) + 3] = 0;
      }
    }
  }
}

function insideRoundedRect(
  x: number,
  y: number,
  size: number,
  radius: number,
): boolean {
  const cx = x + 0.5;
  const cy = y + 0.5;
  const nearLeft = cx < radius;
  const nearRight = cx > size - radius;
  const nearTop = cy < radius;
  const nearBottom = cy > size - radius;
  if ((nearLeft || nearRight) && (nearTop || nearBottom)) {
    const cornerX = nearLeft ? radius : size - radius;
    const cornerY = nearTop ? radius : size - radius;
    const dx = cx - cornerX;
    const dy = cy - cornerY;
    return dx * dx + dy * dy <= radius * radius;
  }
  return true;
}
