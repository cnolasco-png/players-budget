import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// ⬇️ CHANGED: use HashRouter instead of BrowserRouter
import { HashRouter as Router, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";

const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Sheets = lazy(() => import("./pages/Sheets"));
const Editor = lazy(() => import("./pages/Editor"));
const BudgetDetail = lazy(() => import("./pages/BudgetDetail"));
const Settings = lazy(() => import("./pages/Settings"));
const PlayerX = lazy(() => import("./pages/PlayerX"));
const ChatSupportWidget = lazy(() => import("./components/support/ChatSupportWidget"));

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div className="flex min-h-[240px] items-center justify-center text-muted-foreground">
    Loading…
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      {/* ⬇️ CHANGED: wrap routes in <Router> (HashRouter) */}
      <Router>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/sheets" element={<Sheets />} />
            <Route path="/editor" element={<Editor />} />
            <Route path="/budget/:id" element={<BudgetDetail />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/playerx" element={<PlayerX />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Router>

      <Suspense fallback={null}>
        <ChatSupportWidget />
      </Suspense>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
