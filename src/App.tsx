import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter as Router, Routes, Route, Link } from "react-router-dom";

import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import AuthCallback from "./pages/AuthCallback";
import Auth from "./pages/Auth";
import SeasonDashboard from "./pages/SeasonDashboard";
import Onboarding from "./pages/Onboarding";
import Sheets from "./pages/Sheets";
import EditorTest from "./pages/EditorTest";
import BudgetDetail from "./pages/BudgetDetail";
import Settings from "./pages/SettingsClean";
import PlayerX from "./pages/PlayerX";
import SponsorsTool from "./pages/SponsorsTool";
import ChatSupportWidget from "./components/support/ChatSupportWidget";
import Pricing from "./pages/Pricing";
import Claim from "./pages/Claim";
import Expenses from "./pages/Expenses";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      
      <Router>


        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/dashboard" element={<SeasonDashboard />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/sheets" element={<Sheets />} />
          <Route path="/editor" element={<EditorTest />} />
          <Route path="/budget/:id" element={<BudgetDetail />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/playerx" element={<PlayerX />} />
          <Route path="/sponsors/tool" element={<SponsorsTool />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/claim" element={<Claim />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>

      <Suspense fallback={null}>
        <ChatSupportWidget />
      </Suspense>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
