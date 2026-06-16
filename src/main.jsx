import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { warmupAndPrefetch } from "./services/cache.js";

// Fire immediately — wakes Render backend from cold sleep and pre-loads
// members + meetups data in parallel with the auth check.
warmupAndPrefetch();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
