import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import ContractForm from "@/pages/contract-form";
import Contracts from "@/pages/contracts";
import Templates from "@/pages/templates";
import Beneficiaries from "@/pages/beneficiaries";
import OrderReservations from "@/pages/order-reservations";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/contract-form" component={ContractForm} />
      <Route path="/contracts" component={Contracts} />
      <Route path="/templates" component={Templates} />
      <Route path="/beneficiaries" component={Beneficiaries} />
      <Route path="/order-reservations" component={OrderReservations} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
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
