import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { FormatRegistry } from "./core/formats/FormatRegistry";
import ilbmPlugin from "./formats/ilbm/ilbmPlugin";

const registry = new FormatRegistry();
registry.register(ilbmPlugin);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App registry={registry} />
  </StrictMode>,
);
