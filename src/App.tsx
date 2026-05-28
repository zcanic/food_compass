import { AppShell } from "./components/layout/AppShell";
import { HomePage } from "./pages/HomePage";
import { AboutPage } from "./pages/AboutPage";
import { useEngine } from "./hooks/useEngine";
import { useState } from "react";

type Page = "home" | "about";

export default function App() {
  const { engineReady, error } = useEngine();
  const [page, setPage] = useState<Page>("home");

  if (error) {
    return (
      <AppShell>
        <div style={{ padding: 40, textAlign: "center", color: "#c33" }}>
          <h2>加载失败</h2>
          <p>{error}</p>
        </div>
      </AppShell>
    );
  }

  if (!engineReady) {
    return (
      <AppShell>
        <div style={{ padding: 40, textAlign: "center", color: "#999" }}>
          加载中...
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <nav style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        <button
          onClick={() => setPage("home")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 14,
            color: page === "home" ? "#2a7" : "#666",
            fontWeight: page === "home" ? 600 : 400,
          }}
        >
          探索
        </button>
        <button
          onClick={() => setPage("about")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 14,
            color: page === "about" ? "#2a7" : "#666",
            fontWeight: page === "about" ? 600 : 400,
          }}
        >
          关于
        </button>
      </nav>
      {page === "home" ? <HomePage /> : <AboutPage />}
    </AppShell>
  );
}
