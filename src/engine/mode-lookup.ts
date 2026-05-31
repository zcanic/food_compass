import type { ModeAtlas, ModeMatch } from "../types/mode";
import type { ModelName } from "../types/model";

export class ModeLookup {
  private atlas: ModeAtlas | null = null;

  init(atlas: ModeAtlas) {
    this.atlas = atlas;
  }

  lookup(ingredient: string, model: ModelName): ModeMatch[] {
    return this.lookupForIngredients([ingredient], model);
  }

  lookupForIngredients(ingredients: string[], model: ModelName): ModeMatch[] {
    if (!this.atlas) return [];

    const modes = this.atlas[model];
    const results: ModeMatch[] = [];
    const canonicalInputs = new Set(ingredients);
    const displayInputs = new Set(ingredients.map((ingredient) => ingredient.replace(/_/g, " ")));

    if (ingredients.length === 0) return [];

    for (const mode of modes) {
      const matchedIngredients = ingredients.filter((ingredient) => {
        const display = ingredient.replace(/_/g, " ");
        return mode.members.includes(display) || mode.members.includes(ingredient);
      });

      if (matchedIngredients.length > 0) {
        const neighbors = mode.members
          .filter((m) => !displayInputs.has(m) && !canonicalInputs.has(m))
          .slice(0, 10);
        results.push({ mode, model, neighborsInMode: neighbors, matchedIngredients });
      }
    }

    results.sort((a, b) =>
      (b.matchedIngredients?.length ?? 0) - (a.matchedIngredients?.length ?? 0) ||
      a.mode.nMembers - b.mode.nMembers
    );
    return results;
  }
}
