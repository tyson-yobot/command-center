// client/src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { StrictMode } from "react";
import { Router, Route, Switch } from "wouter";
import CommandCenter from "./modules/command-center/CommandCenter";
import LeadScraper from "./pages/Lead-Scraper/lead-scraper-broken";
import "./index.css"; // or "./global.css" if you're using that instead

const root = document.getElementById("root") as HTMLElement;

ReactDOM.createRoot(root).render(
  <StrictMode>
    <Router>
      <Switch>
        <Route path="/" component={CommandCenter} />
        <Route path="/command-center" component={CommandCenter} />
        <Route path="/lead-scraper" component={LeadScraper} />
        <Route>
          <CommandCenter />
        </Route>
      </Switch>
    </Router>
  </StrictMode>
);
