import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import TreeDetails from "@/pages/TreeDetails";
import Blog from "@/pages/Blog";
import Categories from "@/pages/Categories";
import CategoryDetail from "@/pages/CategoryDetail";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Categories} />
          <Route path="/blog" component={Blog} />
          <Route path="/category/:id" component={CategoryDetail} />
          <Route path="/trees" component={Home} />
          <Route path="/tree/:id" component={TreeDetails} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
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
