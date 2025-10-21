import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { applyThemePreferences, loadThemePreferences } from "@/lib/theme";

// Apply saved theme asap
try {
  const prefs = loadThemePreferences();
  applyThemePreferences(prefs);
} catch {}

createRoot(document.getElementById("root")!).render(<App />);
