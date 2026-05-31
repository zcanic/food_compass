import type { ModelName } from "../../types/model";
import { MODEL_EXPLANATIONS, MODEL_LABELS } from "../../types/model";

interface Props {
  active: ModelName;
  onChange: (model: ModelName) => void;
}

export function ModelToggle({ active, onChange }: Props) {
  const models: ModelName[] = ["core", "cooc", "chem"];

  return (
    <div style={{ display: "grid", gap: 8 }}>
      {models.map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          aria-label={`模型：${MODEL_LABELS[m]}`}
          style={{
            padding: "9px 12px",
            border: active === m ? "2px solid #2a7" : "1px solid #ddd",
            borderRadius: 8,
            background: active === m ? "#e8f4e8" : "#fafafa",
            cursor: "pointer",
            fontSize: 13,
            textAlign: "left",
          }}
        >
          <span style={{ display: "block", fontWeight: active === m ? 700 : 600 }}>
            {MODEL_LABELS[m]}
          </span>
          <span style={{ color: "#777", display: "block", fontSize: 11, lineHeight: 1.45, marginTop: 2 }}>
            {MODEL_EXPLANATIONS[m]}
          </span>
        </button>
      ))}
    </div>
  );
}
