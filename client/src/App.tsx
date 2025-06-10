import React, { createContext, useContext, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch } from "wouter";
import CommandCenter from "./pages/Command-Center/command-center";
import LeadScraper from "./pages/Lead-Scraper/lead-scraper";
import ControlCenter from "./pages/Control-Center/control-center";
import Mobile from "./pages/Mobile/mobile";




// Live mode only - no test mode context needed

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function Router() {
  return (
    <div className="min-h-screen">
      <Switch>
        <Route path="/command-center" component={CommandCenter} />
        <Route path="/control-center" component={ControlCenter} />
        <Route path="/lead-scraper" component={LeadScraper} />
        <Route path="/mobile" component={Mobile} />


        <Route path="/" component={CommandCenter} />
        <Route>
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">404 - Page Not Found</h1>
              <p className="text-blue-200">The page you're looking for doesn't exist.</p>
            </div>
          </div>
        </Route>
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  );
}

export default App;