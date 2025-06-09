import React, { createContext, useContext, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch } from "wouter";
import ClientDashboard from "./pages/client-dashboard";

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
          <Route path="/command-center" component={ClientDashboard} />
          <Route path="/" component={() => <div style={{display: 'none'}}></div>} />
          <Route>
            {() => {
              window.location.href = '/command-center';
              return <div style={{display: 'none'}}></div>;
            }}
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