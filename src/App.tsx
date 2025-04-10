
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider, useUser } from "@/contexts/UserContext";

// Layout
import { AppLayout } from "@/components/layout/AppLayout";

// Pages
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import TablesPage from "./pages/TablesPage";
import MenuPage from "./pages/MenuPage";
import OrdersPage from "./pages/OrdersPage";
import InventoryPage from "./pages/InventoryPage";
import CheckoutPage from "./pages/CheckoutPage";
import DeliveryPage from "./pages/DeliveryPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useUser();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Role-based route component
const RoleRoute = ({ 
  children, 
  allowedRoles 
}: { 
  children: JSX.Element, 
  allowedRoles: string[] 
}) => {
  const { isAuthenticated, hasRole } = useUser();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!hasRole(allowedRoles as any)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AppLayout />}>
        {/* Protected routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tables" 
          element={
            <RoleRoute allowedRoles={["admin", "waiter"]}>
              <TablesPage />
            </RoleRoute>
          } 
        />
        <Route 
          path="/menu" 
          element={
            <RoleRoute allowedRoles={["admin", "waiter", "customer"]}>
              <MenuPage />
            </RoleRoute>
          } 
        />
        <Route 
          path="/orders" 
          element={
            <RoleRoute allowedRoles={["admin", "waiter", "kitchen", "cashier", "customer"]}>
              <OrdersPage />
            </RoleRoute>
          } 
        />
        <Route 
          path="/inventory" 
          element={
            <RoleRoute allowedRoles={["admin"]}>
              <InventoryPage />
            </RoleRoute>
          } 
        />
        <Route 
          path="/checkout" 
          element={
            <RoleRoute allowedRoles={["admin", "cashier", "waiter"]}>
              <CheckoutPage />
            </RoleRoute>
          } 
        />
        <Route 
          path="/delivery" 
          element={
            <RoleRoute allowedRoles={["admin", "customer", "waiter", "kitchen"]}>
              <DeliveryPage />
            </RoleRoute>
          } 
        />
        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </UserProvider>
  </QueryClientProvider>
);

export default App;
