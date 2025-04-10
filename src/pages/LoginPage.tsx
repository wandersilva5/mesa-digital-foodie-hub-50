
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/contexts/UserContext";
import { Separator } from "@/components/ui/separator";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";
import { Loader2 } from "lucide-react";

const LoginPage = () => {
  const { login, isAuthenticated, user, loading } = useUser();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Redireciona o usuário com base no perfil após autenticação
  useEffect(() => {
    if (isAuthenticated && user) {
      // Redireciona com base no perfil
      switch (user.role) {
        case "admin":
          navigate("/");
          break;
        case "waiter":
          navigate("/tables");
          break;
        case "cashier":
          navigate("/checkout");
          break;
        case "kitchen":
          navigate("/orders");
          break;
        case "customer":
          navigate("/menu");
          break;
        default:
          navigate("/");
      }
    }
  }, [isAuthenticated, user, navigate]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      await login(email, password);
      // Redirecionamento é feito no useEffect acima
    } catch (error) {
      // Erro tratado no contexto de usuário
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Se o usuário já estiver autenticado, não exibe a tela de login
  if (isAuthenticated && !loading) {
    return null;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <div className="w-full max-w-md px-4">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">FoodieHub</CardTitle>
            <CardDescription className="text-center">
              Digite suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || isSubmitting}
              >
                {(loading || isSubmitting) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
              
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
