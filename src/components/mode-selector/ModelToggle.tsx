import type { ModelName } from "../../types/model";
import { MODEL_EXPLANATIONS, MODEL_LABELS } from "../../types/model";

interface Props {
  active: ModelName;
  onChange: (model: ModelName) => void;
}

export function ModelToggle({ active, onChange }: Props) {
  const models: ModelName[] = ["core", "cooc", "chem"];

  return (
    <div className="model-toggle">
      {models.map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          aria-label={`模型：${MODEL_LABELS[m]}`}
          aria-pressed={active === m}
          className={`model-option ${active === m ? "is-active" : ""}`}
        >
          <span className="model-option-name">{MODEL_LABELS[m]}</span>
          <span className="model-option-detail">{MODEL_EXPLANATIONS[m]}</span>
        </button>
      ))}
    </div>
  );
}
