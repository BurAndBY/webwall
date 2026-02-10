export function normalizeHexColor(rawValue: unknown, fallback: string): string {
  const value = typeof rawValue === "string" ? rawValue.trim() : "";
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value.toLowerCase() : fallback;
}

export function normalizeColorKey(raw: unknown): string | null {
  if (typeof raw !== "string") {
    return null;
  }
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }
  const hex = trimmed.startsWith("#") ? trimmed.slice(1) : trimmed;
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
    return null;
  }
  return `#${hex.toLowerCase()}`;
}

export function colorKeyToRgbInt(key: unknown): number | null {
  if (typeof key !== "string" || key.length !== 7 || key[0] !== "#") {
    return null;
  }
  const parsed = Number.parseInt(key.slice(1), 16);
  return Number.isFinite(parsed) ? parsed : null;
}

export function colorKeyToRgbTuple(key: unknown): { r: number; g: number; b: number } | null {
  const rgb = colorKeyToRgbInt(key);
  if (rgb === null) {
    return null;
  }
  return {
    r: (rgb >> 16) & 255,
    g: (rgb >> 8) & 255,
    b: rgb & 255
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
