
import React from "react";
import { Bell, Settings, LogOut } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const TopBar = () => {
  const { user, logout } = useUser();
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  // Função para traduzir o nome da página
  const getPageName = (path: string) => {
    if (path === "/") return "Dashboard";
    const pathMap: Record<string, string> = {
      "/tables": "Mesas",
      "/menu": "Cardápio",
      "/orders": "Pedidos",
      "/inventory": "Estoque",
      "/checkout": "Caixa",
      "/delivery": "Delivery"
    };
    return pathMap[path] || path.substring(1).charAt(0).toUpperCase() + path.substring(2);
  };

  return (
    <div className="h-16 border-b border-border bg-background flex items-center justify-between px-4 md:px-6">
      <div>
        <h2 className="font-semibold text-lg">
          {getPageName(window.location.pathname)}
        </h2>
      </div>
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <Bell size={20} />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user ? getInitials(user.name) : "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground capitalize">
                  {user?.role === "admin" ? "Administrador" : 
                   user?.role === "waiter" ? "Garçom" :
                   user?.role === "kitchen" ? "Cozinha" :
                   user?.role === "cashier" ? "Caixa" :
                   user?.role === "customer" ? "Cliente" : user?.role}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
