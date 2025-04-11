
import { Link, useLocation } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { cn } from "@/lib/utils";
import { useEstabelecimentoConfig } from "@/hooks/useEstabelecimentoConfig";
import {
  LayoutDashboard,
  Coffee,
  Utensils,
  ShoppingCart,
  Package,
  CreditCard,
  Truck,
  Users,
  Settings,
  Menu,
  Store,
  Database,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile"; 
import { Button } from "@/components/ui/button";

export const Sidebar = () => {
  const { hasRole } = useUser();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { config } = useEstabelecimentoConfig();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: <LayoutDashboard className="h-5 w-5" />,
      roles: ["admin", "waiter", "kitchen", "cashier", "customer"],
    },
    {
      name: "Mesas",
      path: "/tables",
      icon: <Coffee className="h-5 w-5" />,
      roles: ["admin", "waiter"],
    },
    {
      name: "Cardápio",
      path: "/menu",
      icon: <Utensils className="h-5 w-5" />,
      roles: ["admin", "waiter", "customer"],
    },
    {
      name: "Pedidos",
      path: "/orders",
      icon: <ShoppingCart className="h-5 w-5" />,
      roles: ["admin", "waiter", "kitchen", "cashier", "customer"],
    },
    {
      name: "Estoque",
      path: "/inventory",
      icon: <Package className="h-5 w-5" />,
      roles: ["admin"],
    },
    {
      name: "Checkout",
      path: "/checkout",
      icon: <CreditCard className="h-5 w-5" />,
      roles: ["admin", "cashier", "waiter"],
    },
    {
      name: "Delivery",
      path: "/delivery",
      icon: <Truck className="h-5 w-5" />,
      roles: ["admin", "customer", "waiter", "kitchen"],
    },
    {
      name: "Usuários",
      path: "/users",
      icon: <Users className="h-5 w-5" />,
      roles: ["admin"],
    },
    {
      name: "Configuração",
      path: "/configuracao",
      icon: <Settings className="h-5 w-5" />,
      roles: ["admin"],
    },
    {
      name: "Config. Lanchonete",
      path: "/configuracao-lanchonete",
      icon: <Store className="h-5 w-5" />,
      roles: ["admin"],
    },
    {
      name: "Firebase Admin",
      path: "/firebase-admin",
      icon: <Database className="h-5 w-5" />,
      roles: ["admin"],
    },
  ];

  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-sidebar z-50 border-t pt-2 pb-6">
        <div className="flex justify-around px-2">
          {navItems
            .filter((item) => hasRole(item.roles as any))
            .map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center text-xs space-y-1 px-1",
                  isActive(item.path)
                    ? "text-sidebar-primary"
                    : "text-sidebar-foreground hover:text-sidebar-primary"
                )}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          <div className="inline-flex">
            <Link to="/">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 text-sidebar-foreground border-sidebar-border"
              >
                <Menu className="h-4 w-4" />
                <span className="sr-only">Menu</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-full">
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          {config.logoUrl && (
            <img 
              src={config.logoUrl} 
              alt="Logo" 
              className="w-8 h-8 object-contain"
            />
          )}
          <div>
            <h2 className="font-bold text-sidebar-foreground truncate">
              {config.nome || "Sabor Express"}
            </h2>
            <p className="text-xs text-sidebar-foreground/70 truncate">
              {config.slogan || "O melhor sabor da cidade"}
            </p>
          </div>
        </div>
      </div>
      <nav className="flex-1 py-6 px-3 space-y-1">
        {navItems
          .filter((item) => hasRole(item.roles as any))
          .map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm",
                isActive(item.path)
                  ? "bg-sidebar-primary/10 text-sidebar-primary font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:font-medium"
              )}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
      </nav>
    </aside>
  );
};

