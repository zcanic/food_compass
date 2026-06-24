import type { AppMode } from "../../types/query";

const MODES: { mode: AppMode; label: string; short: string }[] = [
  { mode: "pairing", label: "找搭配", short: "还能加什么" },
  { mode: "substitute", label: "找替代", short: "没有它用什么" },
  { mode: "style_shift", label: "换风格", short: "推向目标风味" },
  { mode: "lookup_mode", label: "查街区", short: "它属于哪里" },
  { mode: "complete_combo", label: "组菜", short: "已有食材补全" },
  { mode: "compare_models", label: "模型对比", short: "三种视角差异" },
  { mode: "ask", label: "Ask", short: "一句话提问" },
];

interface Props {
  active: AppMode;
  onChange: (mode: AppMode) => void;
}

export function ModeTabs({ active, onChange }: Props) {
  return (
    <div className="mode-tabs">
      {MODES.map(({ mode, label, short }) => (
        <button
          key={mode}
          onClick={() => onChange(mode)}
          aria-label={`任务：${label}`}
          aria-pressed={active === mode}
          className={`mode-tab ${active === mode ? "is-active" : ""}`}
        >
          <span className="mode-tab-label">{label}</span>
          <span className="mode-tab-detail">{short}</span>
        </button>
      ))}
    </div>
  );
}
