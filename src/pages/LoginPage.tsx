
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser, UserRole } from "@/contexts/UserContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const LoginPage = () => {
  const { login } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<UserRole>("customer");
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira seu nome",
        variant: "destructive",
      });
      return;
    }
    
    if (!role) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma função",
        variant: "destructive",
      });
      return;
    }
    
    // Em um app real, isso seria uma autenticação de verdade
    login({
      id: Math.random().toString(36).substring(2, 9),
      name: username,
      role: role,
    });
    
    toast({
      title: "Sucesso",
      description: `Logado como ${username} (${role})`,
    });
    
    navigate("/");
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <div className="w-full max-w-md px-4">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">FoodieHub</CardTitle>
            <CardDescription className="text-center">
              Digite seus dados para entrar na sua conta
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nome</Label>
                <Input
                  id="username"
                  placeholder="Digite seu nome"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Função</Label>
                <Select 
                  value={role || ""} 
                  onValueChange={(value) => setRole(value as UserRole)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione sua função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="customer">Cliente</SelectItem>
                    <SelectItem value="waiter">Garçom</SelectItem>
                    <SelectItem value="cashier">Caixa</SelectItem>
                    <SelectItem value="kitchen">Cozinha</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">Entrar</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
