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
import Scanner from "@/pages/scanner";

import ClientDashboard from "@/pages/client-dashboard";
import DemoMode from "@/pages/demo";

import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";
import InstallPrompt from "@/components/pwa/install-prompt";
import CriticalAlertOverlay from "@/components/critical-alert-overlay";
import { PWAProvider } from "@/hooks/use-pwa";
import { WebSocketProvider } from "@/hooks/use-websocket";
import { ThemeProvider } from "@/hooks/use-theme";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen bg-background">
      <Switch>
        <Route path="/">
          <ClientDashboard />
        </Route>
        <Route path="/admin">
          <ClientDashboard />
        </Route>
        <Route path="/dashboard">
          <ClientDashboard />
        </Route>
        <Route path="/demo">
          <DemoMode />
        </Route>
        <Route path="/mobile">
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            <Header />
            <main className="pt-36 pb-20">
              <Dashboard />
            </main>
            <BottomNav />
            <InstallPrompt />
          </div>
        </Route>
        <Route path="/mobile/conversations">
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            <Header />
            <main className="pt-36 pb-20">
              <Conversations />
            </main>
            <BottomNav />
            <InstallPrompt />
          </div>
        </Route>
        <Route path="/mobile/controls">
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            <Header />
            <main className="pt-36 pb-20">
              <Controls />
            </main>
            <BottomNav />
            <InstallPrompt />
          </div>
        </Route>
        <Route path="/mobile/crm">
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            <Header />
            <main className="pt-36 pb-20">
              <CRM />
            </main>
            <BottomNav />
            <InstallPrompt />
          </div>
        </Route>
        <Route path="/mobile/reports">
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            <Header />
            <main className="pt-36 pb-20">
              <Reports />
            </main>
            <BottomNav />
            <InstallPrompt />
          </div>
        </Route>
        <Route path="/mobile/scanner">
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            <Header />
            <main className="pt-36 pb-20">
              <Scanner />
            </main>
            <BottomNav />
            <InstallPrompt />
          </div>
        </Route>
        <Route path="/mobile/*">
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            <Header />
            <main className="pt-36 pb-20">
              <NotFound />
            </main>
            <BottomNav />
            <InstallPrompt />
          </div>
        </Route>
      </Switch>
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
              <CriticalAlertOverlay />
              <Router />
            </WebSocketProvider>
          </PWAProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
