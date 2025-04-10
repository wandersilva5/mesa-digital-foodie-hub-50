
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser, UserRole } from "@/contexts/UserContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";

const LoginPage = () => {
  const { login, users } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("customer");
  const [loginType, setLoginType] = useState<"standard" | "email">("standard");
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loginType === "standard") {
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

      // Verifica se o usuário existe para funções diferentes de cliente
      if (role !== "customer") {
        const existingUser = users.find(
          u => u.name.toLowerCase() === username.toLowerCase() && u.role === role
        );
        
        if (!existingUser) {
          toast({
            title: "Erro",
            description: "Usuário não encontrado com esta função. Apenas administradores podem criar novas contas.",
            variant: "destructive",
          });
          return;
        }
        
        login(existingUser);
        
        toast({
          title: "Sucesso",
          description: `Logado como ${existingUser.name} (${role})`,
        });
      } else {
        // Para clientes, permite login simplificado
        login({
          id: Math.random().toString(36).substring(2, 9),
          name: username,
          role: role,
        });
        
        toast({
          title: "Sucesso",
          description: `Logado como ${username} (Cliente)`,
        });
      }
    } else if (loginType === "email") {
      if (!email.trim()) {
        toast({
          title: "Erro",
          description: "Por favor, insira seu email",
          variant: "destructive",
        });
        return;
      }
      
      // Verificar o email contra a lista de usuários
      const userByEmail = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
      
      if (!userByEmail) {
        toast({
          title: "Erro",
          description: "Email não encontrado. Entre em contato com o administrador.",
          variant: "destructive",
        });
        return;
      }
      
      login(userByEmail);
      
      toast({
        title: "Sucesso",
        description: `Logado como ${userByEmail.name} (${userByEmail.role})`,
      });
    }
    
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
              <div className="flex justify-center space-x-4 mb-2">
                <Button
                  type="button"
                  variant={loginType === "standard" ? "default" : "outline"}
                  onClick={() => setLoginType("standard")}
                  className="w-full"
                >
                  Login padrão
                </Button>
                <Button
                  type="button"
                  variant={loginType === "email" ? "default" : "outline"}
                  onClick={() => setLoginType("email")}
                  className="w-full"
                >
                  Login por email
                </Button>
              </div>
              
              {loginType === "standard" ? (
                <>
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
                </>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Digite seu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              )}
              
              <Button type="submit" className="w-full">Entrar</Button>
              
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-card px-2 text-muted-foreground text-sm">
                    ou
                  </span>
                </div>
              </div>
              
              <GoogleLoginButton />
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
