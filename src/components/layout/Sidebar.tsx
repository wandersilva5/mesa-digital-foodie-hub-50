
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Utensils, 
  ClipboardList, 
  ShoppingCart, 
  Package, 
  CreditCard, 
  Truck,
  QrCode,
  Menu,
  X
} from "lucide-react";

export const Sidebar = () => {
  const { hasRole } = useUser();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  
  const toggleSidebar = () => setCollapsed(!collapsed);
  
  const navItems = [
    { 
      name: "Dashboard", 
      path: "/", 
      icon: <LayoutDashboard size={20} />, 
      roles: ["admin", "waiter", "cashier", "kitchen"] 
    },
    { 
      name: "Mesas", 
      path: "/tables", 
      icon: <QrCode size={20} />, 
      roles: ["admin", "waiter"] 
    },
    { 
      name: "Cardápio", 
      path: "/menu", 
      icon: <Utensils size={20} />, 
      roles: ["admin", "customer", "waiter"] 
    },
    { 
      name: "Pedidos", 
      path: "/orders", 
      icon: <ClipboardList size={20} />, 
      roles: ["admin", "waiter", "kitchen", "cashier", "customer"] 
    },
    { 
      name: "Estoque", 
      path: "/inventory", 
      icon: <Package size={20} />, 
      roles: ["admin"] 
    },
    { 
      name: "Caixa", 
      path: "/checkout", 
      icon: <CreditCard size={20} />, 
      roles: ["admin", "cashier", "waiter"] 
    },
    { 
      name: "Delivery", 
      path: "/delivery", 
      icon: <Truck size={20} />, 
      roles: ["admin", "customer", "waiter", "kitchen"] 
    },
  ];
  
  return (
    <aside 
      className={`relative bg-sidebar border-r border-border transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!collapsed && (
          <h1 className="font-bold text-xl text-primary">FoodieHub</h1>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar}
          className="ml-auto"
        >
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </Button>
      </div>
      
      <nav className="p-2">
        <ul className="space-y-1">
          {navItems.map((item) => 
            hasRole(item.roles as any) ? (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                    location.pathname === item.path
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-muted'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              </li>
            ) : null
          )}
        </ul>
      </nav>
    </aside>
  );
};
