import { useEffect, useState } from "react";
import { initEngine } from "../engine";
import { useAppStore } from "../store/app-store";

export function useEngine() {
  const [error, setError] = useState<string | null>(null);
  const engineReady = useAppStore((s) => s.engineReady);
  const setEngineReady = useAppStore((s) => s.setEngineReady);

  useEffect(() => {
    initEngine()
      .then(() => setEngineReady(true))
      .catch((e) => setError(`Failed to load engine: ${e.message}`));
  }, [setEngineReady]);

  return { engineReady, error };
}
