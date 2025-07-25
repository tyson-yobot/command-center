// client/src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { StrictMode } from "react";
import CommandCenter from "./modules/command-center/CommandCenter";
import "./index.css"; // or "./global.css" if you're using that instead

const root = document.getElementById("root") as HTMLElement;

ReactDOM.createRoot(root).render(
  <StrictMode>
    <CommandCenter />
  </StrictMode>
);
