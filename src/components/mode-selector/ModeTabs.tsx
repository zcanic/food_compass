import type { AppMode } from "../../types/query";

const MODES: { mode: AppMode; label: string }[] = [
  { mode: "pairing", label: "找搭配" },
  { mode: "substitute", label: "找替代" },
  { mode: "style_shift", label: "换风格" },
  { mode: "lookup_mode", label: "查街区" },
  { mode: "complete_combo", label: "组菜" },
  { mode: "ask", label: "Ask" },
];

interface Props {
  active: AppMode;
  onChange: (mode: AppMode) => void;
}

export function ModeTabs({ active, onChange }: Props) {
  return (
    <div style={{ display: "flex", gap: 4, marginBottom: 16, flexWrap: "wrap" }}>
      {MODES.map(({ mode, label }) => (
        <button
          key={mode}
          onClick={() => onChange(mode)}
          style={{
            padding: "8px 16px",
            border: active === mode ? "2px solid #2a7" : "1px solid #ccc",
            borderRadius: 8,
            background: active === mode ? "#e8f4e8" : "#fff",
            cursor: "pointer",
            fontWeight: active === mode ? 600 : 400,
            fontSize: 14,
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
