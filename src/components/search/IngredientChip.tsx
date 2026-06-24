import { displayName } from "../../utils/text";
import { X } from "lucide-react";

interface Props {
  name: string;
  onRemove: () => void;
  removeLabel?: string;
}

export function IngredientChip({ name, onRemove, removeLabel }: Props) {
  return (
    <span
      className="ingredient-chip"
    >
      {displayName(name)}
      <button
        onClick={onRemove}
        aria-label={removeLabel ?? `移除 ${displayName(name)}`}
        className="ingredient-chip-remove"
      >
        <X size={13} aria-hidden="true" />
      </button>
    </span>
  );
}
