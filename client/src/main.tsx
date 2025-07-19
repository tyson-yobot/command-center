
 // client/src/main.tsx
import ReactDOM from "react-dom/client";
import { StrictMode } from "react";import { Router, Route, Switch } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import CommandCenter from "@/pages/Command-Center/command-center";
import LeadScraper from "./pages/Lead-Scraper/lead-scraper-broken";
import "./index.css"; // or "./global.css" if you're using that instead

const queryClient = new QueryClient();const root = document.getElementById("root") as HTMLElement;

ReactDOM.createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Router>
        <Switch>
          <Route path="/" component={CommandCenter} />
          <Route path="/command-center" component={CommandCenter} />
          <Route path="/lead-scraper" component={LeadScraper} />
          <Route>
            <CommandCenter />
          </Route>
        </Switch>
      </Router>    </QueryClientProvider>
  </StrictMode>
);
