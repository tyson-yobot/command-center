import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import Conversations from "@/pages/conversations";
import Controls from "@/pages/controls";
import CRM from "@/pages/crm";
import Reports from "@/pages/reports";
import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";
import InstallPrompt from "@/components/pwa/install-prompt";
import { PWAProvider } from "@/hooks/use-pwa";
import { WebSocketProvider } from "@/hooks/use-websocket";
import { ThemeProvider } from "@/hooks/use-theme";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-36 pb-20">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/conversations" component={Conversations} />
          <Route path="/controls" component={Controls} />
          <Route path="/crm" component={CRM} />
          <Route path="/reports" component={Reports} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <BottomNav />
      <InstallPrompt />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider defaultTheme="light" storageKey="yobot-ui-theme">
          <PWAProvider>
            <WebSocketProvider>
              <Toaster />
              <Router />
            </WebSocketProvider>
          </PWAProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
