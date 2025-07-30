import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Sidebar from "@/components/sidebar";
import Dashboard from "@/pages/dashboard";
import ContractForm from "@/pages/contract-form";
import Contracts from "@/pages/contracts";
import Templates from "@/pages/templates";
import Beneficiaries from "@/pages/beneficiaries";
import Profile from "@/pages/profile";
import Settings from "@/pages/settings";
import SignContract from "@/pages/sign-contract";
import SignedContract from "@/pages/signed-contract";
import NotFound from "@/pages/not-found";

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 main-container">
        {children}
      </main>
    </div>
  );
}

function Router() {
  const [location] = useLocation();
  
  // Check if it's a public page (signing or signed contract)
  const isPublicPage = location.startsWith('/sign-contract/') || location.startsWith('/signed-contract/');
  
  if (isPublicPage) {
    return (
      <Switch>
        <Route path="/sign-contract/:token" component={SignContract} />
        <Route path="/signed-contract/:token" component={SignedContract} />
      </Switch>
    );
  }
  
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/contract-form" component={ContractForm} />
        <Route path="/contracts" component={Contracts} />
        <Route path="/templates" component={Templates} />
        <Route path="/partners" component={Beneficiaries} />
        <Route path="/profile" component={Profile} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
