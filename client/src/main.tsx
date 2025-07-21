// client/src/main.tsx
import ReactDOM from "react-dom/client";
import { StrictMode } from "react";
import { useRoute } from "wouter";

import CommandCenter from "@/pages/Command-Center/command-center";
import "./index.css";

const root = document.getElementById("root") as HTMLElement;

function App() {
  const [isRoot] = useRoute("/");
  const [isCommandCenter] = useRoute("/command-center");
  
  return <CommandCenter />;
}

ReactDOM.createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
