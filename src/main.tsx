import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { FormatRegistry } from "./core/formats/FormatRegistry";
import ilbmPlugin from "./formats/ilbm/ilbmPlugin";
import svxPlugin from "./formats/8svx/8svxPlugin";

const registry = new FormatRegistry();
registry.register(ilbmPlugin);
registry.register(svxPlugin);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App registry={registry} />
  </StrictMode>,
);
