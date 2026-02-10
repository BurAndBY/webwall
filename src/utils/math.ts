export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function snapCssPixel(value: number): number {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  return Math.round(value * dpr) / dpr;
}

export function computeGuiScale(requested: number, width: number, height: number): number {
  const targetScale = requested === 0 ? 1000 : requested;
  let scale = 1;
  while (scale < targetScale && width / (scale + 1) >= 320 && height / (scale + 1) >= 240) {
    scale += 1;
  }
  return scale;
}
