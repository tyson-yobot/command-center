import React, { createContext, useContext, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch } from "wouter";
import ClientDashboard from "./pages/client-dashboard";
import LeadScrapingPage from "./pages/lead-scraping-page";
import ControlCenterPage from "./pages/control-center-page";

// Test/Live Mode Context for synchronized mode across all screens
interface ModeContextType {
  isTestMode: boolean;
  setTestMode: (isTest: boolean) => void;
}

const ModeContext = createContext<ModeContextType>({
  isTestMode: false,
  setTestMode: () => {},
});

export const useModeContext = () => useContext(ModeContext);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function Router() {
  const [isTestMode, setTestMode] = useState(false);

  return (
    <ModeContext.Provider value={{ isTestMode, setTestMode }}>
      <div className="min-h-screen">
        <Switch>
          <Route path="/" component={ClientDashboard} />
          <Route path="/command-center" component={ClientDashboard} />
          <Route path="/control-center" component={ControlCenterPage} />
          <Route path="/lead-scraping" component={LeadScrapingPage} />
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
    </ModeContext.Provider>
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