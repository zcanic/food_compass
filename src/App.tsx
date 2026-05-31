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
      <nav className="top-nav" aria-label="Primary">
        <button
          onClick={() => setPage("home")}
          className={`nav-button ${page === "home" ? "active" : ""}`}
        >
          工作台
        </button>
        <button
          onClick={() => setPage("about")}
          className={`nav-button ${page === "about" ? "active" : ""}`}
        >
          关于
        </button>
      </nav>
      {page === "home" ? <HomePage /> : <AboutPage />}
    </AppShell>
  );
}
