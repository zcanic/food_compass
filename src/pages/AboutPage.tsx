import {
  CONTINUOUS_PROBE_EVIDENCE,
  CROSS_MODAL_EVIDENCE,
  EVIDENCE_METRICS,
  ALIAS_COVERAGE,
  LINEAR_PROBE_EVIDENCE,
  MODE_ATLAS_SUMMARY,
  MODEL_AXIS,
  PRODUCT_LIMITS,
  RESEARCH_FACTS,
  SENSORY_AXES,
  WEAT_CHECKS,
} from "../research/evidence";
import { STYLE_LABELS, STYLE_SEED_SETS } from "../utils/constants";

export function AboutPage() {
  return (
    <div style={{ maxWidth: 860, margin: "32px auto", padding: "0 24px 24px", lineHeight: 1.75 }}>
      <h1 style={{ fontSize: 20, marginBottom: 24 }}>关于 Flavor Compass</h1>

      <section style={{ marginBottom: 24 }} aria-label="研究依据">
        <h2 style={{ fontSize: 16 }}>研究依据</h2>
        <p style={{ fontSize: 14 }}>
          Flavor Compass 把 Epicure 论文里的食材 embedding 产品化为一个食材语义地图。
          核心不是生成菜谱，而是在同一个 300 维空间里做最近邻、组合、mode lookup 和实验性方向移动。
        </p>
        <div className="research-fact-grid">
          {RESEARCH_FACTS.map((fact) => (
            <div key={fact.label} className="research-fact">
              <div className="research-fact-value">{fact.value}</div>
              <div className="research-fact-label">{fact.label}</div>
              <div className="research-fact-detail">{fact.detail}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 24 }} aria-label="三模型设计轴">
        <h2 style={{ fontSize: 16 }}>三模型设计轴</h2>
        <p style={{ fontSize: 14 }}>
          Cooc、Core、Chem 不是三个随机按钮，而是论文中 recipe-context 到 flavor-chemistry 的可控设计轴。
        </p>
        <div className="model-axis-grid">
          {MODEL_AXIS.map((entry) => (
            <div key={entry.model} className="model-axis-card">
              <div className="model-axis-label">{entry.label}</div>
              <div className="model-axis-signal">{entry.signal}</div>
              <div className="model-axis-detail">{entry.bestFor}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 24 }} aria-label="主感官轴">
        <h2 style={{ fontSize: 16 }}>主感官轴</h2>
        <p style={{ fontSize: 14 }}>
          Procrustes sensory analysis 把每个 sibling model 中最稳定的一条感官方向抽出来。
          这些轴不是按钮标签，而是解释模型空间为什么能支持“甜/咸鲜/烘焙”等导航语言的证据。
        </p>
        <div className="sensory-axis-grid">
          {SENSORY_AXES.map((axis) => (
            <div key={axis.model} className="sensory-axis-card">
              <div className="sensory-axis-label">{axis.label}</div>
              <div className="sensory-axis-name">{axis.axisLabel}</div>
              <div className="sensory-axis-detail">
                {axis.poleA}{" -> "}{axis.poleB}
              </div>
              <div className="sensory-axis-source">
                cosine {axis.stabilityCosine} · Jaccard {axis.stabilityJaccard} · {axis.source}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 24 }} aria-label="证据指标">
        <h2 style={{ fontSize: 16 }}>证据指标</h2>
        <div className="evidence-grid">
          {EVIDENCE_METRICS.map((metric) => (
            <div key={metric.label} className="evidence-card">
              <div className="evidence-card-label">{metric.label}</div>
              <div className="evidence-card-value">{metric.value}</div>
              <div className="evidence-card-source">{metric.source}</div>
              <div className="evidence-card-detail">{metric.detail}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 24 }} aria-label="Mode atlas 覆盖">
        <h2 style={{ fontSize: 16 }}>Mode atlas 覆盖</h2>
        <p style={{ fontSize: 14 }}>
          mode atlas 是离线抽取出的食材街区，不是全集分类表。不同模型的覆盖数量和最大街区不同，
          所以查不到街区时不能说明食材没有风味关系。
        </p>
        <div className="evidence-grid">
          {MODE_ATLAS_SUMMARY.map((entry) => (
            <div key={entry.model} className="evidence-card">
              <div className="evidence-card-label">{entry.label}</div>
              <div className="evidence-card-value">{entry.value}</div>
              <div className="evidence-card-source">{entry.source}</div>
              <div className="evidence-card-detail">{entry.detail}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 24 }} aria-label="本地化别名覆盖">
        <h2 style={{ fontSize: 16 }}>本地化别名覆盖</h2>
        <p style={{ fontSize: 14 }}>
          这些是当前输入匹配使用的别名表覆盖，不等同于全部 1,790 个 canonical 食材都已完成多语言本地化。
        </p>
        <div className="evidence-grid">
          {ALIAS_COVERAGE.map((entry) => (
            <div key={entry.language} className="evidence-card">
              <div className="evidence-card-label">{entry.label}</div>
              <div className="evidence-card-value">{entry.value}</div>
              <div className="evidence-card-source">{entry.source}</div>
              <div className="evidence-card-detail">{entry.detail}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 24 }} aria-label="实验风格方向">
        <h2 style={{ fontSize: 16 }}>实验风格方向</h2>
        <p style={{ fontSize: 14 }}>
          换风格使用的是产品层 seed set 向量插值：每个方向由少量代表食材平均成目标向量。
          论文的 SLERP direction arithmetic 只作为方向可行性的参考证据，不作为当前候选列表的预计算来源。
        </p>
        <div className="evidence-grid">
          {Object.entries(STYLE_SEED_SETS).map(([style, seeds]) => (
            <div key={style} className="evidence-card">
              <div className="evidence-card-label">{STYLE_LABELS[style] ?? style}</div>
              <div className="evidence-card-value">{seeds.length} seeds</div>
              <div className="evidence-card-source">style_seed_sets.json</div>
              <div className="evidence-card-detail">{seeds.join(" / ")}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 24 }} aria-label="线性探针">
        <h2 style={{ fontSize: 16 }}>线性探针</h2>
        <p style={{ fontSize: 14 }}>
          linear probes 检查简单线性模型能否从 embedding 中读出外部标签。
          高 F1 支持可解释导航，低一些的维度则提醒产品不要过度承诺。
        </p>
        <div className="evidence-grid">
          {LINEAR_PROBE_EVIDENCE.map((entry) => (
            <div key={entry.label} className="evidence-card">
              <div className="evidence-card-label">{entry.label}</div>
              <div className="evidence-card-value">{entry.value}</div>
              <div className="evidence-card-source">{entry.source}</div>
              <div className="evidence-card-detail">{entry.detail}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 24 }} aria-label="连续探针">
        <h2 style={{ fontSize: 16 }}>连续探针</h2>
        <p style={{ fontSize: 14 }}>
          continuous probes 检查风味和营养连续维度能否从 embedding 中被线性读出。
          它更适合做解释和边界判断，不适合作为硬过滤。
        </p>
        <div className="evidence-grid">
          {CONTINUOUS_PROBE_EVIDENCE.map((entry) => (
            <div key={entry.label} className="evidence-card">
              <div className="evidence-card-label">{entry.label}</div>
              <div className="evidence-card-value">{entry.value}</div>
              <div className="evidence-card-source">{entry.source}</div>
              <div className="evidence-card-detail">{entry.detail}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 24 }} aria-label="跨模态验证">
        <h2 style={{ fontSize: 16 }}>跨模态验证</h2>
        <p style={{ fontSize: 14 }}>
          cross-modal validation 把 embedding 维度和外部 USDA / ChemFlavor 指标做相关性检查。
          它证明空间里有可解释信号，但不等于当前产品具备营养或医疗级判断能力。
        </p>
        <div className="evidence-grid">
          {CROSS_MODAL_EVIDENCE.map((entry) => (
            <div key={entry.label} className="evidence-card">
              <div className="evidence-card-label">{entry.label}</div>
              <div className="evidence-card-value">{entry.value}</div>
              <div className="evidence-card-source">{entry.source}</div>
              <div className="evidence-card-detail">{entry.detail}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 24 }} aria-label="WEAT 关联检查">
        <h2 style={{ fontSize: 16 }}>WEAT 关联检查</h2>
        <p style={{ fontSize: 14 }}>
          论文补充数据里的 WEAT 检查显示了 embedding 中的语义关联和潜在偏差。
          这些结果用于限制产品表达，不用于生成推荐。
        </p>
        <div className="evidence-grid">
          {WEAT_CHECKS.map((check) => (
            <div key={check.label} className="evidence-card">
              <div className="evidence-card-label">{check.label}</div>
              <div className="evidence-card-value">{check.value}</div>
              <div className="evidence-card-source">{check.source}</div>
              <div className="evidence-card-detail">{check.detail}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 24 }} aria-label="数据来源">
        <h2 style={{ fontSize: 16 }}>数据来源</h2>
        <p style={{ fontSize: 14 }}>
          This product uses ingredient embeddings and related artifacts from:
        </p>
        <p style={{ fontSize: 14, fontStyle: "italic" }}>
          Radzikowski, J. & Chen, J. (2026). Epicure: Navigating the Emergent Geometry
          of Food Ingredient Embeddings. arXiv:2605.22391.
        </p>
        <p style={{ fontSize: 14 }}>
          The original research artifacts are licensed under CC BY 4.0.
          We have processed the released CSV files for browser-side retrieval,
          visualization, and interactive recommendation.
        </p>
      </section>

      <section style={{ marginBottom: 24 }} aria-label="独立性声明">
        <h2 style={{ fontSize: 16 }}>独立性声明</h2>
        <p style={{ fontSize: 14 }}>
          This product is independent and is not affiliated with, sponsored by,
          or endorsed by the original authors or KAIKAKU.AI.
        </p>
      </section>

      <section style={{ marginBottom: 24 }} aria-label="功能限制">
        <h2 style={{ fontSize: 16 }}>功能限制</h2>
        <ul style={{ fontSize: 14, paddingLeft: 20 }}>
          {PRODUCT_LIMITS.map((limit) => (
            <li key={limit}>{limit}</li>
          ))}
        </ul>
      </section>

      <section aria-label="技术栈">
        <h2 style={{ fontSize: 16 }}>技术栈</h2>
        <p style={{ fontSize: 14 }}>
          Vite · React · TypeScript · Capacitor · Zustand · Web Worker
        </p>
      </section>
    </div>
  );
}
