import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { UserAuthProvider } from "@/contexts/UserAuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import UserProtectedRoute from "@/components/UserProtectedRoute";

import Home from "@/pages/Home";
import Menu from "@/pages/Menu";
import Order from "@/pages/Order";
import Offers from "@/pages/Offers";
import Catering from "@/pages/Catering";
import Feedback from "@/pages/Feedback";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";

import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminMenu from "@/pages/admin/AdminMenu";
import AdminFeedback from "@/pages/admin/AdminFeedback";
import AdminOffers from "@/pages/admin/AdminOffers";
import AdminCatering from "@/pages/admin/AdminCatering";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminManageOrders from "@/pages/admin/AdminManageOrders";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={Home} />
      <Route path="/menu" component={Menu} />
      <Route path="/offers" component={Offers} />
      <Route path="/login" component={Login} />

      {/* Requires user login */}
      <Route path="/order">
        {() => (
          <UserProtectedRoute>
            <Order />
          </UserProtectedRoute>
        )}
      </Route>
      <Route path="/catering">
        {() => (
          <UserProtectedRoute>
            <Catering />
          </UserProtectedRoute>
        )}
      </Route>
      <Route path="/feedback">
        {() => (
          <UserProtectedRoute>
            <Feedback />
          </UserProtectedRoute>
        )}
      </Route>

      {/* Admin */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin">
        {() => (
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/manage-orders">
        {() => (
          <ProtectedRoute>
            <AdminManageOrders />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/orders">
        {() => (
          <ProtectedRoute>
            <AdminOrders />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/menu">
        {() => (
          <ProtectedRoute>
            <AdminMenu />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/feedback">
        {() => (
          <ProtectedRoute>
            <AdminFeedback />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/offers">
        {() => (
          <ProtectedRoute>
            <AdminOffers />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/catering">
        {() => (
          <ProtectedRoute>
            <AdminCatering />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/users">
        {() => (
          <ProtectedRoute>
            <AdminUsers />
          </ProtectedRoute>
        )}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <UserAuthProvider>
            <CartProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <Router />
              </WouterRouter>
              <Toaster />
            </CartProvider>
          </UserAuthProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
