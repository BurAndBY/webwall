import { normalizeColorKey } from "./colors";

export function parseMirrorNumber(value: unknown, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function normalizeMirrorKeys(rawKeys: unknown, maxKeys: number): string[] {
  if (!Array.isArray(rawKeys)) {
    return [];
  }
  const keys: string[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < rawKeys.length; i += 1) {
    const normalized = normalizeColorKey(rawKeys[i]);
    if (!normalized || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    keys.push(normalized);
    if (keys.length >= maxKeys) {
      break;
    }
  }
  return keys;
}

export function mirrorKeysEqual(a: unknown, b: unknown): boolean {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}
