import type { ModelName } from "../../types/model";
import { MODEL_LABELS } from "../../types/model";

interface Props {
  active: ModelName;
  onChange: (model: ModelName) => void;
}

export function ModelToggle({ active, onChange }: Props) {
  const models: ModelName[] = ["core", "cooc", "chem"];

  return (
    <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
      {models.map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          style={{
            padding: "6px 14px",
            border: active === m ? "2px solid #2a7" : "1px solid #ddd",
            borderRadius: 20,
            background: active === m ? "#e8f4e8" : "#fafafa",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: active === m ? 600 : 400,
          }}
        >
          {MODEL_LABELS[m]}
        </button>
      ))}
    </div>
  );
}
