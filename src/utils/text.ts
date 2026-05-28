export function normalizeText(input: string): string {
  let s = input.trim().toLowerCase();
  s = fullwidthToHalfwidth(s);
  s = s.replace(/\s+/g, " ");
  s = s.replace(/-/g, " ");
  return s;
}

function fullwidthToHalfwidth(s: string): string {
  return s.replace(/[！-～]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0xFEE0)
  );
}

export function toUnderscore(s: string): string {
  return s.replace(/\s+/g, "_");
}

export function simplePluralStrip(s: string): string {
  return s.replace(/s$/, "");
}

export function displayName(canonical: string): string {
  return canonical.replace(/_/g, " ");
}
