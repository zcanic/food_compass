import type { ModeAtlas, ModeMatch } from "../types/mode";
import type { ModelName } from "../types/model";

export class ModeLookup {
  private atlas: ModeAtlas | null = null;

  init(atlas: ModeAtlas) {
    this.atlas = atlas;
  }

  lookup(ingredient: string, model: ModelName): ModeMatch[] {
    if (!this.atlas) return [];

    const modes = this.atlas[model];
    const results: ModeMatch[] = [];

    // canonical name -> display name for matching in members_pipe
    const display = ingredient.replace(/_/g, " ");

    for (const mode of modes) {
      if (mode.members.includes(display) || mode.members.includes(ingredient)) {
        const neighbors = mode.members
          .filter((m) => m !== display && m !== ingredient)
          .slice(0, 10);
        results.push({ mode, model, neighborsInMode: neighbors });
      }
    }

    // Sort by smaller modes first (more specific)
    results.sort((a, b) => a.mode.nMembers - b.mode.nMembers);
    return results;
  }
}
