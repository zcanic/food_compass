const STORAGE_KEY = "food_compass.recent_ingredients.v1";
const MAX_RECENT = 8;

interface RecentIngredientsPayload {
  version: 1;
  items: string[];
}

export function loadRecentIngredients(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Partial<RecentIngredientsPayload>;
    if (parsed.version !== 1 || !Array.isArray(parsed.items)) return [];
    return parsed.items.filter((item) => typeof item === "string").slice(0, MAX_RECENT);
  } catch {
    return [];
  }
}

export function saveRecentIngredients(items: string[]) {
  if (typeof window === "undefined") return;
  const normalized = dedupe(items).slice(0, MAX_RECENT);
  const payload: RecentIngredientsPayload = { version: 1, items: normalized };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function clearRecentIngredients() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function addRecentIngredients(current: string[], additions: string[]): string[] {
  return dedupe([...additions, ...current]).slice(0, MAX_RECENT);
}

function dedupe(items: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of items) {
    if (!item || seen.has(item)) continue;
    seen.add(item);
    result.push(item);
  }
  return result;
}
