import { displayName } from "../../utils/text";

interface Props {
  name: string;
  onRemove: () => void;
}

export function IngredientChip({ name, onRemove }: Props) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "4px 10px",
        background: "#e8f4e8",
        borderRadius: 16,
        fontSize: 13,
      }}
    >
      {displayName(name)}
      <button
        onClick={onRemove}
        style={{
          border: "none",
          background: "transparent",
          cursor: "pointer",
          fontSize: 14,
          padding: 0,
          lineHeight: 1,
        }}
      >
        x
      </button>
    </span>
  );
}
