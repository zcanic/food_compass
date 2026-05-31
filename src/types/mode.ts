export type ModeKind = "binary" | "continuous" | "factor";
export type ModeProperty = string;

export interface Mode {
  modeId: string;
  kind: ModeKind;
  property: ModeProperty;
  label: string;
  nMembers: number;
  propZMean: number;
  members: string[];
}

export interface ModeAtlas {
  cooc: Mode[];
  core: Mode[];
  chem: Mode[];
}

export interface ModeMatch {
  mode: Mode;
  model: "cooc" | "core" | "chem";
  neighborsInMode: string[];
  matchedIngredients?: string[];
}
