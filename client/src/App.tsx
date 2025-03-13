import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/home";
import Products from "@/pages/admin/products";
import Categories from "@/pages/admin/categories";
import Orders from "@/pages/admin/orders";
import Settings from "@/pages/admin/settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/category/:slug" component={Home} />
      <Route path="/admin/products" component={Products} />
      <Route path="/admin/categories" component={Categories} />
      <Route path="/admin/orders" component={Orders} />
      <Route path="/admin/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;